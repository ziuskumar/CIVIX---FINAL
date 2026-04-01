const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");

router.get("/", auth, async (req, res) => {
  try {
    const officials = await User.find({ role: "official" })
      .select("name email location createdAt");

    res.json(officials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching officials" });
  }
});

module.exports = router;