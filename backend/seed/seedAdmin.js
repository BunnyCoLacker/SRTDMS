import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import mongoose from "mongoose";

dotenv.config();

const run = async () => {
  await connectDB();

  const name = process.env.ADMIN_NAME || "Admin One";
  const email = (process.env.ADMIN_EMAIL || "admin1@sarisaridms.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin123!";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log("Admin 1 created successfully:");
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${password}`);
    console.log("Change this password after first login.");
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
