import Storage from "../models/Storage.js";

// Attaches the store owner's active Storage to req.storage.
// Blocks access entirely if no active Storage has this user in allowedUsers.
const requireStorage = async (req, res, next) => {
  try {
    const storage = await Storage.findOne({
      allowedUsers: req.user._id,
      isActive: true,
    });

    if (!storage) {
      return res.status(403).json({
        message:
          "No active storage is assigned to your account. Contact the admin to get access.",
        blocked: true,
      });
    }

    req.storage = storage;
    next();
  } catch (err) {
    res.status(500).json({ message: "Failed to verify storage access" });
  }
};

export default requireStorage;
