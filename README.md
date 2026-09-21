# MyInternWay

Landing page estática de MyInternWay, una propuesta para conectar talento europeo con experiencias profesionales en España.

## Ejecutar localmente

No requiere instalación ni dependencias:

1. Haz doble clic en `start.bat`.
2. Abre `http://localhost:4173` si no se abre automáticamente.

También puedes abrir `index.html` directamente para una comprobación rápida. El servidor local permite probar la página con las mismas rutas relativas que usará el hosting.

La página usa Google Fonts desde CDN, por lo que la tipografía puede cambiar si se abre sin conexión.

## Publicación

El código fuente vive en GitHub y Cloudflare Pages se encarga del despliegue. Al hacer push a `main`, Cloudflare puede publicar automáticamente la nueva versión.

Para preparar cambios desde esta carpeta:

```bash
git add .
git commit -m "Describe el cambio"
git push origin main
```

En Cloudflare Pages, usa esta configuración exacta:

- Rama de producción: `main`
- Directorio raíz: vacío (la raíz del repositorio)
- Comando de build: vacío
- Directorio de salida: `.`

No uses `/` como directorio de salida: `/` apunta a la raíz del sistema y puede dejar el despliegue sin archivos publicados. Tras guardar la configuración, revisa que el último despliegue corresponda al commit más reciente y que la URL abra `index.html` desde la raíz.

## Cuentas de usuario y base de datos (Supabase)

El formulario de `#registro` guarda cuentas en [Supabase](https://supabase.com) (Postgres + Auth + Storage), 100% compatible con un sitio estático en Cloudflare Pages porque todo se llama desde el navegador con `supabase-js`.

1. Crea un proyecto gratuito en supabase.com.
2. En **SQL Editor**, pega y ejecuta el contenido de [`db/schema.sql`](db/schema.sql) para crear la tabla `profiles`, los triggers de alta/confirmación y las políticas de seguridad (RLS).
3. En **Authentication > Providers**, deja activado "Confirm email" (por defecto ya lo está) para forzar la confirmación de correo.
4. En **Storage**, crea un bucket llamado `perfiles` para guardar CV y fotos.
5. En **Settings > API**, copia `Project URL` y `anon public key` y pégalos en [`supabase-config.js`](supabase-config.js). La `anon key` es segura para exponer en el navegador; la protección real la dan las políticas RLS. Nunca publiques la `service_role key`.
6. Para ver solo a las personas con correo confirmado (y elegirlas para pasantías), en **Table Editor** o **SQL Editor** filtra: `select * from profiles where confirmado = true;`

Pendiente para una siguiente iteración: una pantalla de inicio de sesión para que, tras confirmar el correo, cada persona pueda subir su CV/foto (ahora mismo esos campos son opcionales en el alta).
