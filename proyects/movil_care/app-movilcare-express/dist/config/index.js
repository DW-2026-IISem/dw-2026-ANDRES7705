"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = exports.sequelize = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
require("../databases/models");
const db_1 = require("../databases/db");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return db_1.sequelize; } });
const routes_1 = __importDefault(require("../routes"));
var cors = require("cors");
dotenv_1.default.config();
class App {
    constructor(port) {
        this.port = port;
        this.app = (0, express_1.default)();
        this.settings();
        this.middlewares();
        this.routes();
    }
    settings() {
        this.app.set('port', this.port || process.env.PORT || 4000);
    }
    middlewares() {
        this.app.use((0, morgan_1.default)('dev'));
        this.app.use(cors());
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: false }));
    }
    routes() {
        this.app.use("/api", routes_1.default);
    }
    async dbConnection() {
        try {
            await (0, db_1.testConnection)();
        }
        catch (error) {
            console.error('Error connecting to MySQL database:', error);
            throw error;
        }
    }
    async listen() {
        await this.dbConnection();
        await db_1.sequelize.sync({ alter: true });
        await new Promise((resolve, reject) => {
            const server = this.app.listen(this.app.get('port'), () => {
                console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
                resolve();
            });
            server.on('error', (err) => reject(err));
        });
    }
}
exports.App = App;
//# sourceMappingURL=index.js.map