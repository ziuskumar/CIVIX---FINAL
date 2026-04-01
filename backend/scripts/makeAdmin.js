/**
 * One-time script to promote a user to admin.
 * Usage: node scripts/makeAdmin.js user@example.com
 */
require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");

const email = process.argv[2];
if (!email) { console.error("Usage: node scripts/makeAdmin.js <email>"); process.exit(1); }

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
    if (!user) { console.error("User not found:", email); }
    else { console.log(`✅ ${user.name} (${user.email}) is now an admin.`); }
    process.exit(0);
});
