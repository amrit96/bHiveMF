const axios = require("axios");

exports.getFunds = async (req, res) => {
  const { fundFamily } = req.params;

  try {
    const RAPID_API_BASE_URL = "https://latest-mutual-fund-nav.p.rapidapi.com/latest"
    const RTA_AGENT_CODE = "CAMS"
    const SCHEMA_TYPE = "Open Ended Schemes"
    const url = `${RAPID_API_BASE_URL}?RTA_Agent_Code=${RTA_AGENT_CODE}&Scheme_Type=${SCHEMA_TYPE}&Mutual_Fund_Family=${fundFamily}`;

    const response = await axios.get(url, {
      headers: { "X-RapidAPI-Key": process.env.RAPIDAPI_KEY },
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching mutual fund data" });
  }
};
