const Petition = require("../models/Petition");

exports.getMonthlyReport = async (req, res) => {
  try {

    const totalPetitions = await Petition.countDocuments();

    const active = await Petition.countDocuments({ status: "active" });

    const closed = await Petition.countDocuments({ status: "closed" });

    const signatures = await Petition.aggregate([
      {
        $project: {
          count: { $size: "$signatures" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    res.json({
      totalPetitions,
      active,
      closed,
      totalSignatures: signatures[0]?.total || 0,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};