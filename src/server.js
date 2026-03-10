const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

// Load environment variables before importing modules that depend on them
// Use override:true so .env wins over any system-level vars
dotenv.config({ override: true });

const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const shopRoutes = require("./routes/shopRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make io accessible in controllers via app instance
app.set("io", io);

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Basic health route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Local Business Ordering API running" });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 404 and error handlers
app.use(notFound);
app.use(errorHandler);

// Socket.IO basic setup (clients join rooms for user or shop to receive updates)
io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  // Client can join rooms like { type: 'user', id: userId } or { type: 'shop', id: shopId }
  socket.on("joinRoom", ({ type, id }) => {
    if (!type || !id) return;
    const room = `${type}:${id}`;
    socket.join(room);
  });

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

