const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.use('src/uploads', express.static('uploads'));

// middlewares
const errorMiddleware = require("./middleware/error");

// register error middleware
app.use(errorMiddleware);

const authRoutes = require("./routes/authRoutes");
const coursesRoutes = require("./routes/courseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/categories", categoryRoutes);

module.exports = app;