const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, location, governmentId } = req.body;

    // 🔐 Strong Password Validation
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character.",
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "citizen",
      location,
      governmentId: governmentId || null,
    });

    await user.save();

    res.status(201).json({ message: "Registered successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.isBanned) {
      return res
        .status(403)
        .json({
          message: "Your account has been suspended. Please contact support.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// FORGOT PASSWORD - SEND OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Email configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Civix Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 Password Reset Request - Civix",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      
      <h2 style="color:#2c3e50;">Hello ${user.name},</h2>
      
      <p>We received a request to reset your password for your Civix account.</p>
      
      <h3>Your Registered Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${user.name}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Role:</strong> ${user.role}</li>
        <li><strong>Location:</strong> ${user.location}</li>
      </ul>

      <p>Please use the following One-Time Password (OTP) to reset your password:</p>

      <h1 style="color:#e74c3c; letter-spacing: 5px;">${otp}</h1>

      <p><strong>This OTP is valid for 10 minutes.</strong></p>

      <hr/>

      <p style="font-size: 14px; color: gray;">
        If you did not request a password reset, please ignore this email.
        Your account remains secure.
      </p>

      <p style="margin-top:20px;">
        Regards,<br/>
        <strong>Civix Security Team</strong>
      </p>

    </div>
  `,
    });

    res.json({ message: "OTP sent to registered email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.resetOTP !== otp || user.resetOTPExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 🔐 Strong Password Validation for Reset
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strongRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "New password must be strong (8+ chars, uppercase, lowercase, number, special character).",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOTP = undefined;
    user.resetOTPExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
