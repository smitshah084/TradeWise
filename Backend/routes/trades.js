const express = require('express');
const router = express.Router();
const Trade = require('../models/Trades.js');
const InterestTrade = require('../models/interestTrade');
const { getRecommendations } = require('./recommend.js')
// Create a trade
// Get all trades
router.get('/get_all', async (req, res) => {
  console.log('get all trade inside trade called!!')
  try {
    const trades = await Trade.find();
    res.json(trades);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post('/get-trade-names', async (req, res) => {
  try {
    const { noList } = req.body; // Expecting an array of "no" values from the request body

    // Validate that "noList" is an array and not empty
    if (!Array.isArray(noList) || noList.length === 0) {
      return res.status(400).json({ error: 'Invalid input. "noList" must be a non-empty array.' });
    }

    // Find documents where "no" is in the provided "noList" and only return "tradeName" field
    const trades = await Trade.find({ no: { $in: noList } }, 'tradeName');

    // Extract tradeName values into an array
    const tradeNames = trades.map(trade => trade.tradeName);

    res.json({ tradeNames });
  } catch (error) {
    console.error('Error fetching trade names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/recommend', async (req, res) => {
  // PARAMS
  const number_intrests = 20;
  const number_trades = 200;

  let { InterestIds } = req.body;
  console.log('recommend called in trades');
  console.log("InterestIds: ", InterestIds);

  // Set InterestIds to an empty list if it is undefined
  if (!InterestIds) {
    InterestIds = [];
  }

  const records = await InterestTrade.find();
  // console.log('records,',records)
  console.log(" #INTERACTIONS: ", records.length);
  const Interaction_dictionary = records.map(record => {
    return { [record.key]: record.values };
  });
  console.log("Interactions in dictionary: ", Interaction_dictionary);

  RecommendedTradeIds = getRecommendations(Interaction_dictionary, number_intrests, number_trades, InterestIds); // interactions, numInterests, numCourses, userInterests// recommendFun(InterestIds,records)
  console.log("pure maal", RecommendedTradeIds);
  RecommendedTradeIds = completeList(RecommendedTradeIds);
  console.log('Recommended trade ids: ', RecommendedTradeIds);

  try {
      const trades = await Trade.find({ no: { $in: RecommendedTradeIds } });
      const tradesInOrder = RecommendedTradeIds
        .map(no => trades.find(trade => trade.no === no))
        .filter(trade => trade !== undefined); // Filter out undefined elements

      res.json(tradesInOrder);
  } catch (err) {
    res.status(400).send(err.message);
  }
})

function completeList(arr) {
  // Step 1: Remove duplicates while maintaining original order
  let uniqueArr = [];
  for (let num of arr) {
      if (!uniqueArr.includes(num)) {
          uniqueArr.push(num);
      }
  }

  // Step 2: Create a Set for quick lookup of existing numbers
  let existingNumbers = new Set(uniqueArr);

  // Step 3: Create the result array and add unique numbers first
  let result = [...uniqueArr];

  // Step 4: Append numbers starting from 0 until the length is 50
  let num = 0;
  while (result.length < 50) {
      // Check if the number is already in the array
      if (!existingNumbers.has(num)) {
          result.push(num);
      }
      num++;
  }

  return result;
}
module.exports = router;
