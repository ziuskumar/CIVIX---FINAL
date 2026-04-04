const router = require("express").Router();
const Petition = require("../models/Petition");
const Poll = require("../models/Poll");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");

/* ================= GET REPORT DATA ================= */

router.get("/", async (req, res) => {
  try {

    const totalPetitions = await Petition.countDocuments();
    const active = await Petition.countDocuments({ status: "active" });
    const under_review = await Petition.countDocuments({ status: "under_review" });
    const closed = await Petition.countDocuments({ status: "closed" });

    const totalPolls = await Poll.countDocuments();
    const openPolls = await Poll.countDocuments({ status: "open" });
    const closedPolls = await Poll.countDocuments({ status: "closed" });

    const signatures = await Petition.aggregate([
      { $project: { count: { $size: { $ifNull: ["$signatures", []] } } } },
      { $group: { _id: null, total: { $sum: "$count" } } }
    ]);

    // Monthly petition trend — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Petition.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $addFields: { sigCount: { $size: { $ifNull: ["$signatures", []] } } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          signatures: { $sum: "$sigCount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Fill in missing months for the last 6 months
    const trendData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-indexed for matching aggregation
      
      const found = monthlyTrend.find(m => m._id.year === year && m._id.month === month);
      trendData.push({
        month: monthNames[month - 1],
        petitions: found ? found.count : 0,
        signatures: found ? found.signatures : 0
      });
    }

    // Top category
    const topCategoryAgg = await Petition.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    const topCategory = topCategoryAgg[0]?._id || "N/A";

    // Category breakdown for bar chart
    const categoryBreakdown = await Petition.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      totalPetitions,
      active,
      under_review,
      closed,
      totalSignatures: signatures[0]?.total || 0,
      totalPolls,
      openPolls,
      closedPolls,
      trendData,
      topCategory,
      categoryBreakdown: categoryBreakdown.map(c => ({ name: c._id || "Other", count: c.count }))
    });

  } catch (error) {
    console.error("Reports error:", error.message);
    res.status(500).json({ message: "Error generating report", detail: error.message });
  }
});


/* ================= EXPORT CSV ================= */

router.get("/export/csv", async (req, res) => {

  const data = await Petition.find().populate("createdBy", "name email");

  const fields = [
    "title",
    "category",
    "location",
    "status",
    "goal"
  ];

  const parser = new Parser({ fields });

  const csv = parser.parse(data);

  res.header("Content-Type", "text/csv");
  res.attachment("civic-report.csv");
  res.send(csv);
});


/* ================= EXPORT PDF ================= */

router.get("/export/pdf", async (req, res) => {

  const totalPetitions = await Petition.countDocuments();
  const active = await Petition.countDocuments({ status: "active" });
  const under_review = await Petition.countDocuments({ status: "under_review" });
  const closed = await Petition.countDocuments({ status: "closed" });
  const polls = await Poll.countDocuments();

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=report.pdf");

  doc.pipe(res);

  doc.fontSize(22).text("Civic Engagement Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(14).text(`Total Petitions: ${totalPetitions}`);
  doc.text(`Active Petitions: ${active}`);
  doc.text(`Under Review: ${under_review}`);
  doc.text(`Closed Petitions: ${closed}`);
  doc.text(`Total Polls: ${polls}`);

  doc.end();
});

module.exports = router;