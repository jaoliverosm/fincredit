# Despliegue local con Docker

Para desarrollo con **Vite + API en tu máquina** (puertos 5173 / 3001), consulta primero **[README-DEV.md](README-DEV.md)**.

1. Copia el archivo de ejemplo `.env.example` a `.env` y ajusta variables si es necesario.

```bash
cp .env.example .env
```

2. Levantar servicios con `docker-compose`:

```bash
docker-compose up --build
```

- PostgreSQL estará en `localhost:5432`.
- API del servidor en `http://localhost:3000`.

3. Inicializar Prisma (si usas Prisma):

```bash
# entrar al contenedor server (o ejecutar localmente)
npx prisma migrate deploy
npx prisma db seed
```

4. Notas de producción
- Configure `DATABASE_URL` para apuntar a su instancia de PostgreSQL administrada.
- Use secretos de GitHub para `JWT_SECRET` y credenciales de la base de datos.
- Configure CI para construir y publicar imágenes, o despliegue en la plataforma de su elección.
