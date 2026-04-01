const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Petition = require("../models/Petition");
const Poll = require("../models/Poll");

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ TOTAL petitions in system
    const totalPetitions = await Petition.countDocuments();

    // ✅ TOTAL closed petitions in system
    const successful = await Petition.countDocuments({
      status: "closed"
    });

    // ✅ TOTAL polls in system
    const totalPolls = await Poll.countDocuments();

    res.json({
      name: user.name,
      role: user.role,
      location: user.location,
      email: user.email,
      totalPetitions,
      successful,
      totalPolls,
      reports: 0
    });

  } catch (error) {
    console.log("Dashboard Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;