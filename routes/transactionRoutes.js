const express = require('express');
const { getTransactions, getStatistics,getBarChartData, getPieChartData } = require('../controller/transactionController');



const router = express.Router();

router.get('/', getTransactions);
router.get('/statistics', getStatistics);
router.get('/', getBarChartData);
router.get('/', getPieChartData);

module.exports = router;
