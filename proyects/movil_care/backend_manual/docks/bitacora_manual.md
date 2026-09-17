
## 2. Requisitos previos

- **Node.js ≥ 20** y **npm ≥ 10**: `node -v` y `npm -v`.
- **Nest CLI** instalado globalmente (lo usa `nest new`):

```bash
npm install -g @nestjs/cli
```

- Una base de datos accesible (en el laboratorio se usa **MySQL**, pero soporta `mysql | postgres | mssql | oracle`).
- Terminal con `bash` (para los heredocs).

```bash
node -v && npm -v && nest --version
```
<p align="center">
  <img src="capturas/Captura.PNG">
</p>



### 3.2 Crear el proyecto con `nest new`

```bash
nest new . --package-manager npm --skip-git
```
<p align="center">
  <img src="capturas/paso2.PNG">
</p>

### 3.3 Convertir a ESM y definir los scripts

> ⚙️ `transversal` — `package.json` (raíz del proyecto).

```bash
cat > package.json <<'EOF_BACKEND_IA'
{
  "name": "backend-nest-ia",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "npm run free:port && nest start --watch",
    "start:prod": "node dist/main",
    "lint": "oxlint src/ test/",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts",
    "free:port": "node scripts/free-port.js"
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/paso3.PNG">
</p>

### 3.4 Instalar dependencias adicionales

> `nest new` ya instaló las **base**. Instala las **adicionales** de este proyecto:

```bash
npm install @nestjs/swagger \
  sequelize sequelize-typescript mysql2 pg oracledb tedious \
  class-validator class-transformer dotenv
```

| Paquete | Función |
|---|---|
| `@nestjs/swagger` | documentación OpenAPI/Swagger desde decoradores. |
| `sequelize` + `sequelize-typescript` | ORM; el segundo añade decoradores `@Table`/`@Column`. |
| `mysql2` / `pg` / `oracledb` / `tedious` | drivers de BD para **elegir el motor** con una variable de entorno. |
| `class-validator` | validación declarativa (`@IsString`, `@IsEmail`, …). |
| `class-transformer` | convierte objetos planos a instancias (`plainToInstance`, `@Type`). |
| `dotenv` | carga `.env` en `process.env`. |

```bash
npm install -D @types/supertest \
  vitest @vitest/coverage-v8 vite-tsconfig-paths supertest \
  oxlint source-map-support
```

| Paquete | Función |
|---|---|
| `@types/supertest` | tipos para Supertest. |
| `vitest` + `@vitest/coverage-v8` | framework de pruebas y cobertura. |
| `vite-tsconfig-paths` | resuelve alias de `tsconfig` en Vitest. |
| `supertest` | cliente HTTP para pruebas e2e. |
| `oxlint` | linter rápido. |
| `source-map-support` | stack traces en producción. |

<p align="center">
  <img src="capturas/captura 33.PNG">
</p>

### 3.5 Configurar TypeScript y tooling

> ⚙️ `transversal` — archivos de configuración.

```bash
cat > tsconfig.json <<'EOF_BACKEND_IA'
{
  "compilerOptions": {
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "resolvePackageJsonExports": true,
    "esModuleInterop": true,
    "isolatedModules": true,
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictPropertyInitialization": false,
    "types": ["vitest/globals", "node"]
  }
}
EOF_BACKEND_IA
```

- `module`/`moduleResolution: "nodenext"` → ESM. `emitDecoratorMetadata` + `experimentalDecorators` → decoradores de Nest.

```bash
cat > tsconfig.build.json <<'EOF_BACKEND_IA'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "rootDir": "./src" },
  "include": ["src"],
  "exclude": ["node_modules", "test", "dist", "**/*spec.ts"]
}
EOF_BACKEND_IA
```

```bash
cat > nest-cli.json <<'EOF_BACKEND_IA'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": { "deleteOutDir": true }
}
EOF_BACKEND_IA
```

```bash
cat > .prettierrc <<'EOF_BACKEND_IA'
{
  "singleQuote": true,
  "trailingComma": "all"
}
EOF_BACKEND_IA
```

```bash
cat > oxlint.json <<'EOF_BACKEND_IA'
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/crates/oxc_linter/src/rules.rs",
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-floating-promises": "warn"
  },
  "env": { "node": true }
}
EOF_BACKEND_IA
```

```bash
cat > .gitignore <<'EOF_BACKEND_IA'
# dependencias y build
node_modules/
dist/

# entorno local
.env
.env.local
.env.*.local

# logs
*.log
npm-debug.log*
*.tsbuildinfo
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 35.PNG">
</p>

 ## 3.6 Script auxiliar y variables de entorno

```bash
mkdir -p scripts
cat > scripts/free-port.js <<'EOF_BACKEND_IA'
import { execSync } from 'node:child_process';

const port = process.env.PORT ?? 3002;
const label = `[free-port]`;

function findAndKill(p) {
  const commands = [`lsof -ti tcp:${p}`, `fuser ${p}/tcp 2>/dev/null`];
  for (const cmd of commands) {
    try {
      const out = execSync(cmd, { encoding: 'utf8' }).trim();
      if (!out) continue;
      for (const pid of out.split(/\s+/).filter(Boolean)) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`${label} liberado: mató PID ${pid} en el puerto ${p}`);
        } catch { /* ya no existe */ }
      }
      return;
    } catch { /* comando no disponible o puerto libre */ }
  }
  console.log(`${label} puerto ${p} libre`);
}

findAndKill(port);
EOF_BACKEND_IA
```

```bash
cat > .env.example <<'EOF_BACKEND_IA'
PORT=3002
NODE_ENV=development
DB_DIALECT=mysql
DB_MYSQL_HOST=<IP_HOST_DOCKER>
DB_MYSQL_PORT=3306
DB_MYSQL_USERNAME=admin
DB_MYSQL_PASSWORD=<PASSWORD>
DB_MYSQL_NAME=tecnogua_ia
EOF_BACKEND_IA
```


```bash
cp .env.example .env
```

<p align="center">
  <img src="capturas/Captura 36.PNG">
</p>

### 3.7 Estructura de carpetas

```bash
mkdir -p src/common/exceptions src/common/filters src/common/interceptors
mkdir -p src/config/environment
mkdir -p src/infrastructure/database/sequelize src/infrastructure/database/seeders
mkdir -p src/health
mkdir -p src/features/business
for f in clients product-types products sales; do
  mkdir -p "src/features/business/$f/domain/entities" \
           "src/features/business/$f/domain/interfaces" \
           "src/features/business/$f/domain/exceptions" \
           "src/features/business/$f/application/dto" \
           "src/features/business/$f/application/mappers" \
           "src/features/business/$f/application/use-cases" \
           "src/features/business/$f/infrastructure/persistence/models" \
           "src/features/business/$f/infrastructure/persistence/repositories" \
           "src/features/business/$f/infrastructure/persistence/seeders" \
           "src/features/business/$f/presentation/http/controllers"
done
```

> ✅ **Fin de ISS-01**: el proyecto arranca (aún sin features). El resto de capas se crean en los siguientes segmentos.

<p align="center">
  <img src="capturas/Captura 37.PNG">
</p>

## 4. ISS-02 · Entorno Sequelize y common

> **Segmento:** configuración validada, manejo uniforme de errores, interceptores y conexión a BD (todo transversal).

### 4.1 Capa de configuración `config/environment`

> ⚙️ `transversal` — carga, valida y tipa las variables de entorno.


**4.1.1 Tipos (`env.interface.ts`):**

```bash
cat > src/config/environment/env.interface.ts <<'EOF_BACKEND_IA'
export type DbDialect = 'mysql' | 'postgres' | 'mssql' | 'oracle';

export interface IDbBlock {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  connectString?: string;
}

export interface IEnvConfig {
  port: number;
  nodeEnv: string;
  dbDialect: DbDialect;
  mysql: IDbBlock;
  postgres: IDbBlock;
  mssql: IDbBlock;
  oracle: IDbBlock;
}
EOF_BACKEND_IA
```


<p align="center">
  <img src="capturas/411.PNG">
</p>

**4.1.2 Validación (`env.validation.ts`):**

```bash
cat > src/config/environment/env.validation.ts <<'EOF_BACKEND_IA'
import { plainToInstance } from 'class-transformer';
import { IsIn, IsNotEmpty, validateSync, ValidateIf } from 'class-validator';

const DIALECTS = ['mysql', 'postgres', 'mssql', 'oracle'];

export class EnvVariables {
  @IsIn(DIALECTS, {
    message: 'DB_DIALECT debe ser mysql | postgres | mssql | oracle',
  })
  DB_DIALECT!: string;

  // MySQL
  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_HOST es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_USERNAME es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mysql')
  @IsNotEmpty({ message: 'DB_MYSQL_NAME es requerida (DB_DIALECT=mysql)' })
  DB_MYSQL_NAME?: string;

  // PostgreSQL
  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_HOST es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_USERNAME es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'postgres')
  @IsNotEmpty({ message: 'DB_POSTGRES_NAME es requerida (DB_DIALECT=postgres)' })
  DB_POSTGRES_NAME?: string;

  // MSSQL
  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_HOST es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_USERNAME es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'mssql')
  @IsNotEmpty({ message: 'DB_MSSQL_NAME es requerida (DB_DIALECT=mssql)' })
  DB_MSSQL_NAME?: string;

  // Oracle
  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_HOST es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_HOST?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_USERNAME es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_USERNAME?: string;
  @ValidateIf((o) => o.DB_DIALECT === 'oracle')
  @IsNotEmpty({ message: 'DB_ORACLE_NAME es requerida (DB_DIALECT=oracle)' })
  DB_ORACLE_NAME?: string;
}

export function validateEnv(raw: Record<string, unknown>): EnvVariables {
  const config = plainToInstance(EnvVariables, raw);
  const errors = validateSync(config, { whitelist: false, forbidNonWhitelisted: false });
  if (errors.length > 0) {
    const messages = errors
      .map((e) => Object.values(e.constraints ?? {}).join('; '))
      .join(' | ');
    throw new Error(`Error de configuración: ${messages}`);
  }
  return config;
}
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura 412.PNG">
</p>


**4.1.3 Selector de BD (`db-env.ts`):**

```bash
cat > src/config/environment/db-env.ts <<'EOF_BACKEND_IA'
import { IDbBlock, IEnvConfig } from './env.interface.js';

export function getDbBlock(cfg: IEnvConfig): IDbBlock {
  switch (cfg.dbDialect) {
    case 'mysql':
      return cfg.mysql;
    case 'postgres':
      return cfg.postgres;
    case 'mssql':
      return cfg.mssql;
    case 'oracle':
      return cfg.oracle;
    default:
      throw new Error(`Dialecto no soportado: ${String(cfg.dbDialect)}`);
  }
}
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura413.PNG">
</p>

**4.1.4 Carga (`env.config.ts`):**

```bash
cat > src/config/environment/env.config.ts <<'EOF_BACKEND_IA'
import { config as loadDotenv } from 'dotenv';
import { IDbBlock, IEnvConfig, DbDialect } from './env.interface.js';
import { validateEnv } from './env.validation.js';

export const ENV_CONFIG = Symbol('ENV_CONFIG');

function toBlock(prefix: string, raw: Record<string, unknown>, defaultPort: number): IDbBlock {
  return {
    host: String(raw[`DB_${prefix}_HOST`] ?? 'localhost'),
    port: Number(raw[`DB_${prefix}_PORT`] ?? defaultPort),
    username: String(raw[`DB_${prefix}_USERNAME`] ?? ''),
    password: String(raw[`DB_${prefix}_PASSWORD`] ?? ''),
    name: String(raw[`DB_${prefix}_NAME`] ?? ''),
    connectString: raw[`DB_${prefix}_CONNECT_STRING`]
      ? String(raw[`DB_${prefix}_CONNECT_STRING`])
      : undefined,
  };
}

export function loadEnvConfig(): IEnvConfig {
  loadDotenv();
  const raw = process.env as Record<string, unknown>;
  validateEnv(raw);
  const dialect = String(raw.DB_DIALECT) as DbDialect;
  return {
    port: Number(raw.PORT ?? 3002),
    nodeEnv: String(raw.NODE_ENV ?? 'development'),
    dbDialect: dialect,
    mysql: toBlock('MYSQL', raw, 3306),
    postgres: toBlock('POSTGRES', raw, 5432),
    mssql: toBlock('MSSQL', raw, 1433),
    oracle: toBlock('ORACLE', raw, 1521),
  };
}

export const envConfig = {
  KEY: ENV_CONFIG,
};
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 414.PNG">
</p>

**4.1.5 Módulo global (`environment.module.ts`):**

```bash
cat > src/config/environment/environment.module.ts <<'EOF_BACKEND_IA'
import { Global, Module } from '@nestjs/common';
import { envConfig, loadEnvConfig } from './env.config.js';

@Global()
@Module({
  providers: [
    {
      provide: envConfig.KEY,
      useFactory: () => loadEnvConfig(),
    },
  ],
  exports: [envConfig.KEY],
})
export class EnvironmentModule {}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 415.PNG">
</p>


**4.1.6 Barrel (`index.ts`):**

```bash
cat > src/config/environment/index.ts <<'EOF_BACKEND_IA'
export * from './env.interface.js';
export * from './env.validation.js';
export * from './db-env.js';
export * from './env.config.js';
export * from './environment.module.js';
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura 416.PNG">
</p>

### 4.2 Excepciones `common/exceptions`

> ⚙️ `transversal` — jerarquía de errores de negocio → códigos HTTP.

```bash
cat > src/common/exceptions/application.exception.ts <<'EOF_BACKEND_IA'
export class ApplicationException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/common/exceptions/business-rule.exception.ts <<'EOF_BACKEND_IA'
import { ApplicationException } from './application.exception.js';

export class BusinessRuleException extends ApplicationException {
  constructor(message: string) {
    super(409, message);
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/common/exceptions/domain.exception.ts <<'EOF_BACKEND_IA'
import { ApplicationException } from './application.exception.js';

export class DomainException extends ApplicationException {
  constructor(message: string) {
    super(400, message);
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/common/exceptions/entity-not-found.exception.ts <<'EOF_BACKEND_IA'
import { ApplicationException } from './application.exception.js';

export class EntityNotFoundException extends ApplicationException {
  constructor(message = 'Entidad no encontrada') {
    super(404, message);
  }
}
EOF_BACKEND_IA
```


<p align="center">
  <img src="capturas/Captura 42.PNG">
</p>

### 4.3 Filtro global de errores

> ⚙️ `transversal` — convierte cualquier excepción en una respuesta JSON uniforme.

```bash
cat > src/common/filters/global-exception.filter.ts <<'EOF_BACKEND_IA'
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApplicationException } from '../exceptions/application.exception.js';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Error interno del servidor';

    if (exception instanceof ApplicationException) {
      status = exception.statusCode;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else if (body && typeof body === 'object') {
        message = (body as { message?: string | string[] }).message ?? exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const msg = Array.isArray(message) ? message.join('; ') : message;
    this.logger.error(`${req.method} ${req.url} → ${status}: ${msg}`);

    res.status(status).json({
      statusCode: status,
      message: msg,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura43.PNG">
</p>

### 4.5 Persistencia Sequelize

> ⚙️ `transversal` — factoría y módulo global de base de datos.

```bash
cat > src/infrastructure/database/sequelize/sequelize.factory.ts <<'EOF_BACKEND_IA'
import { Sequelize } from 'sequelize-typescript';
import { getDbBlock } from '../../../config/environment/db-env.js';
import { IEnvConfig } from '../../../config/environment/env.interface.js';

// TODO: importa aquí los modelos a medida que crees cada feature.
// En ISS-03..ISS-06 se añaden los modelos de business.

export const ALL_MODELS: any[] = [];

export function sequelizeFactory(cfg: IEnvConfig): Sequelize {
  const block = getDbBlock(cfg);
  const options: Record<string, unknown> = {
    dialect: cfg.dbDialect,
    host: block.host,
    port: block.port,
    username: block.username,
    password: block.password,
    database: block.name,
    models: ALL_MODELS,
    logging: false,
  };
  if (cfg.dbDialect === 'oracle' && block.connectString) {
    options.connectString = block.connectString;
  }
  return new Sequelize(options);
}
EOF_BACKEND_IA
```

```bash
cat > src/infrastructure/database/sequelize/sequelize.module.ts <<'EOF_BACKEND_IA'
import { Global, Logger, Module } from '@nestjs/common';
import { getDbBlock } from '../../../config/environment/db-env.js';
import { envConfig } from '../../../config/environment/env.config.js';
import { IEnvConfig } from '../../../config/environment/env.interface.js';
import { sequelizeFactory } from './sequelize.factory.js';

export const SEQUELIZE = 'SEQUELIZE';

@Global()
@Module({
  providers: [
    {
      provide: SEQUELIZE,
      inject: [envConfig.KEY],
      useFactory: async (cfg: IEnvConfig) => {
        const sequelize = sequelizeFactory(cfg);
        await sequelize.authenticate();
        await sequelize.sync({ alter: false });
        const block = getDbBlock(cfg);
        Logger.log(
          `Conexión exitosa a la base de datos (${cfg.dbDialect}) ${block.host}:${block.port}/${block.name}`,
          'Sequelize',
        );
        return sequelize;
      },
    },
  ],
  exports: [SEQUELIZE],
})
export class SequelizeModule {}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 45.PNG">
</p>

### 4.6 Health check y arranque

> ⚙️ `transversal` — `health` + `main.ts` + `app.module.ts` (versión mínima).

```bash
cat > src/health/health.controller.ts <<'EOF_BACKEND_IA'
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok' };
  }
}
EOF_BACKEND_IA
```


```bash
cat > src/main.ts <<'EOF_BACKEND_IA'
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter.js';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:4200', credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new LoggingInterceptor(),
    new TimeoutInterceptor(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('StoreLab — Backend solo Business')
    .setDescription('API de negocio: clients, product-types, products, sales.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3002);
}
await bootstrap();
EOF_BACKEND_IA
```


```bash
cat > src/app.module.ts <<'EOF_BACKEND_IA'
import { Module } from '@nestjs/common';
import { EnvironmentModule } from './config/environment/environment.module.js';
import { HealthController } from './health/health.controller.js';
import { SequelizeModule } from './infrastructure/database/sequelize/sequelize.module.js';

@Module({
  imports: [EnvironmentModule, SequelizeModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
EOF_BACKEND_IA
```

> **Versión mínima**: en ISS-07 añadiremos `BusinessModule` + `SeedersRunner`.

> ✅ **Fin de ISS-02**: configuración, errores, interceptores y BD listos. La app arranca y conecta.

<p align="center">
  <img src="capturas/Captura 46.PNG">
</p>

## 5. ISS-03 · Feature clients

> **Segmento:** primera feature completa. Fija el patrón Clean Architecture que se repite en las demás. Orden: `domain → application → infrastructure → presentation`.

### 5.1 Capa de dominio

> 🟢 `domain` — núcleo puro (sin Nest/Sequelize/HTTP).

**Entidad `Client`:**

```bash
cat > src/features/business/clients/domain/entities/client.entity.ts <<'EOF_BACKEND_IA'
export type ClientStatus = 'active' | 'inactive';

export interface ClientProps {
  id?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: ClientStatus;
}

export class Client {
  readonly id: number | null;
  readonly name: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly address: string | null;
  readonly status: ClientStatus;

  constructor(props: ClientProps) {
    this.id = props.id ?? null;
    this.name = props.name;
    this.email = props.email ?? null;
    this.phone = props.phone ?? null;
    this.address = props.address ?? null;
    this.status = props.status ?? 'active';
  }
}
EOF_BACKEND_IA
```

**Puerto `IClientRepository`:**

```bash
cat > src/features/business/clients/domain/interfaces/client.repository.ts <<'EOF_BACKEND_IA'
import { Client } from '../entities/client.entity.js';

export const CLIENT_REPOSITORY = 'IClientRepository';

export interface IClientRepository {
  create(client: Client): Promise<Client>;
  findAll(page: number, limit: number): Promise<{ items: Client[]; total: number }>;
  findById(id: number): Promise<Client | null>;
  findByEmail(email: string): Promise<Client | null>;
  count(): Promise<number>;
}
EOF_BACKEND_IA
```

**Excepciones:**

```bash
cat > src/features/business/clients/domain/exceptions/client-not-found.exception.ts <<'EOF_BACKEND_IA'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ClientNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Cliente con id ${id} no encontrado`);
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/clients/domain/exceptions/client-email-already-exists.exception.ts <<'EOF_BACKEND_IA'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class ClientEmailAlreadyExistsException extends BusinessRuleException {
  constructor(email: string) {
    super(`Ya existe un cliente con el email ${email}`);
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 51.PNG">
</p>

### 5.2 Capa de aplicacion 

> 🔵 `application` — DTOs, mappers y casos de uso (depende de `domain`).

**DTO:**

```bash
cat > src/features/business/clients/application/dto/create-client.dto.ts <<'EOF_BACKEND_IA'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateClientDto {
  @ApiProperty({ example: 'Ana María Pérez' })
  @IsString()
  @IsNotEmpty({ message: 'name es requerido' })
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({ example: 'ana@demo.com' })
  @IsOptional()
  @IsEmail({}, { message: 'email debe ser un correo válido' })
  @MaxLength(150)
  email?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @ApiPropertyOptional({ example: 'Riohacha, La Guajira' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;
}
EOF_BACKEND_IA
```

**Mapper:**

```bash
cat > src/features/business/clients/application/mappers/client.mapper.ts <<'EOF_BACKEND_IA'
import { Client } from '../../domain/entities/client.entity.js';
import { CreateClientDto } from '../dto/create-client.dto.js';

export class ClientMapper {
  static toEntity(dto: CreateClientDto): Client {
    return new Client({
      name: dto.name,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      status: 'active',
    });
  }

  static toResponse(client: Client) {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      status: client.status,
    };
  }
}
EOF_BACKEND_IA
```

**Casos de uso:**

```bash
cat > src/features/business/clients/application/use-cases/create-client.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { ClientEmailAlreadyExistsException } from '../../domain/exceptions/client-email-already-exists.exception.js';
import { CLIENT_REPOSITORY } from '../../domain/interfaces/client.repository.js';
import type { IClientRepository } from '../../domain/interfaces/client.repository.js';
import { CreateClientDto } from '../dto/create-client.dto.js';
import { ClientMapper } from '../mappers/client.mapper.js';
import type { Client } from '../../domain/entities/client.entity.js';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
  ) {}

  async execute(dto: CreateClientDto): Promise<Client> {
    if (dto.email) {
      const existing = await this.clientRepository.findByEmail(dto.email);
      if (existing) {
        throw new ClientEmailAlreadyExistsException(dto.email);
      }
    }
    return this.clientRepository.create(ClientMapper.toEntity(dto));
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/clients/application/use-cases/get-client-by-id.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { ClientNotFoundException } from '../../domain/exceptions/client-not-found.exception.js';
import { CLIENT_REPOSITORY } from '../../domain/interfaces/client.repository.js';
import type { IClientRepository } from '../../domain/interfaces/client.repository.js';
import type { Client } from '../../domain/entities/client.entity.js';

@Injectable()
export class GetClientByIdUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
  ) {}

  async execute(id: number): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new ClientNotFoundException(id);
    }
    return client;
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/clients/application/use-cases/list-clients.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { CLIENT_REPOSITORY } from '../../domain/interfaces/client.repository.js';
import type { IClientRepository } from '../../domain/interfaces/client.repository.js';
import { ClientMapper } from '../mappers/client.mapper.js';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.clientRepository.findAll(page, limit);
    return {
      items: items.map(ClientMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura 52.PNG">
</p>

### 5.3 Capa de infraestructura

> 🟠 `infrastructure` — implementa el puerto con Sequelize.

**Modelo:**

```bash
cat > src/features/business/clients/infrastructure/persistence/models/client.model.ts <<'EOF_BACKEND_IA'
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'clients', timestamps: true })
export class ClientModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare name: string;

  @Column({ type: DataType.STRING(150), allowNull: true, unique: true })
  declare email: string | null;

  @Column({ type: DataType.STRING(30), allowNull: true })
  declare phone: string | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare address: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  declare status: string;
}
EOF_BACKEND_IA
```

**Registrar el modelo** en `sequelize.factory.ts` (import + `ALL_MODELS`):

```ts
import { ClientModel } from '../../../features/business/clients/infrastructure/persistence/models/client.model.js';

export const ALL_MODELS: any[] = [
  ClientModel,
];
```

**Repositorio:**

```bash
cat > src/features/business/clients/infrastructure/persistence/repositories/client.repository.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { Client } from '../../../domain/entities/client.entity.js';
import type { ClientStatus } from '../../../domain/entities/client.entity.js';
import { IClientRepository } from '../../../domain/interfaces/client.repository.js';
import { ClientModel } from '../models/client.model.js';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(ClientModel);
  }

  async create(client: Client): Promise<Client> {
    const created = await this.repo.create({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      status: client.status,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<Client | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const found = await this.repo.findOne({ where: { email } });
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: ClientModel): Client {
    return new Client({
      id: m.id,
      name: m.name,
      email: m.email ?? null,
      phone: m.phone ?? null,
      address: m.address ?? null,
      status: (m.status as ClientStatus) ?? 'active',
    });
  }
}
EOF_BACKEND_IA
```

**Seeder:**

```bash
cat > src/features/business/clients/infrastructure/persistence/seeders/client.seeder.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Client } from '../../../domain/entities/client.entity.js';
import { CLIENT_REPOSITORY } from '../../../domain/interfaces/client.repository.js';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.js';

@Injectable()
export class ClientSeeder {
  private readonly logger = new Logger(ClientSeeder.name);

  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly clientRepository: IClientRepository,
  ) {}

  async seed(): Promise<void> {
    const email = 'demo.cliente@tecnogua.edu.co';
    const existing = await this.clientRepository.findByEmail(email);
    if (existing) {
      this.logger.log('Seeder clients: ya existía el cliente demo (idempotente)');
      return;
    }
    await this.clientRepository.create(
      new Client({
        name: 'Cliente Demo',
        email,
        phone: '3001234567',
        address: 'Riohacha, La Guajira',
        status: 'active',
      }),
    );
    this.logger.log('Seeder clients: cliente demo creado');
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 53.PNG">
</p>

### 5.4 Capa de presentación

> 🟣 `presentation` — controlador HTTP (delega en `application`).

```bash
cat > src/features/business/clients/presentation/http/controllers/clients.controller.ts <<'EOF_BACKEND_IA'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateClientDto } from '../../../application/dto/create-client.dto.js';
import { ClientMapper } from '../../../application/mappers/client.mapper.js';
import { CreateClientUseCase } from '../../../application/use-cases/create-client.use-case.js';
import { GetClientByIdUseCase } from '../../../application/use-cases/get-client-by-id.use-case.js';
import { ListClientsUseCase } from '../../../application/use-cases/list-clients.use-case.js';

@ApiTags('clients')
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly createClient: CreateClientUseCase,
    private readonly listClients: ListClientsUseCase,
    private readonly getClient: GetClientByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear cliente' })
  async create(@Body() dto: CreateClientDto) {
    const client = await this.createClient.execute(dto);
    return ClientMapper.toResponse(client);
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listClients.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const client = await this.getClient.execute(id);
    return ClientMapper.toResponse(client);
  }
}
EOF_BACKEND_IA
```

<p align="center">
  <img src="capturas/Captura 54.PNG">
</p>

### 5.5 Módulo de la feature

```bash
cat > src/features/business/clients/clients.module.ts <<'EOF_BACKEND_IA'
import { Module } from '@nestjs/common';
import { CreateClientUseCase } from './application/use-cases/create-client.use-case.js';
import { GetClientByIdUseCase } from './application/use-cases/get-client-by-id.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';
import { CLIENT_REPOSITORY } from './domain/interfaces/client.repository.js';
import { ClientRepository } from './infrastructure/persistence/repositories/client.repository.js';
import { ClientSeeder } from './infrastructure/persistence/seeders/client.seeder.js';
import { ClientsController } from './presentation/http/controllers/clients.controller.js';

@Module({
  controllers: [ClientsController],
  providers: [
    CreateClientUseCase,
    ListClientsUseCase,
    GetClientByIdUseCase,
    ClientSeeder,
    { provide: CLIENT_REPOSITORY, useClass: ClientRepository },
  ],
  exports: [CLIENT_REPOSITORY, ClientSeeder],
})
export class ClientsModule {}
EOF_BACKEND_IA
```

- `{ provide: CLIENT_REPOSITORY, useClass: ClientRepository }`: **inversión de dependencias** — liga el puerto a su implementación.

> ✅ **Fin de ISS-03**: feature `clients` completa. El patrón se repite en ISS-04, ISS-05 e ISS-06.
 
 <p align="center">
  <img src="capturas/Captura 55.PNG">
</p>

## 6. ISS-04 · Feature product-types

> **Segmento:** segunda feature (mismo patrón que `clients`). La unicidad es por **`name`**.

### 6.1 Capa de dominio

> 🟢 `domain`

```bash
cat > src/features/business/product-types/domain/entities/product-type.entity.ts <<'EOF_BACKEND_IA'
export type ProductTypeStatus = 'active' | 'inactive';

export interface ProductTypeProps {
  id?: number | null;
  name: string;
  description?: string | null;
  status?: ProductTypeStatus;
}

export class ProductType {
  readonly id: number | null;
  readonly name: string;
  readonly description: string | null;
  readonly status: ProductTypeStatus;

  constructor(props: ProductTypeProps) {
    this.id = props.id ?? null;
    this.name = props.name;
    this.description = props.description ?? null;
    this.status = props.status ?? 'active';
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/domain/interfaces/product-type.repository.ts <<'EOF_BACKEND_IA'
import { ProductType } from '../entities/product-type.entity.js';

export const PRODUCT_TYPE_REPOSITORY = 'IProductTypeRepository';

export interface IProductTypeRepository {
  create(productType: ProductType): Promise<ProductType>;
  findAll(page: number, limit: number): Promise<{ items: ProductType[]; total: number }>;
  findById(id: number): Promise<ProductType | null>;
  findByName(name: string): Promise<ProductType | null>;
  count(): Promise<number>;
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/domain/exceptions/product-type-not-found.exception.ts <<'EOF_BACKEND_IA'
import { EntityNotFoundException } from '../../../../../common/exceptions/entity-not-found.exception.js';

export class ProductTypeNotFoundException extends EntityNotFoundException {
  constructor(id: number) {
    super(`Tipo de producto con id ${id} no encontrado`);
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/domain/exceptions/product-type-name-already-exists.exception.ts <<'EOF_BACKEND_IA'
import { BusinessRuleException } from '../../../../../common/exceptions/business-rule.exception.js';

export class ProductTypeNameAlreadyExistsException extends BusinessRuleException {
  constructor(name: string) {
    super(`Ya existe un tipo de producto con el nombre ${name}`);
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 61.PNG">
</p>

### 6.2 Capa de aplicación

> 🔵 `application`

```bash
cat > src/features/business/product-types/application/dto/create-product-type.dto.ts <<'EOF_BACKEND_IA'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProductTypeDto {
  @ApiProperty({ example: 'Bebidas' })
  @IsString()
  @IsNotEmpty({ message: 'name es requerido' })
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Bebidas y refrescos' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/application/mappers/product-type.mapper.ts <<'EOF_BACKEND_IA'
import { ProductType } from '../../domain/entities/product-type.entity.js';
import { CreateProductTypeDto } from '../dto/create-product-type.dto.js';

export class ProductTypeMapper {
  static toEntity(dto: CreateProductTypeDto): ProductType {
    return new ProductType({
      name: dto.name,
      description: dto.description ?? null,
      status: 'active',
    });
  }

  static toResponse(pt: ProductType) {
    return {
      id: pt.id,
      name: pt.name,
      description: pt.description,
      status: pt.status,
    };
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/application/use-cases/create-product-type.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { ProductTypeNameAlreadyExistsException } from '../../domain/exceptions/product-type-name-already-exists.exception.js';
import { PRODUCT_TYPE_REPOSITORY } from '../../domain/interfaces/product-type.repository.js';
import type { IProductTypeRepository } from '../../domain/interfaces/product-type.repository.js';
import type { ProductType } from '../../domain/entities/product-type.entity.js';
import { CreateProductTypeDto } from '../dto/create-product-type.dto.js';
import { ProductTypeMapper } from '../mappers/product-type.mapper.js';

@Injectable()
export class CreateProductTypeUseCase {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY) private readonly repo: IProductTypeRepository,
  ) {}

  async execute(dto: CreateProductTypeDto): Promise<ProductType> {
    const existing = await this.repo.findByName(dto.name);
    if (existing) {
      throw new ProductTypeNameAlreadyExistsException(dto.name);
    }
    return this.repo.create(ProductTypeMapper.toEntity(dto));
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/application/use-cases/get-product-type-by-id.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { ProductTypeNotFoundException } from '../../domain/exceptions/product-type-not-found.exception.js';
import { PRODUCT_TYPE_REPOSITORY } from '../../domain/interfaces/product-type.repository.js';
import type { IProductTypeRepository } from '../../domain/interfaces/product-type.repository.js';
import type { ProductType } from '../../domain/entities/product-type.entity.js';

@Injectable()
export class GetProductTypeByIdUseCase {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY) private readonly repo: IProductTypeRepository,
  ) {}

  async execute(id: number): Promise<ProductType> {
    const pt = await this.repo.findById(id);
    if (!pt) {
      throw new ProductTypeNotFoundException(id);
    }
    return pt;
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/application/use-cases/list-product-types.use-case.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_TYPE_REPOSITORY } from '../../domain/interfaces/product-type.repository.js';
import type { IProductTypeRepository } from '../../domain/interfaces/product-type.repository.js';
import { ProductTypeMapper } from '../mappers/product-type.mapper.js';

@Injectable()
export class ListProductTypesUseCase {
  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY) private readonly repo: IProductTypeRepository,
  ) {}

  async execute(page: number, limit: number) {
    const { items, total } = await this.repo.findAll(page, limit);
    return {
      items: items.map(ProductTypeMapper.toResponse),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 62.PNG">
</p>

### 6.3 Capa de infraestructura

> 🟠 `infrastructure`

```bash
cat > src/features/business/product-types/infrastructure/persistence/models/product-type.model.ts <<'EOF_BACKEND_IA'
import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'product_types', timestamps: true })
export class ProductTypeModel extends Model {
  @Column({ type: DataType.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: false, unique: true })
  declare name: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING(20), allowNull: false, defaultValue: 'active' })
  declare status: string;
}
EOF_BACKEND_IA
```

**Registrar el modelo** en `sequelize.factory.ts`:

```ts
import { ProductTypeModel } from '../../../features/business/product-types/infrastructure/persistence/models/product-type.model.js';

export const ALL_MODELS: any[] = [
  ClientModel,
  ProductTypeModel,
];
```

```bash
cat > src/features/business/product-types/infrastructure/persistence/repositories/product-type.repository.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../../../../infrastructure/database/sequelize/sequelize.module.js';
import { ProductType } from '../../../domain/entities/product-type.entity.js';
import type { ProductTypeStatus } from '../../../domain/entities/product-type.entity.js';
import { IProductTypeRepository } from '../../../domain/interfaces/product-type.repository.js';
import { ProductTypeModel } from '../models/product-type.model.js';

@Injectable()
export class ProductTypeRepository implements IProductTypeRepository {
  constructor(@Inject(SEQUELIZE) private readonly sequelize: Sequelize) {}

  private get repo() {
    return this.sequelize.getRepository(ProductTypeModel);
  }

  async create(pt: ProductType): Promise<ProductType> {
    const created = await this.repo.create({
      name: pt.name,
      description: pt.description,
      status: pt.status,
    });
    return this.toDomain(created);
  }

  async findAll(page: number, limit: number) {
    const { rows, count } = await this.repo.findAndCountAll({
      offset: (page - 1) * limit,
      limit,
      order: [['id', 'ASC']],
    });
    return { items: rows.map((r) => this.toDomain(r)), total: count };
  }

  async findById(id: number): Promise<ProductType | null> {
    const found = await this.repo.findByPk(id);
    return found ? this.toDomain(found) : null;
  }

  async findByName(name: string): Promise<ProductType | null> {
    const found = await this.repo.findOne({ where: { name } });
    return found ? this.toDomain(found) : null;
  }

  async count(): Promise<number> {
    return this.repo.count();
  }

  private toDomain(m: ProductTypeModel): ProductType {
    return new ProductType({
      id: m.id,
      name: m.name,
      description: m.description ?? null,
      status: (m.status as ProductTypeStatus) ?? 'active',
    });
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/infrastructure/persistence/seeders/product-type.seeder.ts <<'EOF_BACKEND_IA'
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ProductType } from '../../../domain/entities/product-type.entity.js';
import { PRODUCT_TYPE_REPOSITORY } from '../../../domain/interfaces/product-type.repository.js';
import type { IProductTypeRepository } from '../../../domain/interfaces/product-type.repository.js';

@Injectable()
export class ProductTypeSeeder {
  private readonly logger = new Logger(ProductTypeSeeder.name);

  constructor(
    @Inject(PRODUCT_TYPE_REPOSITORY) private readonly repo: IProductTypeRepository,
  ) {}

  async seed(): Promise<void> {
    const name = 'Bebidas';
    const existing = await this.repo.findByName(name);
    if (existing) {
      this.logger.log('Seeder product-types: ya existía el tipo demo (idempotente)');
      return;
    }
    await this.repo.create(
      new ProductType({ name, description: 'Bebidas y refrescos', status: 'active' }),
    );
    this.logger.log('Seeder product-types: tipo demo creado');
  }
}
EOF_BACKEND_IA
```
<p align="center">
  <img src="capturas/Captura 63.PNG">
</p>

### 6.4 Capa de presentación + módulo

> 🟣 `presentation`

```bash
cat > src/features/business/product-types/presentation/http/controllers/product-types.controller.ts <<'EOF_BACKEND_IA'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductTypeDto } from '../../../application/dto/create-product-type.dto.js';
import { ProductTypeMapper } from '../../../application/mappers/product-type.mapper.js';
import { CreateProductTypeUseCase } from '../../../application/use-cases/create-product-type.use-case.js';
import { GetProductTypeByIdUseCase } from '../../../application/use-casetype-by-id.use-case.js';
import { ListProductTypesUseCase } from '../../../application/use-cases/list-product-types.use-case.js';

@ApiTags('product-types')
@Controller('product-types')
export class ProductTypesController {
  constructor(
    private readonly createProductType: CreateProductTypeUseCase,
    private readonly listProductTypes: ListProductTypesUseCase,
    private readonly getProductType: GetProductTypeByIdUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Crear tipo de producto' })
  async create(@Body() dto: CreateProductTypeDto) {
    const pt = await this.createProductType.execute(dto);
    return ProductTypeMapper.toResponse(pt);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de producto (paginado)' })
  async list(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.listProductTypes.execute(Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener tipo de producto por id' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const pt = await this.getProductType.execute(id);
    return ProductTypeMapper.toResponse(pt);
  }
}
EOF_BACKEND_IA
```

```bash
cat > src/features/business/product-types/product-types.module.ts <<'EOF_BACKEND_IA'
import { Module } from '@nestjs/common';
import { CreateProductTypeUseCase } from './application/use-cases/create-product-type.use-case.js';
import { GetProductTypeByIdUseCase } from './application/use-cases/get-product-type-by-id.use-case.js';
import { ListProductTypesUseCase } from './application/use-cases/list-product-types.use-case.js';
import { PRODUCT_TYPE_REPOSITORY } from './domain/interfaces/product-type.repository.js';
import { ProductTypeRepository } from './infrastructure/persistence/repositories/product-type.repository.js';
import { ProductTypeSeeder } from './infrastructure/persistence/seeders/product-type.seeder.js';
import { ProductTypesController } from './presentation/http/controllers/product-types.controller.js';

@Module({
  controllers: [ProductTypesController],
  providers: [
    CreateProductTypeUseCase,
    ListProductTypesUseCase,
    GetProductTypeByIdUseCase,
    ProductTypeSeeder,
    { provide: PRODUCT_TYPE_REPOSITORY, useClass: ProductTypeRepository },
  ],
  exports: [PRODUCT_TYPE_REPOSITORY, ProductTypeSeeder],
})
export class ProductTypesModule {}
EOF_BACKEND_IA
```

> ✅ **Fin de ISS-04**: feature `product-types` completa.

<p align="center">
  <img src="capturas/Captura 64.PNG">
</p>




