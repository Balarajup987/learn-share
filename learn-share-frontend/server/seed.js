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
      name: "Arjun Sharma",
      email: "arjun@example.com",
      password,
      role: "both",
    },
    { name: "Priya Patel", email: "priya@example.com", password, role: "both" },
    {
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      password,
      role: "student",
    },
    {
      name: "Sneha Singh",
      email: "sneha@example.com",
      password,
      role: "teacher",
    },
    {
      name: "Vikram Gupta",
      email: "vikram@example.com",
      password,
      role: "teacher",
    },
    {
      name: "Anita Reddy",
      email: "anita@example.com",
      password,
      role: "student",
    },
  ];

  const createdUsers = await User.insertMany(sampleUsers);
  console.log(`Inserted ${createdUsers.length} users`);

  // Upgrade some users to teacher profile fields directly on User model
  const teacherDataByEmail = new Map([
    [
      "arjun@example.com",
      {
        categories: ["Mathematics", "Physics"],
        experience: "8 years",
        bio: "IIT Delhi graduate with expertise in advanced mathematics and physics.",
        mode: "Online",
        github: "https://github.com/rajesh-math",
        linkedin: "https://linkedin.com/in/rajesh-kumar",
        website: "https://rajesh-math.com",
        idFile: "slider1.jpeg",
        role: "both",
      },
    ],
    [
      "priya@example.com",
      {
        categories: ["Computer Science", "Programming"],
        experience: "6 years",
        bio: "Software engineer turned educator.",
        mode: "Hybrid",
        github: "https://github.com/priya-cs",
        linkedin: "https://linkedin.com/in/priya-patel",
        website: "https://priya-coding.com",
        idFile: "slider2.jpeg",
        role: "both",
      },
    ],
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
    [
      "vikram@example.com",
      {
        categories: ["English Literature", "Communication"],
        experience: "12 years",
        bio: "English professor with a passion for literature.",
        mode: "Offline",
        github: "https://github.com/vikram-english",
        linkedin: "https://linkedin.com/in/vikram-gupta",
        website: "https://vikram-english.com",
        idFile: "slider4.jpeg",
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
