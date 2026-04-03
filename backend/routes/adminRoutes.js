const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Petition = require("../models/Petition");
const Poll = require("../models/Poll");
const Notification = require("../models/Notification");
const adminAuth = require("../middleware/adminMiddleware");
const sendEmail = require("../utils/sendEmail");

/* ─── STATS ─────────────────────────────────────────── */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalPetitions, totalPolls, pendingPetitions] =
      await Promise.all([
        User.countDocuments(),
        Petition.countDocuments(),
        Poll.countDocuments(),
        Petition.countDocuments({ status: "pending" }),
      ]);

    const sigAgg = await Petition.aggregate([
      { $project: { count: { $size: "$signatures" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]);

    const roleBreakdown = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers,
      totalPetitions,
      totalPolls,
      pendingPetitions,
      totalSignatures: sigAgg[0]?.total || 0,
      roleBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

/* ─── USERS ─────────────────────────────────────────── */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { search = "", role = "" } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (role) query.role = role;
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

router.put("/users/:id/role", adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["citizen", "official", "admin"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error updating role" });
  }
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    if (req.params.id === req.user.id)
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

/* ─── PETITIONS ─────────────────────────────────────── */
router.get("/petitions", adminAuth, async (req, res) => {
  try {
    const { status = "" } = req.query;
    const query = status ? { status } : {};
    const petitions = await Petition.find(query)
      .populate("createdBy", "name email location")
      .sort({ createdAt: -1 });
    res.json(petitions);
  } catch (err) {
    res.status(500).json({ message: "Error fetching petitions" });
  }
});

// Approve petition (under_review → active or closed)
router.put("/petitions/:id/approve", adminAuth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id).populate(
      "createdBy",
    );
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    petition.status = "active";
    await petition.save();

    await Notification.create({
      userId: petition.createdBy._id,
      message: `Your petition "${petition.title}" has been approved by admin.`,
    });

    if (petition.createdBy.notifications) {
      await sendEmail(
        petition.createdBy.email,
        "Petition Approved",
        `Hello ${petition.createdBy.name},\n\nYour petition "${petition.title}" has been approved.\n\nThank you.`,
      ).catch(() => {});
    }

    res.json({ message: "Petition approved", petition });
  } catch (err) {
    res.status(500).json({ message: "Error approving petition" });
  }
});

// Reject petition → rejected
router.put("/petitions/:id/reject", adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    const petition = await Petition.findById(req.params.id).populate(
      "createdBy",
    );
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    petition.status = "rejected";
    await petition.save();

    await Notification.create({
      userId: petition.createdBy._id,
      message: `Your petition "${petition.title}" was rejected. Reason: ${reason || "N/A"}`,
    });

    if (petition.createdBy.notifications) {
      await sendEmail(
        petition.createdBy.email,
        "Petition Rejected",
        `Hello ${petition.createdBy.name},\n\nYour petition "${petition.title}" has been rejected.\nReason: ${reason || "N/A"}\n\nThank you.`,
      ).catch(() => {});
    }

    res.json({ message: "Petition rejected", petition });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting petition" });
  }
});

router.delete("/petitions/:id", adminAuth, async (req, res) => {
  try {
    const petition = await Petition.findByIdAndDelete(req.params.id);
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });
    res.json({ message: "Petition deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting petition" });
  }
});

/* ─── POLLS ─────────────────────────────────────────── */
router.get("/polls", adminAuth, async (req, res) => {
  try {
    const polls = await Poll.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });
    res.json(polls);
  } catch (err) {
    res.status(500).json({ message: "Error fetching polls" });
  }
});

router.put("/polls/:id/close", adminAuth, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true },
    );
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");
    res.json({ message: "Poll closed", poll });
  } catch (err) {
    res.status(500).json({ message: "Error closing poll" });
  }
});

router.put("/polls/:id/open", adminAuth, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { status: "open" },
      { new: true },
    );
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");
    res.json({ message: "Poll reopened", poll });
  } catch (err) {
    res.status(500).json({ message: "Error reopening poll" });
  }
});

router.delete("/polls/:id", adminAuth, async (req, res) => {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");
    res.json({ message: "Poll deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting poll" });
  }
});

module.exports = router;
