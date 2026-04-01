const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {

  getProfile,
  updateProfile,
  changePassword,
  toggleNotifications,
  uploadPhoto,
  removePhoto,
  deleteAccount

} = require("../controllers/settingsController");


router.get("/profile", auth, getProfile);

router.put("/profile", auth, updateProfile);

router.put("/password", auth, changePassword);

router.put("/notifications", auth, toggleNotifications);

router.post("/photo", auth, upload.single("photo"), uploadPhoto);

router.delete("/photo", auth, removePhoto);

router.delete("/delete", auth, deleteAccount);


module.exports = router;