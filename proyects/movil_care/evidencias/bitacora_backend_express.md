# Bitacora Backend Express

## Fase I - Tablas de Negocio 

## 1. ISS-00 — Requisitos previos

**Objetivo:** entorno listo para el laboratorio.  
**Bloqueado por:** ninguno.

### Criterios de aceptación (ISS-00)

- [X] `node -v` muestra v20+ (lab: v24.x)
- [X] `npm -v` responde
- [X] Motor de BD accesible (MySQL recomendado para el primer `sync`)

### Pasos

```bash
node -v
npm -v
```

### Verificación del ISS

```bash
node -v && npm -v
```

![alt text](imaneges/node_npm_v.png)

---

# 2. ISS-01 — Esqueleto del proyecto

**Objetivo:** proyecto npm + TypeScript + Express con estructura `features/` y servidor HTTP base.  
**Bloqueado por:** ISS-00.

### Criterios de aceptación (ISS-01) — consolidados

- [X] **2.1** Existe `package.json` con `"type": "commonjs"` y scripts `build` / `dev`
- [X] **2.2** Árbol `src/` con `config`, `database/seeders`, `routes`, `features/business/client` (auth **fuera de alcance** de este lab)
- [X] **2.3** Dependencias Express/TS instaladas (`npm ls --depth=0`)
- [X] **2.4** Existe `tsconfig.json` (`rootDir: ./src`, `outDir: ./dist`, `strict: true`)
- [X] **2.5** Existen `src/server.ts` y `src/config/index.ts` (esqueleto App)
- [X] `npx tsc --noEmit` sin errores al cerrar el ISS

---

## 2.1 Inicializar npm y scripts

**Criterios de este sub-ítem**

- [ ] `package.json` creado
- [ ] Scripts `build` y `dev` definidos

```bash
mkdir app-movilcare-express
cd app-movilcare-express
npm init -y
mkdir -p docs
```

![alt text](imaneges/init.png)

**PARCHE** — `package.json` **ya existe** (lo creó `npm init -y`).

- **Dentro de** `"scripts"`: deja solo (o añade) `build` y `dev` como abajo.
- **Debajo de** `"license"` (o al mismo nivel que `"scripts"`): asegúrate de `"type": "commonjs"`.

Estado esperado de esas claves:

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "nodemon --watch src --ext ts --exec ts-node -- src/server.ts"
  },
  "type": "commonjs"
}
```

```bash
node -e "const p=require('./package.json'); console.log(p.scripts)"
```

![alt text](imaneges/p=require.png)

---

## 2.2 Estructura de carpetas (features)

**Criterios de este sub-ítem**

- [ ] Carpetas de infra y features creadas según el árbol

```bash
mkdir -p \
  src/config \
  src/database/seeders \
  src/routes \
  src/features/business
```

![alt text](imaneges/carpetas.png)

```text
src/
├── config/
├── database/
│   └── seeders/          # solo carpeta (ISS-02 §3.3); runner en ISS-04
├── routes/
├── features/
│   └── business/s       # más features en ISS-06…08
└── server.ts             # §2.5
```

| Carpeta | Uso |
|---------|-----|
| `features/business/<entidad>/` | model + controller + routes (+ seeder, swagger, http, associations) |
| `database/seeders/` | counts + SeedersRunner (`npm run db:seed`) |
| `routes/index.ts` | Agregador de features |
| `config/` · `database/` | Arranque e infraestructura |

**Seeders (patrón del lab)**

| Pieza | Dónde |
|-------|-------|
| Por entidad | `src/features/business/<entidad>/<entidad>.seeder.ts` |
| Runner + counts | `src/database/seeders/{index,counts}.ts` → `npm run db:seed` |
| Datos falsos | `@faker-js/faker` |

```bash
find src -type d | sort
```

---

## 2.3 Dependencias base (Express + TypeScript)

**Criterios de este sub-ítem**

- [ ] `express`, `cors`, `dotenv`, `morgan` instalados
- [ ] `typescript`, `ts-node`, `nodemon`, `@types/*` instalados

```bash
npm install express@^5.2.1 cors@^2.8.6 dotenv@^17.4.2 morgan@^1.12.1

npm install -D typescript@~5.9.2 ts-node@^10.9.2 nodemon@^3.1.14 \
  @types/node@^22.20.3 @types/express@^5.0.6 \
  @types/cors@^2.8.19 @types/morgan@^1.9.10
```

> TypeScript en **5.9.x** por compatibilidad con `ts-node`.

```bash
npm ls --depth=0
```

![alt text](imaneges/depth.png)

---

## 2.4 TypeScript (`tsconfig.json`)

**Criterios de este sub-ítem**

- [ ] `tsconfig.json` con `rootDir: ./src`, `outDir: ./dist`, `strict: true`

```bash
: > tsconfig.json
cat >> tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "module": "commonjs",
    "target": "ES2020",
    "lib": ["ES2020"],
    "types": ["node"],
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "sourceMap": true,
    "strict": true,
    "skipLibCheck": true,
    "moduleDetection": "force",
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

```bash
test -f tsconfig.json && npx tsc --showConfig | head -20
```

---

## 2.5 Servidor y App (esqueleto HTTP)

**Criterios de este sub-ítem**

- [ ] Existen `src/server.ts` y `src/config/index.ts`
- [ ] `App` define `settings`, `middlewares`, `routes`, `dbConnection`, `listen` (placeholders OK)

### 2.5.1 `src/server.ts`

```bash
: > src/server.ts
cat >> src/server.ts << 'EOF'
import { App } from './config/index';

async function main() {
    const app = new App();
    await app.listen();
}

main();
EOF
```

### 2.5.2 `src/config/index.ts` (esqueleto)

> En ISS-01 el App es **esqueleto**. Los imports de modelos, associations, Routes,
> Swagger y el `sync` completo se añaden con **PARCHE** en ISS-02…08.
> El archivo **final** consolidado aparece al cierre de ISS-08.

```bash
: > src/config/index.ts
cat >> src/config/index.ts << 'EOF'
import dotenv from "dotenv";
import express, { Application } from "express";
import morgan from "morgan";
var cors = require("cors");

dotenv.config();

export class App {
  public app: Application;

  constructor(private port?: number | string) {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.dbConnection();
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
    // ISS-02 / ISS-03
  }

  async listen() {
    await this.app.listen(this.app.get('port'));
    console.log(`🚀 Servidor ejecutándose en puerto ${this.app.get('port')}`);
  }
}
EOF
```

### Verificación del ISS-01

```bash
npx tsc --noEmit
find src -type f | sort
```

### Cierre del ISS

```bash
npm run dev
```

![alt text](imaneges/run.png)

> El servidor debe arrancar sin error. Detenerlo con Ctrl+C antes de continuar.

# 3. ISS-02 — Sequelize y conexión a MySQL

**Objetivo:** conexión reutilizable y configuración fuera del código. **Bloqueado por:** ISS-01.

### Criterios de aceptación

- [ ] Sequelize y `mysql2` instalados.
- [ ] `.env` contiene conexión para MySQL y está excluido de Git.
- [ ] `src/databases/db.ts` exporta `sequelize` y `testConnection`.
- [ ] La aplicación prueba la conexión antes de sincronizar modelos.

## 3.1 Dependencias y entorno

```bash
npm install sequelize@^6 mysql2
```

Añade `.env`:

```dotenv
PORT=4000
DB_ENGINE=mysql
MYSQL_HOST=172.23.120.29
MYSQL_PORT=3307
MYSQL_USER=root
MYSQL_PASSWORD=andres123453
MYSQL_NAME=movil_care
NODE_ENV=development
```

Asegúrate de que `.env` esté incluido en `.gitignore`. Usa `.env.example` para compartir solo claves y valores de muestra.

## 3.2 Crear `src/databases/db.ts`

```bash
: > src/databases/db.ts
cat >> src/databases/db.ts << 'EOF'
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
  await sequelize.authenticate();
  console.log("MySQL connection established");
}
EOF
```

**PARCHE** — importa `sequelize` y `testConnection` en `src/configs/index.ts`, e implementa una inicialización asíncrona antes de abrir el puerto. Desde ISS-03 se registrarán los modelos y asociaciones antes de `sequelize.sync({ alter: true })`.

**Verificación y cierre:** `npx tsc --noEmit`; con MySQL activo, `npm run dev` debe conectar sin crear aún tablas de negocio.

![alt text](imaneges/run-iss02.png)

---

# 4. ISS-03 — Features base

**Objetivo:** crear las entidades independientes `products`, `customers`, `employees` y `spare_parts`, cada una con modelo, controller, rutas CRUD y pruebas HTTP. **Bloqueado por:** ISS-02.

### Criterios de aceptación

- [ ] Están creadas las cuatro carpetas inglesas plurales indicadas.
- [ ] Cada modelo declara explícitamente `tableName`, `timestamps: true` y `underscored: true`.
- [ ] GET all, GET by id, POST, PUT, PATCH y DELETE responden con códigos HTTP adecuados.
- [ ] Las rutas base son `/api/products`, `/api/customers`, `/api/employees` y `/api/spare-parts`.
- [ ] Los modelos quedan registrados antes del `sync`.

## 4.1 Carpetas y archivos por feature

```bash
for feature in products customers employees spare-parts; do
  mkdir -p "src/features/businesses/$feature/requests"
done
```

En cada feature crea `<feature>.model.ts`, `<feature>.controller.ts` y `<feature>.routes.ts`. El patrón de modelo siguiente es ilustrativo; declara en cada `init` todas las columnas de la tabla correspondiente, según la matriz ISS-03. No copies atributos que no pertenezcan a esa entidad.

## 4.2 Patrón de modelo Sequelize

```ts
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../databases/db";

export class Product extends Model {
  declare id: number;
  declare sku: string;
  declare name: string;
  declare price: number;
  declare isActive: boolean;
}

Product.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    sku: { type: DataTypes.STRING(40), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(150), allowNull: false },
    price: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
    underscored: true,
  }
);
```

`DECIMAL` puede llegar como string en Sequelize; valida y serializa importes sin asumir que siempre son números JS. Define ENUMs con los valores exactos de la tabla. Usa índices únicos compuestos donde la matriz lo indique.

## 4.3 Matriz de columnas de negocio

Los nombres de esta matriz son atributos de API en inglés `camelCase`; `underscored: true` los almacena como columnas `snake_case`. En cada tabla agrega `id` autoincremental `BIGINT` y timestamps salvo donde se indique otra cosa.

### `products` — `products.model.ts`

| Atributo | Tipo / restricciones |
|---|---|
| `sku` | `STRING(40)`, requerido, único |
| `name` | `STRING(150)`, requerido |
| `description` | `TEXT`, opcional |
| `type` | ENUM `EQUIPMENT`, `ACCESSORY`, requerido |
| `brand`, `model` | `STRING(80)`, opcionales |
| `requiresSerial` | BOOLEAN, default `false` |
| `cost` | `DECIMAL(12,2)`, no negativo |
| `price` | `DECIMAL(12,2)`, requerido, no negativo |
| `taxPercentage` | `DECIMAL(5,2)`, default `0` |
| `defaultWarrantyMonths` | SMALLINT, default `0` |
| `isActive` | BOOLEAN, default `true` |

### `customers` — `customers.model.ts`

| Atributo | Tipo / restricciones |
|---|---|
| `documentType` | ENUM `CC`, `CE`, `NIT`, `PASSPORT`, `TI`, requerido |
| `documentNumber` | `STRING(30)`, requerido; único junto con `documentType` |
| `firstName` | `STRING(100)`, requerido |
| `lastName` | `STRING(100)`, opcional |
| `companyName` | `STRING(150)`, opcional |
| `phone` | `STRING(20)`, opcional |
| `email` | `STRING(120)`, opcional, validar formato; único cuando tenga valor |
| `address` | `STRING(200)`, opcional |
| `isActive` | BOOLEAN, default `true` |

### `employees` — `employees.model.ts`

| Atributo | Tipo / restricciones |
|---|---|
| `name` | `STRING(150)`, requerido |
| `document` | `STRING(30)`, único |
| `role` | ENUM `SELLER`, `TECHNICIAN`, `ADMIN`, requerido |
| `email` | `STRING(120)`, único |
| `isActive` | BOOLEAN, default `true` |

### `spare_parts` — `spare-parts.model.ts`

| Atributo | Tipo / restricciones |
|---|---|
| `sku` | `STRING(40)`, requerido, único |
| `name` | `STRING(150)`, requerido |
| `description` | TEXT, opcional |
| `compatibility` | `STRING(255)`, opcional |
| `cost`, `price` | `DECIMAL(12,2)`, no negativos |
| `currentStock` | INTEGER, requerido, default `0`, no negativo |
| `minimumStock` | INTEGER, default `0` |
| `isActive` | BOOLEAN, default `true` |

## 4.4 CRUD común

Implementa para cada feature la secuencia que sigue el laboratorio de referencia. Controladores deben validar parámetros/body y traducir errores de validación a `400`, registros inexistentes a `404`, altas a `201`, consultas/actualizaciones/borrados correctos a `200` o `204`, y errores inesperados a `500` sin filtrar secretos.

```text
GET     /api/<plural>       listar con paginación; excluir inactivos solo si el endpoint lo documenta
GET     /api/<plural>/:id   obtener una entidad por id
POST    /api/<plural>       crear y devolver la entidad
PUT     /api/<plural>/:id   reemplazo validado de los campos editables
PATCH   /api/<plural>/:id   actualización parcial de campos permitidos
DELETE  /api/<plural>/:id   baja lógica si tiene is_active; no borrar historia transaccional
```

Usa `req.params.id` validado como entero positivo. No hagas `Model.update(req.body)` directamente: selecciona explícitamente las propiedades editables. Nunca permitas actualizar claves primarias, timestamps ni asociaciones no autorizadas por el caso de uso.

## 4.5 Enrutamiento

En cada `<feature>.routes.ts`, registra el endpoint base inglés plural y sus métodos HTTP. En `src/routes/index.ts`, monta cada router con `app.use("/api", router)` o una convención equivalente uniforme. No mezcles endpoints traducidos al español con endpoints ingleses.

**Pruebas HTTP:** crea archivos REST Client en `requests/`, por ejemplo `products.get.http`, `products.create.http`, con `@baseUrl = http://localhost:4000` y JSON que respete las columnas requeridas.

**Verificación y cierre:** `npx tsc --noEmit`; prueba el CRUD de las cuatro entidades, comprueba restricciones de unicidad y ejecuta `npm run dev`.

![alt text](image.png)

---