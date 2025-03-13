const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 9000;
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// User Schema & Model
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// Leave Schema & Model
const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: "Pending" },
});

const Leave = mongoose.model("Leave", leaveSchema);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token." });
  }
};

// User Registration
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Leave Request (Authenticated)
app.post("/api/leave", authMiddleware, async (req, res) => {
  const { reason, startDate, endDate } = req.body;
  try {
    const leave = new Leave({ userId: req.userId, reason, startDate, endDate });
    await leave.save();
    res.status(201).json({ message: "Leave request submitted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leave Requests of Logged-in User (Authenticated)
app.get("/api/leave", authMiddleware, async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.userId });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Leave Requests of a Specific User (Admin Access)
app.get("/api/leave/:userId", async (req, res) => {
  try {
    const leaves = await Leave.find({ userId: req.params.userId });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Leave Request Status (Authenticated)
app.put("/api/leave/:leaveId", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.leaveId);
    if (!leave) return res.status(404).json({ error: "Leave request not found" });

    leave.status = status;
    await leave.save();
    res.json({ message: `Leave status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(` Port ${PORT} is already in use. Try another port.`);
    process.exit(1);
  }
});
