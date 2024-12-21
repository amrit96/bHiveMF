const Portfolio = require("../models/portfolio");

exports.getPortfolio = async (req, res) => {
  const { userId } = req.params;

  try {
    const portfolio = await Portfolio.findAll({ where: { userId } });
    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
