import mongoose from "mongoose";
import User from "./models/User.js";

async function migrate() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/learnshare");

    console.log("Starting migration...");

    // Since Teacher model is deprecated, check if there's an old collection
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const teacherCollectionExists = collections.some(col => col.name === 'teachers');

    if (!teacherCollectionExists) {
      console.log("No old Teacher collection found. Migration not needed.");
      process.exit(0);
    }

    // Define old Teacher schema for migration
    const oldTeacherSchema = new mongoose.Schema({
      name: String,
      email: String,
      password: String,
      categories: [String],
      experience: String,
      bio: String,
      mode: String,
      github: String,
      linkedin: String,
      website: String,
      idFile: String,
      pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    });

    const OldTeacher = mongoose.model('Teacher', oldTeacherSchema, 'teachers');

    // Get all teachers from old collection
    const teachers = await OldTeacher.find({});
    console.log(`Found ${teachers.length} teachers to migrate`);

    for (const teacher of teachers) {
      // Check if user already exists
      let user = await User.findOne({ email: teacher.email });

      if (!user) {
        // Create new user
        user = new User({
          name: teacher.name,
          email: teacher.email,
          password: teacher.password, // Assuming password is hashed
          role: "teacher",
          categories: teacher.categories || [],
          experience: teacher.experience,
          bio: teacher.bio,
          mode: teacher.mode,
          github: teacher.github,
          linkedin: teacher.linkedin,
          website: teacher.website,
          idFile: teacher.idFile,
          // Migrate connections
          requestsReceived: teacher.pendingRequests || [],
          connections: teacher.followers || [],
        });
      } else {
        // Update existing user to teacher/both
        user.role = user.role === "student" ? "both" : "teacher";
        user.categories = teacher.categories || user.categories;
        user.experience = teacher.experience || user.experience;
        user.bio = teacher.bio || user.bio;
        user.mode = teacher.mode || user.mode;
        user.github = teacher.github || user.github;
        user.linkedin = teacher.linkedin || user.linkedin;
        user.website = teacher.website || user.website;
        user.idFile = teacher.idFile || user.idFile;
        // Merge connections
        user.requestsReceived = [...new Set([...user.requestsReceived, ...(teacher.pendingRequests || [])])];
        user.connections = [...new Set([...user.connections, ...(teacher.followers || [])])];
      }

      await user.save();
      console.log(`Migrated teacher: ${teacher.email}`);
    }

    // Update sentRequests for users who sent requests to teachers
    const users = await User.find({});
    for (const user of users) {
      // Find teachers they connected to
      const connectedTeachers = await OldTeacher.find({ followers: user._id });
      for (const teacher of connectedTeachers) {
        if (!user.sentRequests.includes(teacher._id)) {
          user.sentRequests.push(teacher._id);
        }
      }
      await user.save();
    }

    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();