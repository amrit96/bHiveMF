const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/db");
const User = require("./user");

const Portfolio = sequelize.define("Portfolio", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  fundName: { type: DataTypes.STRING, allowNull: false },
  investmentValue: { type: DataTypes.FLOAT, allowNull: false },
});

Portfolio.belongsTo(User, { foreignKey: "userId" });

module.exports = Portfolio;
