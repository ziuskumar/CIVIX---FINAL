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
    const [
      totalUsers,
      totalPetitions,
      totalPolls,
      pendingPetitions,
      bannedUsers,
    ] = await Promise.all([
      User.countDocuments(),
      Petition.countDocuments(),
      Poll.countDocuments(),
      Petition.countDocuments({ status: "pending" }),
      User.countDocuments({ isBanned: true }),
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
      bannedUsers,
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

router.put("/users/:id/ban", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin")
      return res.status(400).json({ message: "Cannot ban admins" });

    user.isBanned = !user.isBanned;
    await user.save();
    res.json({
      message: user.isBanned ? "User banned" : "User unbanned",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling ban" });
  }
});

router.put("/users/:id/verify", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "official")
      return res
        .status(400)
        .json({ message: "Only officials can be verified" });

    user.isVerified = !user.isVerified;
    await user.save();
    res.json({
      message: user.isVerified ? "Official verified" : "Verification removed",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling verification" });
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

router.put("/petitions/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "active",
      "under_review",
      "closed",
      "rejected",
    ];
    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const petition = await Petition.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    ).populate("createdBy", "name email");

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    await Notification.create({
      userId: petition.createdBy._id,
      message: `Your petition status changed to: ${status.replace("_", " ")}`,
    });

    res.json({ message: "Status updated", petition });
  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
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

router.put("/petitions/:id/edit", adminAuth, async (req, res) => {
  try {
    const { title, description, category, location } = req.body;
    const petition = await Petition.findByIdAndUpdate(
      req.params.id,
      { title, description, category, location },
      { new: true },
    );
    if (!petition)
      return res.status(404).json({ message: "Petition not found" });
    res.json({ message: "Petition updated", petition });
  } catch (err) {
    res.status(500).json({ message: "Error updating petition" });
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
