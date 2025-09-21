// model/ReminderModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Reminder = sequelize.define(
  "Reminder",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    applicationId: { type: DataTypes.UUID, allowNull: false },
    note: { type: DataTypes.TEXT },
    remindAt: { type: DataTypes.DATE, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "sent", "dismissed"),
      defaultValue: "pending",
    },
    sentAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "reminders",
    timestamps: true,
  }
);

module.exports = Reminder;
