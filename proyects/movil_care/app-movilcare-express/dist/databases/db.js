"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
exports.testConnection = testConnection;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.sequelize = new sequelize_1.Sequelize(process.env.MYSQL_NAME || "movilcare_dev", process.env.MYSQL_USER || "root", process.env.MYSQL_PASSWORD || "", {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: { underscored: true, timestamps: true },
});
async function testConnection() {
    try {
        await exports.sequelize.authenticate();
        console.log("MySQL connection established");
    }
    catch (error) {
        console.error("MySQL connection failed:", error);
        throw error;
    }
}
//# sourceMappingURL=db.js.map