# Reportería de Programación

Sistema de reportería desarrollado con React + TypeScript + Vite para visualización y análisis de rendimiento de tareas.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### Construcción con Docker

#### Opción 1: Docker Compose (Recomendado)

```bash
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

Para configurar la URL base del API, crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
VITE_API_BASE_URL=http://localhost:8000
```

Si no especificas esta variable, por defecto se usará `http://localhost:8000`.

### Ejemplos de configuración:

**Desarrollo local:**
```
VITE_API_BASE_URL=http://localhost:8000
```

**Servidor de desarrollo:**
```
VITE_API_BASE_URL=http://192.168.1.100:8000
```

**Producción:**
```
VITE_API_BASE_URL=https://api.tudominio.com
```

**Importante:** 
- Después de modificar el archivo `.env`, debes reiniciar el servidor de desarrollo para que los cambios surtan efecto
- Para Docker, las variables de entorno deben configurarse antes de construir la imagen (`docker build`)

## 🐳 Información sobre Docker

### Estructura de archivos Docker

- **Dockerfile**: Construcción multi-etapa optimizada (Node 20 + Nginx)
- **docker-compose.yml**: Configuración del servicio con redes y health checks
- **nginx.conf**: Configuración de Nginx para SPA con optimizaciones
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

Para usar una URL de API diferente en el contenedor Docker:

1. Edita el archivo `.env` con tu URL:
   ```
   VITE_API_BASE_URL=https://api.tudominio.com
   ```

2. Reconstruye la imagen:
   ```bash
   docker-compose build
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
