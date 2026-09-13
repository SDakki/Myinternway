# MyInternWay

Landing page estática de MyInternWay, una propuesta para conectar talento europeo con experiencias profesionales en España.

## Ejecutar localmente

No requiere instalación ni dependencias:

1. Abre `index.html` directamente en el navegador para una comprobación rápida.
2. La navegación, el menú móvil y el carrusel de experiencias funcionan en el navegador.

La página usa Google Fonts desde CDN, por lo que la tipografía puede cambiar si se abre sin conexión.

## Publicación

El código fuente vive en GitHub y Cloudflare Pages se encarga del despliegue. Al hacer push a `main`, Cloudflare puede publicar automáticamente la nueva versión.

Para preparar cambios desde esta carpeta:

```bash
git add .
git commit -m "Describe el cambio"
git push origin main
```

En Cloudflare Pages, la configuración esperada para este proyecto es: rama de producción `main`, directorio raíz del proyecto, sin comando de build y directorio de salida `/`.
