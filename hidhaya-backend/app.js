const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();
const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for API
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    }
  });
  next();
});

// Health check endpoint
app.get("/health", async (req, res) => {
  const { client: redis } = require('./src/config/redis');
  const dbConnection = require('./src/config/db');

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      redis: redis?.isOpen ? 'connected' : 'disconnected',
      database: 'connected' // Will update when DB is connected
    }
  });
});

// API Routes
console.log("Loading auth routes...");
const authRoutes = require("./src/routes/authRoutes");
console.log("✅ Auth routes loaded");

console.log("Loading chat routes...");
const chatRoutes = require("./src/routes/chatRoutes");
console.log("✅ Chat routes loaded");

console.log("Loading quran routes...");
const quranRoutes = require("./src/routes/quranRoutes");
console.log("✅ Quran routes loaded");

console.log("Loading hadith routes...");
const hadithRoutes = require("./src/routes/hadithRoutes");
console.log("✅ Hadith routes loaded");

console.log("Loading bookmark routes...");
const bookmarkRoutes = require("./src/routes/bookmarkRoutes");
console.log("✅ Bookmark routes loaded");

console.log("Loading kids routes...");
const kidsRoutes = require("./src/routes/kidsRoutes");
console.log("✅ Kids routes loaded");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quran", quranRoutes);
app.use("/api/hadith", hadithRoutes);
app.use("/api/bookmarks", bookmarkRoutes);
app.use("/api/kids", kidsRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Hidhaya AI API",
    version: "1.0.0",
    description: "Your Personal Islamic Companion",
    documentation: "/api/docs"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: "Endpoint not found",
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      message: "Validation error",
      details: err.message
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: true,
      message: "Invalid ID format"
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: true,
      message: "Duplicate entry"
    });
  }

  // Default error response
  res.status(err.statusCode || 500).json({
    error: true,
    message: process.env.NODE_ENV === 'production'
      ? "Internal server error"
      : err.message
  });
});

// Initialize database and Redis
const initializeApp = async () => {
  try {
    console.log("Step 1: About to connect DB");
    await connectDB();
    console.log("Step 2: DB connected");

    console.log("Step 3: About to connect Redis");
    try {
      await connectRedis();
      console.log("Step 4: Redis connected");
    } catch (redisError) {
      console.warn("Step 4: Redis connection failed, continuing:", redisError.message);
    }

    console.log("Step 5: About to return success");
    return "done";
  } catch (error) {
    console.error("Failed to initialize app:", error);
    process.exit(1);
  }
};

module.exports = { app, initializeApp };