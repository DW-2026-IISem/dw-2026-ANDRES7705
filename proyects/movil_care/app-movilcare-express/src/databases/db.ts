import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.MYSQL_NAME || "movilcare_dev",
  process.env.MYSQL_USER || "root",
  process.env.MYSQL_PASSWORD || "",
  {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT) || 3306,
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    define: { underscored: true, timestamps: true },
  }
);

export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("MySQL connection established");
  } catch (error) {
    console.error("MySQL connection failed:", error);
    throw error;
  }
}
