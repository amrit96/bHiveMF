const NodeCache = require("node-cache");
const axios = require("axios");
const Portfolio = require("../models/portfolio");

const cache = new NodeCache({ stdTTL: 900, checkperiod: 600 });

const fetchFundData = async (fundFamily) => {
    const cachedData = cache.get(fundFamily);
    
    if (cachedData) {
      console.log(`Using cached data for fund family: ${fundFamily}`);
      return cachedData;  // Return cached data if available
    }
  
    try {
        const RAPID_API_BASE_URL = "https://latest-mutual-fund-nav.p.rapidapi.com/latest"
        const RTA_AGENT_CODE = "CAMS"
        const SCHEMA_TYPE = "Open Ended Schemes"
        const url = `${RAPID_API_BASE_URL}?RTA_Agent_Code=${RTA_AGENT_CODE}&Scheme_Type=${SCHEMA_TYPE}&Mutual_Fund_Family=${fundFamily}`;
      
        const response = await axios.get(url, {
            headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY },
        });
    
        // Cache the data with the fund family name as the key
        cache.set(fundFamily, response.data);
        console.log(`Fetched and cached data for fund family: ${fundFamily}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching data for ${fundFamily}:`, error.message);
        throw error;
    }
};

// Controller function to get mutual fund data for a specific portfolio
const getFunds = async (req, res) => {
    const { fundFamily } = req.params;  // Fund family passed in the request

    try {
        const fundData = await fetchFundData(fundFamily);
        res.status(200).json({
            data: fundData,
        });
    } catch (error) {
        res.status(500).json({
        message: `Error fetching fund data: ${error.message}`,
        });
    }
};

module.exports = {
  getFunds,
};
