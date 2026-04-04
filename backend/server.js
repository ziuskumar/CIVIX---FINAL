const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
// const User = require("./models/test");



const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://civix-frontend.onrender.com",
      /\.onrender\.com$/,
      /\.netlify\.app$/,
    ],
    credentials: true,
  }),
);

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));


// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/petitions", require("./routes/petitionRoutes"));
app.use("/api/polls", require("./routes/polls"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/officials", require("./routes/officialRoutes"));
app.use("/uploads", express.static("uploads"));
app.use("/api/settings", require("./routes/settingsRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

//  Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://civix-frontend.onrender.com",
      /\.onrender\.com$/,
      /\.netlify\.app$/,
    ],
    methods: ["GET", "POST", "PUT"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});

app.get("/", (req, res) => {
  res.send("CIVIX Backend is Running 🚀");
});

