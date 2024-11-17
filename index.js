const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const initializeRoutes = require("./routes/initializeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const barChartRoutes = require('./routes/transactionRoutes');
const pieChartRoutes = require('./routes/transactionRoutes');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose
  .connect("mongodb+srv://tejasawagan29:tejas123@cluster0.vrr2g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.error("Database connection error:", err));

// Routes
app.use("/api/initialize", initializeRoutes);
app.use("/api/transactions", transactionRoutes);
app.use('/api/bar-chart', barChartRoutes);
app.use('/api/pie-chart', pieChartRoutes);


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
