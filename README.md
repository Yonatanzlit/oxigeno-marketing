# Oxígeno Marketing — Sitio web

Landing page de una sola página para **Oxígeno Marketing SRL** (marketing, trade
marketing, acciones BTL y ejecución comercial en Argentina).

Sitio estático: HTML + CSS + JS, sin dependencias ni paso de compilación.

## Ver el sitio
Abrí `index.html` en cualquier navegador (doble clic), o serví la carpeta:

```bash
cd oxigeno-marketing
python3 -m http.server 8000
# luego abrí http://localhost:8000
```

## Estructura
```
oxigeno-marketing/
├── index.html        # Toda la página (nav → 8 secciones → footer)
├── styles.css        # Estilos y diseño responsive
├── script.js         # Menú móvil, scroll-reveal, contadores animados
├── assets/
│   ├── logo.jpg      # Logo (fondo blanco) — nav y footer
│   └── logo-alt.jpg  # Logo (fondo negro)
└── README.md
```

## Pendientes — completar con datos reales (buscá `TODO` en el código)
- **Email de contacto** → `info@oxigenomarketing.com.ar` (placeholder en hero, CTA final y footer).
- **Email de RRHH** → `rrhh@oxigenomarketing.com.ar` (botón "Quiero trabajar en Oxígeno").
- **Teléfono / WhatsApp** → reemplazar `[agregar teléfono]` y el link `wa.me/` del footer.
- **Portal de clientes** → reemplazar el `href="#"` del botón por la URL real del portal.
- **Logos de clientes** → reemplazar los placeholders en `.logo-grid` por imágenes reales
  (sugerido: `assets/clientes/`).

## Personalizar
- Color de marca: variable `--blue` (≈ `#1E73BE`) al inicio de `styles.css`.
- Textos: todos están directamente en `index.html`, en español.

## Publicar (opciones gratuitas)
- **Netlify / Vercel**: arrastrar la carpeta, o conectar un repo Git.
- **GitHub Pages**: subir la carpeta a un repo y activar Pages.
