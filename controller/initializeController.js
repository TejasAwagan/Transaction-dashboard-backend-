const axios = require('axios');
const Transaction = require('../models/Transaction');

const initializeDatabase = async (req, res) => {
  try {
    console.log('Fetching data from third-party API...');
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');

    console.log('Clearing existing data...');
    await Transaction.deleteMany();

    console.log('Seeding database with new data...');
    await Transaction.insertMany(response.data);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error.message);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
};

module.exports =  {initializeDatabase} ;
