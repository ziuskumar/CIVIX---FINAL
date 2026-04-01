const express = require("express");
const router = express.Router();
const Poll = require("../models/Poll");
const auth = require("../middleware/authMiddleware");

// ================= CREATE POLL =================
router.post("/", auth, async (req, res) => {
  try {
    const { question, description, options, location, closesAt } = req.body;

    const poll = new Poll({
      question,
      description,
      options: options.map((opt) => ({ text: opt })),
      location,
      closesAt,
      createdBy: req.user.id,
      status: "open",
      voters: [],
    });

    await poll.save();

    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");

    res.json({ message: "Poll created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating poll" });
  }
});

// ================= GET ALL POLLS =================
router.get("/", auth, async (req, res) => {
  try {
    let polls = await Poll.find().sort({ createdAt: -1 });

    const now = new Date();

    // Auto close expired polls
    polls = await Promise.all(
      polls.map(async (poll) => {
        if (poll.closesAt && now > poll.closesAt && poll.status === "open") {
          poll.status = "closed";
          await poll.save();
        }
        return poll;
      }),
    );

    res.json(polls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching polls" });
  }
});

// ================= VOTE =================
router.put("/vote/:id", auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.status === "closed")
      return res.status(400).json({ message: "Poll closed" });

    if (poll.voters.includes(req.user.id))
      return res.status(400).json({ message: "Already voted" });

    if (!poll.options[optionIndex])
      return res.status(400).json({ message: "Invalid option" });

    poll.options[optionIndex].votes += 1;
    poll.voters.push(req.user.id);

    await poll.save();

    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");

    res.json({ message: "Vote submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Voting failed" });
  }
});

// ================= UPDATE POLL =================
router.put("/update/:id", auth, async (req, res) => {
  try {
    const { question, description, location, closesAt, options } = req.body;

    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (poll.status === "closed")
      return res.status(400).json({ message: "Cannot edit closed poll" });

    // Update basic fields
    poll.question = question;
    poll.description = description;
    poll.location = location;
    poll.closesAt = closesAt;

    // 🔥 Update options (reset votes)
    if (options && options.length >= 2) {
      poll.options = options.map((opt) => ({
        text: opt,
        votes: 0,
      }));
      poll.voters = []; // reset voters when editing options
    }

    await poll.save();

    res.json(poll); // return updated poll
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating poll" });
  }
});

// ================= DELETE POLL =================
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await poll.deleteOne();

    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");

    res.json({ message: "Poll deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting poll" });
  }
});

// ================= CLOSE POLL MANUALLY =================
router.put("/close/:id", auth, async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) return res.status(404).json({ message: "Poll not found" });

    if (poll.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    poll.status = "closed";
    await poll.save();

    const io = req.app.get("io");
    if (io) io.emit("pollUpdated");

    res.json({ message: "Poll closed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error closing poll" });
  }
});

module.exports = router;
