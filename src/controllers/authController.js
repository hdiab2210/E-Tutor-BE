const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID");

// Generate Access Token
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
    );
};

// SIGNUP
exports.signup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { firstName, lastName, username, email, password } = req.body;

        // check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword
        });

        const token = generateAccessToken(user);

        res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No User found with this email" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            message: "Login successful",
            token,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        // Verify token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
    }
};

// Find or create user
async function findOrCreateGoogleUser(profile) {
    let user = await User.findOne({ email: profile.email });

    if (!user) {
        user = await User.create({
            firstName: profile.given_name || profile.name,
            lastName: profile.family_name || "",
            username: profile.email.split("@")[0],
            email: profile.email,
            password: "google_oauth", // dummy password
        });
    }

    return user;
}

// google sign in
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        // 1. Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const profile = ticket.getPayload();

        // 2. Find or create user
        const user = await findOrCreateGoogleUser(profile);

        // 3. Generate your JWTs
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        const refreshToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        );

        // 4. Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // 5. Response
        res.json({
            message: "Google login successful",
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });

    } catch (err) {
        res.status(401).json({ message: "Invalid Google token" });
    }
};