const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* GET PROFILE */

exports.getProfile = async (req, res) => {

  const user = await User.findById(req.user.id).select("-password");

  res.json(user);

};


/* UPDATE PROFILE */

exports.updateProfile = async (req, res) => {

  const { name, email, location } = req.body;

  const user = await User.findByIdAndUpdate(

    req.user.id,

    { name, email, location },

    { new: true }

  ).select("-password");

  res.json(user);

};


/* CHANGE PASSWORD */

exports.changePassword = async (req, res) => {

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);

  const match = await bcrypt.compare(currentPassword, user.password);

  if (!match) {
    return res.status(400).json({ message: "Incorrect password" });
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  user.password = hashed;

  await user.save();

  res.json({ message: "Password updated" });

};


/* TOGGLE EMAIL NOTIFICATIONS */

exports.toggleNotifications = async (req, res) => {

  const { notifications } = req.body;

  const user = await User.findByIdAndUpdate(

    req.user.id,

    { notifications },

    { new: true }

  );

  res.json(user);

};


/* UPLOAD PROFILE PHOTO */

exports.uploadPhoto = async (req, res) => {

  const user = await User.findById(req.user.id);

  user.profilePhoto = req.file.filename;

  await user.save();

  res.json({ photo: user.profilePhoto });

};


/* REMOVE PROFILE PHOTO */

exports.removePhoto = async (req, res) => {

  const user = await User.findById(req.user.id);

  user.profilePhoto = "";

  await user.save();

  res.json({ message: "Photo removed" });

};


/* DELETE ACCOUNT */

exports.deleteAccount = async (req, res) => {

  await User.findByIdAndDelete(req.user.id);

  res.json({ message: "Account deleted" });

};