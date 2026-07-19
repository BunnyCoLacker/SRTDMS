import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Storage from "../models/Storage.js";

const MAX_LOGIN_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000;

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const now = Date.now();
    if (user.lockUntil && user.lockUntil > now) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((user.lockUntil.getTime() - now) / (60 * 1000)),
      );
      return res.status(429).json({
        message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes === 1 ? "" : "s"}.`,
        locked: true,
      });
    }

    if (user.lockUntil && user.lockUntil <= now) {
      user.loginAttempts = 0;
      user.lockUntil = null;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(now + LOCKOUT_DURATION_MS);
        await user.save();
        return res.status(429).json({
          message:
            "Too many failed login attempts. Your account is locked for 30 minutes.",
          locked: true,
        });
      }

      await user.save();
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      return res.status(401).json({
        message: `Invalid email or password. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`,
        attemptsLeft,
      });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "This account has been disabled by the admin" });
    }

    let storage = null;
    if (user.role === "store_owner") {
      storage = await Storage.findOne({
        allowedUsers: user._id,
        isActive: true,
      });
      if (!storage) {
        return res.status(403).json({
          message:
            "You don't have an active storage assigned yet. Please contact the admin to gain access.",
          blocked: true,
        });
      }
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
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
    storage = await Storage.findOne({
      allowedUsers: req.user._id,
      isActive: true,
    });
  }
  res.json({
    user: req.user.toSafeObject(),
    storage: storage ? { id: storage._id, name: storage.name } : null,
  });
};
