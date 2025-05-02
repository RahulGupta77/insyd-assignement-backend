const { processQueue } = require("../src/workers/notificationWorker");
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGO_URI =
      "mongodb+srv://rahulguptaatlas:gwtTmYx5UKzfcsTY@cluster0.3pa7dgo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    return false;
  }
};

// Run worker in an interval
const runWorker = async () => {
  // Connect to DB before starting worker
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }

  console.log("Starting notification worker...");

  // Process the queue at regular intervals
  const intervalMs = process.env.WORKER_INTERVAL_MS || 10000; // 10 seconds by default

  setInterval(async () => {
    try {
      await processQueue();
    } catch (error) {
      console.error("Error in worker process:", error);
    }
  }, intervalMs);

  // Also process immediately on startup
  try {
    await processQueue();
  } catch (error) {
    console.error("Error in initial worker process:", error);
  }

  console.log(`Worker running with interval of ${intervalMs}ms`);
};

// Start the worker
runWorker().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
