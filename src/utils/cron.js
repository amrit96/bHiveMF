const cron = require("node-cron");
const Portfolio = require("../models/Portfolio");
const axios = require("axios");
const NodeCache = require("node-cache");

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

const BATCH_SIZE = 100;
const RAPID_API_BASE_URL = "https://latest-mutual-fund-nav.p.rapidapi.com/latest"
const RTA_AGENT_CODE = "CAMS"
const SCHEMA_TYPE = "Open Ended Schemes"

const fetchFundData = async (fundName) => {
  const cachedData = cache.get(fundName);
  
  if (cachedData) {
    console.log(`Using cached data for fund: ${fundName}`);
    return cachedData;  // Return cached data if available
  }

  try {
    // Construct the URL with the fund name
    const url = `${RAPID_API_BASE_URL}?RTA_Agent_Code=${RTA_AGENT_CODE}&Scheme_Type=${SCHEMA_TYPE}&Scheme_Name=${fundName}`;
    
    // Fetch the data from the API
    const response = await axios.get(url, {
      headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY },
    });

    // Cache the data with the fund name as the key
    cache.set(fundName, response.data);
    console.log(`Fetched and cached data for fund: ${fundName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${fundName}:`, error.message);
    throw error;
  }
};

// Function to update portfolio values
const updatePortfolioValues = async (page = 1) => {
  console.log(`Updating portfolio values for page ${page}...`);
  try {
    // Fetch portfolios in batches using pagination
    const portfolios = await Portfolio.findAll({
      limit: BATCH_SIZE,   // Limit the number of portfolios to fetch per query
      offset: (page - 1) * BATCH_SIZE,  // Calculate offset for pagination
    });

    if (portfolios.length === 0) {
      console.log("No more portfolios to update.");
      return;  // Exit if no portfolios are found
    }

    for (const portfolio of portfolios) {
      // Fetch mutual fund data from the cache or the API
      const fundData = await fetchFundData(portfolio.fundName);
      
      // Extract the current value of the mutual fund from the fetched data
      const currentFundValue = fundData.Net_Asset_Value;

      const updatedInvestmentValue = portfolio.investmentValue * currentFundValue;

      // Update the portfolio with the new value
      await Portfolio.update(
        { investmentValue: updatedInvestmentValue },
        { where: { id: portfolio.id } }
      );

      console.log(`Portfolio ID ${portfolio.id} updated successfully.`);
    }

    // Recursively call the function for the next page
    updatePortfolioValues(page + 1);
  } catch (error) {
    console.error("Error updating portfolio values:", error.message);
  }
};

// Schedule the cron job to run every hour
cron.schedule("0 * * * *", () => {
  console.log("Running hourly portfolio update...");
  updatePortfolioValues(1);  // Start from page 1
});

module.exports = { updatePortfolioValues };
