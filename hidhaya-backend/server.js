require('dotenv').config();
const { app, initializeApp } = require("./app");
const net = require('net');

const PORT = process.env.PORT || 5000;

// Function to find an available port
const findAvailablePort = async (startPort, maxAttempts = 10) => {
  let port = startPort;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        const tester = net.createServer();
        tester.once('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            reject(err);
          } else {
            resolve();
          }
        });
        tester.once('listening', () => {
          tester.close(() => {
            resolve();
          });
        });
        tester.listen(port, '0.0.0.0');
      });
      return port;
    } catch (e) {
      if (e.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is in use, trying next port...`);
        port++;
      } else {
        throw e;
      }
    }
  }
  throw new Error(`No available port found after ${maxAttempts} attempts starting from ${startPort}`);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Start the server
const startServer = async () => {
  try {
    console.log("Starting server initialization...");
    await initializeApp();
    console.log("✅ initializeApp completed, about to listen on port...");

    const availablePort = await findAvailablePort(parseInt(PORT));

    const server = app.listen(availablePort, '0.0.0.0', () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🤖 Hidhaya AI Backend                                    ║
║   Your Personal Islamic Companion                          ║
║                                                            ║
║   Server running on port ${availablePort}                             ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                            ║
║   Endpoints:                                               ║
║   - Health: http://localhost:${availablePort}/health                  ║
║   - API:    http://localhost:${availablePort}/api                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();