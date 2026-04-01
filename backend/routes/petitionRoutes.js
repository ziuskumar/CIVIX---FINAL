const express = require("express");
const router = express.Router();
const Petition = require("../models/Petition");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const sendEmail = require("../utils/sendEmail");
const Notification = require("../models/Notification");

/* ================= CREATE ================= */

router.post("/", auth, async (req, res) => {
  try {

    const { title, description, category, location, goal } = req.body;

    const petition = new Petition({
      title,
      description,
      category,
      location,
      goal: goal || 100,
      createdBy: req.user.id,
    });

    await petition.save();

    res.status(201).json(petition);

  } catch (error) {
    res.status(500).json({ message: "Error creating petition" });
  }
});

/* ================= GET ALL ================= */

router.get("/", auth, async (req, res) => {
  try {

    const { page = 1, limit = 5, category, location } = req.query;

    const query = {};
    const user = await User.findById(req.user.id);

    if (user.role === "official" && user.location) {
      query.location = { $regex: user.location, $options: "i" };
    }

    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    const total = await Petition.countDocuments(query);

    const petitions = await Petition.find(query)
      .populate("createdBy", "name email location role")
      .populate("responses.officialId", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      petitions,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching petitions" });
  }
});

/* ================= GET ONE ================= */

router.get("/:id", auth, async (req, res) => {
  try {

    const petition = await Petition.findById(req.params.id)
      .populate("createdBy", "name email location role")
      .populate("responses.officialId", "name");

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    res.json(petition);

  } catch (error) {
    res.status(500).json({ message: "Error fetching petition" });
  }
});

/* ================= SIGN ================= */

router.put("/sign/:id", auth, async (req, res) => {
  try {

    const petition = await Petition.findById(req.params.id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (petition.status !== "active")
      return res.status(400).json({ message: "Petition not active" });

    if (petition.signatures.includes(req.user.id))
      return res.status(400).json({ message: "Already signed" });

    petition.signatures.push(req.user.id);

    if (petition.signatures.length >= petition.goal) {
      petition.status = "under_review";
    }

    await petition.save();

    // ✅ CREATE NOTIFICATION
    await Notification.create({
      userId: petition.createdBy,
      message: "Someone signed your petition: " + petition.title
    });

    res.json({
      message: "Signed successfully",
      petition
    });

  } catch (error) {
    res.status(500).json({ message: "Error signing petition" });
  }
});

/* ================= OFFICIAL RESPONSE ================= */

router.post("/respond/:id", auth, async (req, res) => {
  try {

    const { comment } = req.body;

    const user = await User.findById(req.user.id);

    if (user.role !== "official")
      return res.status(403).json({ message: "Only officials can respond" });

    const petition = await Petition.findById(req.params.id)
      .populate("createdBy");

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    petition.responses.push({
      officialId: req.user.id,
      comment,
    });

    await petition.save();

    // ✅ CREATE NOTIFICATION
    await Notification.create({
      userId: petition.createdBy._id,
      message: "Official responded to your petition: " + petition.title
    });

    // ✅ EMAIL WITH TOGGLE CHECK
    const petitionOwner = await User.findById(petition.createdBy._id);

    if (petitionOwner.notifications) {
      await sendEmail(
        petitionOwner.email,
        "Official Response to Your Petition",
        `Hello ${petitionOwner.name},

An official responded to your petition "${petition.title}".

Response:
${comment}

Thank you.`
      );
    }

    res.json({ message: "Response added" });

  } catch (error) {
    res.status(500).json({ message: "Error responding" });
  }
});

/* ================= CLOSE ================= */

router.put("/close/:id", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (user.role !== "official" && user.role !== "admin")
      return res.status(403).json({ message: "Not authorized to close petitions" });

    petition.status = "closed";
    await petition.save();

    const creatorId = petition.createdBy?._id || petition.createdBy;

    // fire-and-forget — don't let these block the response
    Notification.create({
      userId: creatorId,
      message: "Your petition has been closed: " + petition.title
    }).catch(() => { });

    User.findById(creatorId).then(owner => {
      if (owner?.notifications) {
        sendEmail(owner.email, "Petition Closed",
          `Hello,\n\nYour petition "${petition.title}" has been closed.\n\nThank you.`
        );
      }
    }).catch(() => { });

    res.json({ message: "Petition closed successfully", petition });

  } catch (error) {
    console.error("Close error:", error.message);
    res.status(500).json({ message: "Error closing petition" });
  }
});

/* ================= APPROVE (official) ================= */

router.put("/approve/:id", auth, async (req, res) => {
  try {
    const petition = await Petition.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (user.role !== "official" && user.role !== "admin")
      return res.status(403).json({ message: "Not authorized" });

    petition.status = "active";
    await petition.save();

    const creatorId = petition.createdBy?._id || petition.createdBy;

    Notification.create({
      userId: creatorId,
      message: "Your petition has been approved: " + petition.title
    }).catch(() => { });

    res.json({ message: "Petition approved successfully", petition });

  } catch (error) {
    console.error("Approve error:", error.message);
    res.status(500).json({ message: "Error approving petition" });
  }
});

/* ================= UPDATE ================= */

router.put("/:id", auth, async (req, res) => {
  try {

    const petition = await Petition.findById(req.params.id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (petition.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (petition.status !== "active")
      return res.status(400).json({ message: "Only active petitions can be edited" });

    const { title, description, category, location, goal } = req.body;

    petition.title = title;
    petition.description = description;
    petition.category = category;
    petition.location = location;
    petition.goal = goal;

    await petition.save();

    res.json({
      message: "Petition updated successfully",
      petition
    });

  } catch (error) {
    res.status(500).json({ message: "Error updating petition" });
  }
});

/* ================= DELETE ================= */

router.delete("/:id", auth, async (req, res) => {
  try {

    const petition = await Petition.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!petition)
      return res.status(404).json({ message: "Petition not found" });

    if (user.role === "official") {
      await petition.deleteOne();
      return res.json({ message: "Deleted by official" });
    }

    if (petition.createdBy.toString() === req.user.id) {
      await petition.deleteOne();
      return res.json({ message: "Deleted by creator" });
    }

    return res.status(403).json({ message: "Not authorized" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting petition" });
  }
});

module.exports = router;