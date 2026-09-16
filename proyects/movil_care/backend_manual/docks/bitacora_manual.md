
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
