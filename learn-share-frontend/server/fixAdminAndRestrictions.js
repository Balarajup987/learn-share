import mongoose from "mongoose";
import User from "./models/User.js";

async function fixAdminAndRestrictions() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/learnshare");

    console.log("=" .repeat(70));
    console.log("FIXING ADMIN USER AND UPDATING USER RESTRICTIONS");
    console.log("=".repeat(70));
    console.log();

    // Step 1: Fix admin@learnshare.com role
    console.log("Step 1: Updating admin@learnshare.com role...");
    const adminUser = await User.findOne({ email: "admin@learnshare.com" });
    
    if (adminUser) {
      console.log(`Found admin user: ${adminUser.name} (${adminUser.email})`);
      console.log(`Current role: ${adminUser.role}`);
      
      if (adminUser.role !== "admin") {
        adminUser.role = "admin";
        await adminUser.save();
        console.log("✓ Successfully changed role to 'admin'\n");
      } else {
        console.log("✓ User already has admin role\n");
      }
    } else {
      console.log("⚠ Warning: admin@learnshare.com not found in database\n");
    }

    // Step 2: Update all users with restrictions
    console.log("Step 2: Updating ALL users with proper restrictions...");
    console.log("-".repeat(70));
    
    const allUsers = await User.find({});
    console.log(`Total users in database: ${allUsers.length}\n`);

    let updatedCount = 0;
    let alreadyGoodCount = 0;

    for (const user of allUsers) {
      const updates = {};
      let needsUpdate = false;

      // Check and set status
      if (!user.status || user.status === null || user.status === undefined) {
        updates.status = "active";
        needsUpdate = true;
      }

      // Check and set restrictions - this is the important part for old users
      if (!user.restrictions || typeof user.restrictions !== 'object') {
        updates.restrictions = {
          canConnect: true,
          canChat: true,
          canTeach: true,
          canLearn: true,
        };
        needsUpdate = true;
      } else {
        // Check each restriction field individually
        const currentRestrictions = user.restrictions.toObject ? user.restrictions.toObject() : user.restrictions;
        const fixedRestrictions = {
          canConnect: currentRestrictions.canConnect !== undefined ? currentRestrictions.canConnect : true,
          canChat: currentRestrictions.canChat !== undefined ? currentRestrictions.canChat : true,
          canTeach: currentRestrictions.canTeach !== undefined ? currentRestrictions.canTeach : true,
          canLearn: currentRestrictions.canLearn !== undefined ? currentRestrictions.canLearn : true,
        };
        
        // Check if any field was undefined
        if (currentRestrictions.canConnect === undefined || 
            currentRestrictions.canChat === undefined || 
            currentRestrictions.canTeach === undefined || 
            currentRestrictions.canLearn === undefined) {
          updates.restrictions = fixedRestrictions;
          needsUpdate = true;
        }
      }

      // Check and set warningCount
      if (user.warningCount === undefined || user.warningCount === null) {
        updates.warningCount = 0;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await User.updateOne({ _id: user._id }, { $set: updates });
        updatedCount++;
        console.log(`✓ Updated: ${user.email}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Role: ${user.role}`);
        if (updates.status) {
          console.log(`  Set status: ${updates.status}`);
        }
        if (updates.restrictions) {
          console.log(`  Set restrictions: all enabled (canConnect, canChat, canTeach, canLearn)`);
        }
        if (updates.warningCount !== undefined) {
          console.log(`  Set warningCount: 0`);
        }
        console.log();
      } else {
        alreadyGoodCount++;
      }
    }

    // Step 3: Verify admin user one more time
    console.log("=".repeat(70));
    console.log("Step 3: Final verification...");
    const verifyAdmin = await User.findOne({ email: "admin@learnshare.com" });
    if (verifyAdmin) {
      console.log(`✓ Admin user verified:`);
      console.log(`  Email: ${verifyAdmin.email}`);
      console.log(`  Name: ${verifyAdmin.name}`);
      console.log(`  Role: ${verifyAdmin.role}`);
      console.log(`  Status: ${verifyAdmin.status}`);
      console.log(`  Restrictions: ${JSON.stringify(verifyAdmin.restrictions)}`);
    }

    // Summary
    console.log();
    console.log("=".repeat(70));
    console.log("MIGRATION SUMMARY");
    console.log("=".repeat(70));
    console.log(`Total users processed: ${allUsers.length}`);
    console.log(`Users updated: ${updatedCount}`);
    console.log(`Users already configured: ${alreadyGoodCount}`);
    console.log("=".repeat(70));
    console.log();
    console.log("✓ All tasks completed successfully!");
    console.log();
    console.log("Next steps:");
    console.log("1. Login with admin@learnshare.com");
    console.log("2. Click profile dropdown → 'Admin Panel'");
    console.log("3. View and manage all user complaints");
    console.log();

    process.exit(0);
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    console.error(error.stack);
    process.exit(1);
  }
}

fixAdminAndRestrictions();
