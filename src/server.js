const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Basic health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Local Business Ordering API running" });
});

// Socket.IO basic setup (order status updates will use this later)
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

