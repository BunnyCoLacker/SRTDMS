import User from "../models/User.js";
import Storage from "../models/Storage.js";

// GET /api/users
export const getUsers = async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users.map((u) => u.toSafeObject()));
};

// GET /api/users/report -> online/offline status report
export const getUsersReport = async (req, res) => {
  const users = await User.find().sort({ isOnline: -1, name: 1 });
  const storages = await Storage.find({}, "name allowedUsers isActive");

  const report = users.map((u) => {
    const assignedStorages = storages
      .filter((s) => s.allowedUsers.some((id) => id.equals(u._id)))
      .map((s) => ({ id: s._id, name: s.name, isActive: s.isActive }));
    return { ...u.toSafeObject(), assignedStorages };
  });

  res.json({
    totalUsers: users.length,
    online: users.filter((u) => u.isOnline).length,
    offline: users.filter((u) => !u.isOnline).length,
    users: report,
  });
};

// POST /api/users
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role === "admin" ? "admin" : "store_owner",
    });

    res.status(201).json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase().trim();
    if (password) user.password = password;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Remove the user from any storage allow-lists
    await Storage.updateMany({ allowedUsers: user._id }, { $pull: { allowedUsers: user._id } });

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};
