const express = require("express");
const cors = require("cors");

const app = express();

const errorMiddleware = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const coursesRoutes = require("./routes/courseRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('src/uploads'));


app.use("/api/auth", authRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/categories", categoryRoutes);

app.use(errorMiddleware);


module.exports = app;