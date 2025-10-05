
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Application = sequelize.define("Application", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM("applied", "phone", "interview", "offer", "rejected", "withdrawn"),
    defaultValue: "applied",
  },
  appliedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  notes: { type: DataTypes.TEXT },
  userId: { type: DataTypes.INTEGER, allowNull: false },
}, {
  tableName: "applications",
});

module.exports = Application;
