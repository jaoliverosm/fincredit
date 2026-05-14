# 🚀 Guía de Despliegue - FinCredit

## 📋 Requisitos Previos
- Cuenta en [Render](https://render.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)
- Repositorio en GitHub conectado

---

## 🔧 Backend - Despliegue en Render

### 1. Conectar Repositorio a Render
1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Click en "New +" → "Web Service"
3. Conecta tu repositorio GitHub: `jaoliverosm/fincredit`
4. **IMPORTANTE**: Render detectará automáticamente el `render.yaml` si está en la raíz del repositorio

### 2. Si Render NO detecta el render.yaml automáticamente:
**Opción A - Usar el render.yaml existente:**
1. Después de conectar el repositorio, busca la opción "Advanced Settings" o "Configure via render.yaml"
2. Render debería detectar el archivo `render.yaml` en la raíz del repositorio
3. Si no lo detecta, verifica que el archivo esté en: `f:\FinCredit\render.yaml`

**Opción B - Configuración manual:**
1. **Name**: fincredit-backend
2. **Environment**: Docker
3. **Dockerfile Path**: `./server/Dockerfile`
4. **Plan**: Free
5. **Region**: Oregon
6. **Branch**: main
7. **Health Check Path**: `/api/health`

### 3. Configuración Automática (via render.yaml)
El archivo `render.yaml` ya está configurado con:
- **Nombre**: fincredit-backend
- **Plan**: Free
- **Región**: Oregon
- **Docker**: Dockerfile en `./server/Dockerfile`
- **Health Check**: `/api/health`
- **Base de datos**: PostgreSQL gratuita (fincredit-db)

### 4. Variables de Entorno (Automáticas)
Render generará automáticamente:
- `DATABASE_URL` (conectada a fincredit-db)
- `JWT_SECRET` (generado automáticamente)
- `FRONTEND_URL`: `https://fincredit-frontend.vercel.app`
- `NODE_ENV`: `production`
- `PORT`: `3001`

### 5. Deploy
Click en "Create Web Service" → Render desplegará automáticamente

---

## 🎨 Frontend - Despliegue en Vercel

### 1. Conectar Repositorio a Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Add New..." → "Project"
3. Importa tu repositorio GitHub: `jaoliverosm/fincredit`
4. Selecciona el directorio `client/`

### 2. Configuración del Proyecto
Vercel detectará automáticamente:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Variables de Entorno
Agrega las siguientes variables en Vercel:
```
VITE_API_URL=https://fincredit-backend.onrender.com/api
VITE_FRONTEND_URL=https://fincredit-frontend.vercel.app
```

### 4. Deploy
Click en "Deploy" → Vercel desplegará automáticamente

---

## 🔄 GitHub Actions - CI/CD

### 1. Actualizar Secrets en GitHub
Necesitas agregar estos secrets en tu repositorio:
- `RENDER_TOKEN`: Token de autenticación de Render
- `VERCEL_TOKEN`: Token de autenticación de Vercel

### 2. Obtener Tokens

#### Render Token
1. Ve a [dashboard.render.com](https://dashboard.render.com)
2. Click en tu avatar → "Account Settings"
3. Scroll a "API Keys"
4. Click "Create API Key"
5. Copia el token y agrégalo a GitHub Secrets como `RENDER_TOKEN`

#### Vercel Token
1. Ve a [vercel.com](https://vercel.com)
2. Click en tu avatar → "Settings"
3. Scroll a "Tokens"
4. Click "Create Token"
5. Copia el token y agrégalo a GitHub Secrets como `VERCEL_TOKEN`

### 3. Workflow de GitHub Actions
El workflow `.github/workflows/deploy.yml` se ejecutará automáticamente en cada push a `main`.

---

## ✅ Verificación

### Backend
- URL: `https://fincredit-backend.onrender.com`
- Health Check: `https://fincredit-backend.onrender.com/api/health`
- API Docs: `https://fincredit-backend.onrender.com/api`

### Frontend
- URL: `https://fincredit-frontend.vercel.app`
- Login: `https://fincredit-frontend.vercel.app/login`

---

## 🔧 Troubleshooting

### Backend no responde
- Verifica los logs en Render Dashboard
- Asegúrate que la base de datos esté conectada
- Verifica que el puerto 3001 esté expuesto

### Frontend no conecta al backend
- Verifica que `VITE_API_URL` esté configurado correctamente en Vercel
- Verifica CORS en el backend
- Verifica que el backend esté desplegado y funcionando

### Build falla
- Verifica que todas las dependencias estén en package.json
- Verifica que el Dockerfile sea correcto
- Verifica que las variables de entorno estén configuradas

---

## 📞 Soporte
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
