// model/NoteModel.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Note = sequelize.define("Note", {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});



module.exports = Note;
