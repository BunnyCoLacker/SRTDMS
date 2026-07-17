import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Storage from "../models/Storage.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "This account has been disabled by the admin" });
    }

    let storage = null;
    if (user.role === "store_owner") {
      storage = await Storage.findOne({ allowedUsers: user._id, isActive: true });
      if (!storage) {
        return res.status(403).json({
          message:
            "You don't have an active storage assigned yet. Please contact the admin to gain access.",
          blocked: true,
        });
      }
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = signToken(user);
    res.json({
      token,
      user: user.toSafeObject(),
      storage: storage ? { id: storage._id, name: storage.name } : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastSeen = new Date();
    await req.user.save();
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};

export const getMe = async (req, res) => {
  let storage = null;
  if (req.user.role === "store_owner") {
    storage = await Storage.findOne({ allowedUsers: req.user._id, isActive: true });
  }
  res.json({
    user: req.user.toSafeObject(),
    storage: storage ? { id: storage._id, name: storage.name } : null,
  });
};
