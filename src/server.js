require("dotenv").config();
const app = require("./app");
const { connectDB, sequelize } = require("./utils/db");
require("./utils/cron");

const PORT = process.env.PORT || 5000;

(async () => {
  await connectDB();
  await sequelize.sync({ alter: true }); // Sync models to the database
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})();
