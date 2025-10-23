import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/learnshare", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log("Connected to MongoDB");

  await User.deleteMany({});
  console.log("Cleared users");

  const password = await bcrypt.hash("123456", 10);

  const sampleUsers = [
    {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: "admin",
    },
    {
      name: "Sneha Singh",
      email: "sneha@example.com",
      password,
      role: "teacher",
    },
    {
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      password,
      role: "student",
    },
  ];

  const createdUsers = await User.insertMany(sampleUsers);
  console.log(`Inserted ${createdUsers.length} users`);

  // Upgrade some users to teacher profile fields directly on User model
  const teacherDataByEmail = new Map([
    [
      "sneha@example.com",
      {
        categories: ["Chemistry", "Biology"],
        experience: "10 years",
        bio: "PhD in Organic Chemistry from IISc Bangalore.",
        mode: "Online",
        github: "https://github.com/sneha-chem",
        linkedin: "https://linkedin.com/in/sneha-singh",
        website: "https://sneha-chemistry.com",
        idFile: "slider3.jpeg",
        role: "teacher",
      },
    ],
  ]);

  for (const u of createdUsers) {
    const data = teacherDataByEmail.get(u.email);
    if (data) {
      Object.assign(u, data);
      await u.save();
    }
  }

  await mongoose.disconnect();
  console.log("Seeding complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
