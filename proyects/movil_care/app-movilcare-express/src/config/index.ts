import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
import "../databases/models";
import { sequelize, testConnection } from "../databases/db";
import apiRouter from "../routes";
import { setupSwagger } from "../swagger";
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
    this.docs();
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
    this.app.use("/api", apiRouter);
  }

  private docs(): void {
    setupSwagger(this.app);
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
    await sequelize.sync({ alter: true });

    await new Promise<void>((resolve, reject) => {
      const server = this.app.listen(this.app.get('port'), () => {
        console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
        resolve();
      });

      server.on('error', (err) => reject(err));
    });
  }
}
