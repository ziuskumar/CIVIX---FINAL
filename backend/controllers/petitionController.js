const Petition = require("../models/Petition");

// CREATE PETITION
exports.createPetition = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const petition = await Petition.create({
      title,
      description,
      category,
      createdBy: req.user.id,
    });

    res.status(201).json(petition);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL PETITIONS
exports.getPetitions = async (req, res) => {
  try {
    const petitions = await Petition.find().populate("createdBy", "name");
    res.json(petitions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};