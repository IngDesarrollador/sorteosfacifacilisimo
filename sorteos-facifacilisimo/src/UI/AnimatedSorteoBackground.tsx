
import logoFacilisimo from '../assets/images/Facilisimo-removebg-preview.png';
import iconoMano from '../assets/images/icono-img-removebg-preview.png';

const icons = [
  // Estrella azul
  <svg key="star" className="absolute left-10 top-10 w-10 h-10 text-blue-300 opacity-40 animate-bounce-slow -z-10" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.385 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.385-2.46a1 1 0 00-1.175 0l-3.385 2.46c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z" /></svg>,
  // Trofeo azul
  <svg key="trophy" className="absolute right-12 top-24 w-12 h-12 text-blue-400 opacity-40 animate-float -z-10" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3a1 1 0 00-1-1H8a1 1 0 00-1 1v2H3v2a7 7 0 006 6.92V17H7a1 1 0 000 2h10a1 1 0 000-2h-2v-3.08A7 7 0 0021 7V5h-4V3zm-8 2V4h8v1H9zm10 2a5 5 0 01-4 4.9V17h-2v-8.1A5 5 0 015 7V6h14v1z" /></svg>,
  // Moneda azul
  <svg key="coin" className="absolute left-1/4 bottom-10 w-8 h-8 text-blue-200 opacity-40 animate-spin-slow -z-10" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" /><circle cx="10" cy="10" r="4" fill="currentColor" /></svg>,
  // Dado azul
  <svg key="dice" className="absolute right-1/4 bottom-20 w-10 h-10 text-blue-500 opacity-40 animate-bounce -z-10" fill="currentColor" viewBox="0 0 20 20"><rect width="16" height="16" x="2" y="2" rx="3" /><circle cx="7" cy="7" r="1.5" fill="#fff" /><circle cx="13" cy="7" r="1.5" fill="#fff" /><circle cx="7" cy="13" r="1.5" fill="#fff" /><circle cx="13" cy="13" r="1.5" fill="#fff" /></svg>,
];

const primeIcons = [
  <i key="gift" className="pi pi-gift text-blue-400 text-5xl absolute left-24 bottom-24 opacity-40 animate-float -z-10" />, 
  <i key="star2" className="pi pi-star text-blue-200 text-4xl absolute right-32 top-1/3 opacity-40 animate-bounce -z-10" />, 
  <i key="trophy2" className="pi pi-trophy text-blue-300 text-6xl absolute left-1/3 top-1/4 opacity-30 animate-pulse -z-10" />, 
  <i key="bolt" className="pi pi-bolt text-blue-100 text-4xl absolute right-1/3 bottom-1/4 opacity-40 animate-spin-slow -z-10" />, 
  <i key="users" className="pi pi-users text-blue-300 text-5xl absolute left-10 top-1/2 opacity-30 animate-float -z-10" />, 
  <i key="money" className="pi pi-money-bill text-blue-200 text-4xl absolute right-10 bottom-1/2 opacity-40 animate-bounce-slow -z-10" />,
];

const AnimatedSorteoBackground = () => (
  <div className="fixed inset-0 -z-20 w-full h-full bg-gradient-to-br from-blue-100 via-white to-blue-200">
    {/* Gradiente radial central para profundidad */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-radial from-blue-200/40 via-white/0 to-transparent rounded-full blur-3xl opacity-60"></div>
    </div>
    {/* Blobs desenfocados para modernidad */}
    <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-blue-200 opacity-30 rounded-full blur-2xl"></div>
    <div className="absolute bottom-[-120px] right-[-120px] w-[500px] h-[500px] bg-green-200 opacity-20 rounded-full blur-3xl"></div>
    {/* Logos y mano distribuidos */}
    <img
      src={iconoMano}
      alt="Facilísimo Mano"
      className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 opacity-40 w-[400px] max-w-[60vw] pointer-events-none select-none animate-float -z-10"
      draggable={false}
    />
    <img
      src={logoFacilisimo}
      alt="Facilísimo Logo"
      className="absolute right-10 bottom-10 opacity-40 w-60 pointer-events-none select-none animate-pulse -z-10"
      draggable={false}
    />
    <img
      src={iconoMano}
      alt="Icono Mano"
      className="absolute left-10 bottom-1/3 opacity-30 w-40 pointer-events-none select-none animate-float -z-10"
      draggable={false}
    />
    <img
      src={iconoMano}
      alt="Icono Mano"
      className="absolute right-1/4 top-10 opacity-30 w-32 pointer-events-none select-none animate-bounce-slow -z-10"
      draggable={false}
    />
    <img
      src={logoFacilisimo}
      alt="Facilísimo Logo"
      className="absolute left-10 top-10 opacity-30 w-32 pointer-events-none select-none animate-float -z-10"
      draggable={false}
    />
    <img
      src={iconoMano}
      alt="Icono Mano"
      className="absolute right-10 top-1/2 opacity-30 w-24 pointer-events-none select-none animate-pulse -z-10"
      draggable={false}
    />
    {/* Íconos SVG y PrimeReact */}
    {icons}
    {primeIcons}
  </div>
);

export default AnimatedSorteoBackground;
