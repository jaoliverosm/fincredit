# Guía de despliegue (producción)

Este archivo explica cómo preparar el repositorio para desplegar en producción y publicar imágenes de Docker en GHCR o Docker Hub.

1) Requisitos
- Cuenta en GitHub (para GHCR) o Docker Hub.
- Secrets configurados en GitHub Actions: `GHCR_TOKEN` (recomendado) o `DOCKERHUB_USERNAME` + `DOCKERHUB_PASSWORD`.
- PostgreSQL como motor de base de datos (Prisma `provider = "postgresql"`). Para desarrollo local con Vite y puertos, ver [README-DEV.md](README-DEV.md) y [CONTRIBUTING.md](CONTRIBUTING.md).

2) Variables de entorno necesarias (ejemplo `.env.prod`):

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secure-password
POSTGRES_DB=fincredit
DATABASE_URL=postgres://postgres:secure-password@db-host:5432/fincredit
JWT_SECRET=valor-secreto-produccion
PORT=3000
NODE_ENV=production
GITHUB_REPOSITORY_OWNER=tu-usuario-o-org
```

3) Publicar imágenes desde GitHub Actions
- El workflow `.github/workflows/publish-and-deploy.yml` construye y publica las imágenes al GHCR.
- Para usar GHCR con el `GHCR_TOKEN`:
  - Crear un Personal Access Token con scope `write:packages` y guardarlo en `GHCR_TOKEN` en los secrets del repo.
- Alternativa: ajustar el workflow para usar Docker Hub con `docker/login-action` y `DOCKERHUB_USERNAME`/`DOCKERHUB_PASSWORD`.

### Publicar en Docker Hub (opcional)

Si prefieres Docker Hub en lugar de GHCR, configura los siguientes secrets en GitHub:

- `DOCKERHUB_USERNAME` — tu usuario de Docker Hub
- `DOCKERHUB_PASSWORD` — token o contraseña (recomendado usar un Access Token)

El workflow ya detecta estos secrets y publicará las imágenes en `docker.io/<DOCKERHUB_USERNAME>/fincredit-server` y `docker.io/<DOCKERHUB_USERNAME>/fincredit-client`.

### SBOM
El pipeline también genera SBOM (formato JSON) usando `syft` y guarda `server-sbom.json` y `client-sbom.json` como artefactos del run (si habilitas el paso de subida de artefactos).

4) Despliegue
- Opción A (fácil): usar `docker-compose.prod.yml` en un servidor con Docker instalado.
  - Copiar `.env.prod` al servidor.
  - Ejecutar:

```bash
docker compose -f docker-compose.prod.yml up -d
```

- Opción B (recomendado): usar plataforma gestionada (Railway, Render, Fly, etc.) y apuntar al contenedor publicado en GHCR o al repositorio con Dockerfile.

5) Seguridad y buenas prácticas
- Nunca subir `.env` con credenciales.
- Use secret manager de la plataforma (Railway, Render, AWS Secrets Manager).
- Configure backups de la base de datos y monitoreo.
- Use HTTPS (reverse proxy o plataforma gestionada).

6) Paso final — Post-despliegue
- Asegúrese de ejecutar migraciones si no se aplicaron automáticamente:

```bash
# desde dentro del contenedor server o localmente con prisma
npx prisma migrate deploy
npx prisma db seed
```

Si quieres, puedo:
- A) Ajustar el workflow para publicar en Docker Hub en lugar de GHCR.
- B) Añadir un job en el workflow que despliegue automáticamente a Railway/Render (necesita credenciales).
- C) Configurar una Playbook paso-a-paso para desplegar en DigitalOcean/Railway.

Dime cuál prefieres y lo implemento.