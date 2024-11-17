const Transaction = require("../models/Transaction");

const getTransactions = async (req, res) => {
  const { page = 1, perPage = 10, search = "", month } = req.query;

  try {
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    // Convert month to numeric
    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1; // e.g., "March" -> 3

    const filter = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        ...(isNaN(search) ? [] : [{ price: Number(search) }]),
      ],
    };

    const currentPage = isNaN(page) ? 1 : Number(page);
    const limit = isNaN(perPage) ? 10 : Number(perPage);

    // Fetch transactions
    const transactions = await Transaction.find(filter)
      .skip((currentPage - 1) * limit)
      .limit(limit);

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

const getStatistics = async (req, res) => {
  const { month } = req.query;

  try {
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;

    const filter = {
      $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
    };

    const totalSales = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const total = totalSales.length > 0 ? totalSales[0].total : 0;

    const soldCount = await Transaction.countDocuments({
      ...filter,
      sold: true,
    });
    const unsoldCount = await Transaction.countDocuments({
      ...filter,
      sold: false,
    });

    res.status(200).json({
      totalSales: total,
      soldCount,
      unsoldCount,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

const getBarChartData = async (req, res) => {
  const { month } = req.query;

  try {
    // Validate the `month` parameter
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    const validMonths = [
      "January", "February", "March", "April", "May",
      "June", "July", "August", "September",
      "October", "November", "December"
    ];

    const normalizedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    if (!validMonths.includes(normalizedMonth)) {
      return res.status(400).json({ error: "Invalid month parameter" });
    }

    // Convert month name to index
    const monthIndex = validMonths.indexOf(normalizedMonth) + 1;

    console.log("Normalized Month:", normalizedMonth, "Month Index:", monthIndex);

    // Aggregation pipeline
    const result = await Transaction.aggregate([
      // Match stage: Filter by month and ensure valid fields
      {
        $match: {
          $and: [
            { dateOfSale: { $exists: true, $type: "date" } },
            { price: { $exists: true, $type: "number", $gte: 0 } },
            { $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] } },
          ],
        },
      },
      // Bucket stage: Group prices into defined ranges
      {
        $bucket: {
          groupBy: "$price",
          boundaries: [0, 101, 201, 301, 401, 501, 601, 701, 801, 901],
          default: "901+",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    console.log("Aggregation Result:", result);

    // Respond with the aggregated result
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching bar chart data:", error.stack);
    res.status(500).json({ error: "Failed to fetch bar chart data." });
  }
};




const getPieChartData = async (req, res) => {
  const { month } = req.query;

  try {
    if (!month) {
      return res.status(400).json({ error: "Month parameter is required" });
    }

    const monthIndex = new Date(`${month} 1, 2000`).getMonth() + 1;

    const result = await Transaction.aggregate([
      {
        $match: {
          $expr: { $eq: [{ $month: "$dateOfSale" }, monthIndex] },
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching pie chart data:", error);
    res.status(500).json({ error: "Failed to fetch pie chart data" });
  }
};

module.exports = {
  getTransactions,
  getStatistics,
  getBarChartData,
  getPieChartData,
};
