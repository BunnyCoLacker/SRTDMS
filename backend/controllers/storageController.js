import Storage from "../models/Storage.js";
import User from "../models/User.js";

// GET /api/storages
export const getStorages = async (req, res) => {
  const storages = await Storage.find()
    .populate("allowedUsers", "name email isOnline")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });
  res.json(storages);
};

// POST /api/storages
export const createStorage = async (req, res) => {
  try {
    const { name, description, allowedUsers } = req.body;
    if (!name) return res.status(400).json({ message: "Storage name is required" });

    const exists = await Storage.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ message: "A storage with this name already exists" });

    if (allowedUsers && allowedUsers.length) {
      const validUsers = await User.find({ _id: { $in: allowedUsers }, role: "store_owner" });
      if (validUsers.length !== allowedUsers.length) {
        return res.status(400).json({ message: "One or more selected users are invalid" });
      }
    }

    const storage = await Storage.create({
      name: name.trim(),
      description: description || "",
      allowedUsers: allowedUsers || [],
      createdBy: req.user._id,
    });

    res.status(201).json(storage);
  } catch (err) {
    res.status(500).json({ message: "Failed to create storage", error: err.message });
  }
};

// PUT /api/storages/:id
export const updateStorage = async (req, res) => {
  try {
    const { name, description, allowedUsers, isActive } = req.body;
    const storage = await Storage.findById(req.params.id);
    if (!storage) return res.status(404).json({ message: "Storage not found" });

    if (name) storage.name = name.trim();
    if (description !== undefined) storage.description = description;
    if (allowedUsers) storage.allowedUsers = allowedUsers;
    if (typeof isActive === "boolean") storage.isActive = isActive;

    await storage.save();
    res.json(storage);
  } catch (err) {
    res.status(500).json({ message: "Failed to update storage", error: err.message });
  }
};

// DELETE /api/storages/:id
export const deleteStorage = async (req, res) => {
  const storage = await Storage.findByIdAndDelete(req.params.id);
  if (!storage) return res.status(404).json({ message: "Storage not found" });
  res.json({ message: "Storage deleted" });
};
