import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import User from "./models/User.js";
import Teacher from "./models/Teacher.js";

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
  await Teacher.deleteMany({});
  console.log("Cleared users and teachers");

  const password = await bcrypt.hash("123456", 10);

  const sampleUsers = [
    { name: "Alice Brown", email: "alice@example.com", password },
    { name: "Bob Carter", email: "bob@example.com", password },
    { name: "Charlie Diaz", email: "charlie@example.com", password },
    { name: "Diana Evans", email: "diana@example.com", password },
  ];

  const createdUsers = await User.insertMany(sampleUsers);
  console.log(`Inserted ${createdUsers.length} users`);

  const teacherProfiles = [
    {
      name: "Prof. Newton",
      email: "alice@example.com",
      categories: ["Physics", "Math"],
      experience: "5 years",
      bio: "Passionate about mechanics and calculus.",
      mode: "Online",
      github: "https://github.com/newton",
      linkedin: "https://linkedin.com/in/newton",
      website: "https://newton.example.com",
      idFile: "slider1.jpeg",
      connections: [],
      requestsReceived: [],
      requestsSent: [],
    },
    {
      name: "Dr. Curie",
      email: "bob@example.com",
      categories: ["Chemistry", "Biology"],
      experience: "8 years",
      bio: "Chemistry enthusiast and researcher.",
      mode: "Hybrid",
      github: "https://github.com/curie",
      linkedin: "https://linkedin.com/in/curie",
      website: "https://curie.example.com",
      idFile: "slider2.jpeg",
      connections: [],
      requestsReceived: [],
      requestsSent: [],
    },
    {
      name: "Alan Turing",
      email: "charlie@example.com",
      categories: ["Programming", "Algorithms"],
      experience: "10 years",
      bio: "Loves teaching problem solving.",
      mode: "Online",
      github: "https://github.com/turing",
      linkedin: "https://linkedin.com/in/turing",
      website: "https://turing.example.com",
      idFile: "slider3.jpeg",
      connections: [],
      requestsReceived: [],
      requestsSent: [],
    },
    {
      name: "Grace Hopper",
      email: "diana@example.com",
      categories: ["Compilers", "CS"],
      experience: "12 years",
      bio: "Compiler pioneer and educator.",
      mode: "Offline",
      github: "https://github.com/hopper",
      linkedin: "https://linkedin.com/in/hopper",
      website: "https://hopper.example.com",
      idFile: "slider4.jpeg",
      connections: [],
      requestsReceived: [],
      requestsSent: [],
    },
  ];

  const createdTeachers = await Teacher.insertMany(teacherProfiles);
  console.log(`Inserted ${createdTeachers.length} teachers`);

  await mongoose.disconnect();
  console.log("Seeding complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
