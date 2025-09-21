const { DataTypes } = require('sequelize')
const sequelize = require('../db')


const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    careerGoal: {
        type: DataTypes.TEXT
    },
    phone: {
        type: DataTypes.STRING
    },
    linkedin: {
        type: DataTypes.STRING
    }
})

module.exports = User;