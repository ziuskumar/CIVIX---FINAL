const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const auth = require("../middleware/authMiddleware");

/* ================= GET NOTIFICATIONS ================= */

router.get("/", auth, async (req, res) => {
  try {

    const notifications = await Notification
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});


/* ================= MARK ALL AS READ ================= */

router.put("/read", auth, async (req, res) => {
  try {

    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Notifications marked as read" });

  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }
});


/* ================= DELETE ALL (OPTIONAL) ================= */

router.delete("/clear", auth, async (req, res) => {
  try {

    await Notification.deleteMany({ userId: req.user.id });

    res.json({ message: "All notifications cleared" });

  } catch (error) {
    res.status(500).json({ message: "Error clearing notifications" });
  }
});


module.exports = router;