import mongoose from "mongoose";
import User from "./models/User.js";

async function updateUserRestrictions() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/learnshare");

    console.log("Starting user restrictions migration...");
    console.log("Updating all users with status and restrictions fields...\n");

    // Find all users that don't have status or restrictions properly set
    const users = await User.find({});
    console.log(`Found ${users.length} total users in database`);

    let updatedCount = 0;
    let alreadySetCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      const updates = {};

      // Check if status is missing or undefined
      if (!user.status) {
        updates.status = "active";
        needsUpdate = true;
      }

      // Check if restrictions object is missing or incomplete
      if (!user.restrictions) {
        updates.restrictions = {
          canConnect: true,
          canChat: true,
          canTeach: true,
          canLearn: true,
        };
        needsUpdate = true;
      } else {
        // Check individual restriction fields
        const restrictionUpdates = {};
        if (user.restrictions.canConnect === undefined) {
          restrictionUpdates.canConnect = true;
          needsUpdate = true;
        }
        if (user.restrictions.canChat === undefined) {
          restrictionUpdates.canChat = true;
          needsUpdate = true;
        }
        if (user.restrictions.canTeach === undefined) {
          restrictionUpdates.canTeach = true;
          needsUpdate = true;
        }
        if (user.restrictions.canLearn === undefined) {
          restrictionUpdates.canLearn = true;
          needsUpdate = true;
        }

        if (Object.keys(restrictionUpdates).length > 0) {
          updates.restrictions = {
            ...user.restrictions.toObject(),
            ...restrictionUpdates,
          };
        }
      }

      // Check if warningCount is missing
      if (user.warningCount === undefined) {
        updates.warningCount = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updatedCount++;
        console.log(`✓ Updated user: ${user.email} (${user.name})`);
        if (updates.status) console.log(`  - Set status: ${updates.status}`);
        if (updates.restrictions) console.log(`  - Set restrictions: all enabled`);
        if (updates.warningCount !== undefined) console.log(`  - Set warningCount: 0`);
      } else {
        alreadySetCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("Migration Summary:");
    console.log("=".repeat(60));
    console.log(`Total users processed: ${users.length}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`Users already configured: ${alreadySetCount}`);
    console.log("=".repeat(60));
    console.log("\n✓ Migration completed successfully!");
    console.log("\nAll users now have:");
    console.log("  - status field (default: 'active')");
    console.log("  - restrictions object (all permissions enabled)");
    console.log("  - warningCount (default: 0)");

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  }
}

updateUserRestrictions();
