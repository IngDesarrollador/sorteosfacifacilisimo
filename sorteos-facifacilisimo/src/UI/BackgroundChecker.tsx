
function BackgroundChecker() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full bg-gray-100 overflow-hidden">
      {/* Patrón de fondo ajedrez */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none grid grid-cols-8 grid-rows-6 gap-0">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="w-full h-full"
            style={{
              backgroundImage: (Math.floor(i / 8) + i) % 2 === 0
                ? "url('/images/icono-img-removebg-preview.png')"
                : 'none',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.2
            }}
          />
        ))}
      </div>

      {/* Overlay y elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30 z-0"></div>
      <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-full opacity-40 z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-tr-full opacity-30 z-0"></div>
      <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent opacity-70 z-0"></div>
      <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent to-transparent opacity-70 z-0"></div>
    </div>
  );
}

export default BackgroundChecker;
