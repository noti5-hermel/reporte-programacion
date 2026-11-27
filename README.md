+++++++++++++++++++++++++++++++++++++++++++++++++# Reportería de Programación

Sistema de reportería desarrollado con React + TypeScript + Vite para visualización y análisis de rendimiento de tareas.

## 🚀 Inicio Rápido

### Desarrollo Local

Requiere Node 22.15.1 (ver `.nvmrc`). La única fuente de dependencias es
`package-lock.json`, así que instala siempre con `npm ci`:

```bash
nvm use
npm ci
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción con Docker

#### Opción 1: Docker Compose (Recomendado)

```bash
# La primera vez, crear la red compartida con la API de reportes
docker network create reporteria-network

# Construir y levantar el contenedor
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener el contenedor
docker-compose down
```

La aplicación estará disponible en `http://localhost:85`

#### Opción 2: Docker CLI

```bash
# Construir la imagen
docker build -t reporteria-frontend .

# Ejecutar el contenedor
docker run -d -p 85:80 --name reporteria-frontend reporteria-frontend
```

## 📋 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run lint` - Ejecuta el linter
- `npm run preview` - Previsualiza la construcción de producción

## ⚙️ Configuración del API

Copia `.env.example` a `.env`. Todas las variables son opcionales: si se dejan
vacías, la app usa rutas relativas y nginx (en Docker) hace de proxy inverso:

| Variable | Uso | Valor por defecto |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base de la API de autenticación | `""` (mismo origen) |
| `VITE_REPORTS_API_URL` | API de reportes | `VITE_API_BASE_URL` |
| `VITE_AUTH_API_URL` | Servicio de autenticación | `/auth-api` |
| `VITE_AUTH_HEALTH_URL` | Health check del servicio externo | `/auth-api/api/auth/health` |
| `VITE_AUTH_FRONTEND_URL` | Redirección al login externo | origen actual |

En desarrollo sin proxy, configura URLs absolutas (ver los ejemplos en
`.env.example`). Después de modificar `.env`, reinicia el servidor de desarrollo.

**Importante:** las variables `VITE_*` se incrustan en el bundle durante
`npm run build`. Para Docker se pasan como build args; el `.env` local **no** se
copia a la imagen (está excluido en `.dockerignore`).

## 🐳 Información sobre Docker

### Estructura de archivos Docker

- **Dockerfile**: Construcción multi-etapa optimizada (Node 22.15.1 + Nginx)
- **docker-compose.yml**: Configuración del servicio con redes y health checks
- **nginx.conf**: Plantilla de Nginx (SPA + proxy `/api/` y `/auth-api/`)
- **.dockerignore**: Excluye archivos innecesarios del contexto Docker

### Características

- ✅ Multi-stage build para imagen optimizada
- ✅ Nginx para servir archivos estáticos
- ✅ Soporte para React Router (SPA)
- ✅ Compresión Gzip habilitada
- ✅ Caché de assets estáticos
- ✅ Health checks configurados
- ✅ Headers de seguridad

### Variables de entorno en Docker

- Las `VITE_*` se leen en tiempo de **build** como build args de
  `docker-compose.yml` (se toman del entorno o del `.env` del host).
- Los upstreams de nginx se leen en tiempo de **ejecución**:
  `REPORTS_API_UPSTREAM` (por defecto `http://reports-api:8107`) y
  `AUTH_API_UPSTREAM` (por defecto `http://auth-api:8081`). Deben indicarse como
  `scheme://host:puerto`, sin ruta; el prefijo `/api/` o `/auth-api/` se añade
  automáticamente.
- nginx resuelve esos nombres con el DNS embebido de Docker **en cada petición**,
  no al arrancar. Si `auth-api` no está en `reporteria-network`, la SPA sigue
  levantando y `/auth-api/*` responde 502 hasta que el servicio exista (en vez
  de `host not found in upstream` + crash loop). Para que el login funcione,
  el contenedor de auth debe estar en la misma red o hay que pasar su IP con
  `AUTH_API_UPSTREAM`.

```bash
# Ejemplo: apuntar a una API externa sin reconstruir la imagen
REPORTS_API_UPSTREAM=http://192.168.1.155:8107 docker-compose up -d

# Cambiar las VITE_* sí requiere reconstruir
VITE_AUTH_FRONTEND_URL=https://auth.tudominio.com docker-compose build
docker-compose up -d
```

## 🔧 Información Técnica

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
