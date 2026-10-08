# Sorteos FaciFacilísimo

¡Bienvenido a **Sorteos FaciFacilísimo**! Esta aplicación web te permite realizar sorteos de Instagram y Facebook de manera fácil, rápida y transparente.

## 🚀 Características principales
- Previsualiza la imagen de tu publicación de Instagram.
- Sube archivos de comentarios de Instagram y/o Facebook (.txt).
- Realiza sorteos justos y transparentes.
- Descarga el resultado en PDF con marca de agua personalizada.
- Interfaz moderna, responsiva y amigable.
- Notificaciones visuales de éxito y error.

## 📁 Estructura del proyecto

```
/src
  ├── assets/           # Imágenes y recursos estáticos
  ├── components/       # Componentes reutilizables (tablas, filtros, dialogs, etc.)
  ├── hooks/            # Custom hooks de React
  ├── pages/            # Páginas principales (HomePage, SorteoPage, GanadoresPage, etc.)
  ├── routes/           # Definición de rutas de la app
  ├── UI/               # Componentes de UI y estilos
  ├── utils/            # Utilidades y helpers (parseo de comentarios, etc.)
  ├── App.tsx           # Componente raíz de la aplicación
  ├── main.tsx          # Punto de entrada de la app
  └── index.css         # Estilos globales
```

## 🛠️ Tecnologías utilizadas
- **React** + **TypeScript**
- **Vite** (entorno de desarrollo rápido)
- **PrimeReact** (componentes UI y notificaciones)
- **jsPDF** y **jspdf-autotable** (exportación a PDF)
- **react-icons** (iconografía)

## ⚙️ Instalación y ejecución local

1. **Clona el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd sorteos-facifacilisimo
   ```
2. **Instala las dependencias:**
   ```bash
   npm install
   ```
3. **Ejecuta la aplicación en modo desarrollo:**
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

## 📄 Uso básico
1. Ingresa el enlace de tu publicación de Instagram y previsualiza la imagen.
2. Sube los archivos de comentarios (.txt) de Instagram y/o Facebook.
3. Elige la plataforma y realiza el sorteo.
4. Descarga el PDF con los ganadores y la marca de agua personalizada.

## 📦 Dependencias principales
- `react`, `react-dom`, `typescript`, `vite`
- `primereact`, `primeicons`
- `jspdf`, `jspdf-autotable`
- `react-icons`

## 📚 Notas adicionales
- Los archivos de comentarios deben estar en formato `.txt` (uno por línea).
- El sistema utiliza localStorage para guardar temporalmente los datos del sorteo.
- El PDF generado incluye una marca de agua y el logo en el footer.

## 🖼️ Créditos y recursos
- Logo y marca de agua: `/src/assets/`
- Imágenes y recursos adicionales: `/src/assets/`

## ❓ FAQ

**¿Qué formato deben tener los archivos de comentarios?**
> Deben ser archivos `.txt` con un comentario por línea. Puedes exportarlos desde tus publicaciones de Instagram o Facebook usando herramientas externas.

**¿Puedo usar la app en mi celular?**
> Sí, la interfaz es responsiva y funciona en dispositivos móviles.

**¿Cómo reporto un bug o solicito una mejora?**
> Abre un issue en este repositorio o contacta al equipo de soporte.

## 🆘 Soporte

¿Tienes dudas, problemas o sugerencias?
- Abre un [issue](https://github.com/Fiutwer09) en este repositorio.
- O contacta al equipo de soporte a través del correo: **camilocardona2617@gmail.com**

---

¡Gracias por usar **Sorteos FaciFacilísimo**! Si tienes dudas o sugerencias, no dudes en abrir un issue o contactar al equipo de soporte.
