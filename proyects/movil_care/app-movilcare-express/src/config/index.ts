import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
import { sequelize, testConnection } from "../databases/db";
var cors = require("cors");

dotenv.config();

export { sequelize };

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
  }

  private settings(): void {
    this.app.set('port', this.port || process.env.PORT || 4000);
  }

  private middlewares(): void {
    this.app.use(morgan('dev'));
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  private routes(): void {
    // ISS-03 §4.3
  }

  private async dbConnection(): Promise<void> {
    try {
      await testConnection();
    } catch (error) {
      console.error('Error connecting to MySQL database:', error);
      throw error;
    }
  }

  async listen() {
    await this.dbConnection();

    await new Promise<void>((resolve, reject) => {
      const server = this.app.listen(this.app.get('port'), () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
        resolve();
      });

      server.on('error', (err) => reject(err));
    });
  }
}
