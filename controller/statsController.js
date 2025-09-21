const { Sequelize } = require("sequelize");
const Application = require("../model/ApplicationModel");

exports.statusStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Application.findAll({
      where: { userId },
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("status")), "count"],
      ],
      group: ["status"],
    });

    // Convert array into object
    const result = {};
    stats.forEach((s) => {
      result[s.status] = s.dataValues.count;
    });

    res.json(result);
  } catch (err) {
    console.error("statusStats:", err);
    res.status(500).json({ message: "Error fetching status stats" });
  }
};

exports.timelineStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Application.findAll({
      where: { userId },
      attributes: [
        [Sequelize.fn("DATE_FORMAT", Sequelize.col("appliedAt"), "%Y-%m-%d"), "date"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["date"],
      order: [[Sequelize.col("date"), "ASC"]],
    });

    res.json(stats);
  } catch (err) {
    console.error("timelineStats:", err);
    res.status(500).json({ message: "Error fetching timeline stats" });
  }
};
