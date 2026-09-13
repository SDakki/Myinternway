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
