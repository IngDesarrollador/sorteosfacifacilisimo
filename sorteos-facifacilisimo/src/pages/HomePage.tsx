import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploaderProps';
import { Button } from 'primereact/button';
import { FaLink, FaUpload, FaMagic, FaHeadset, FaImage } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import * as XLSX from 'xlsx';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instagramFile, setInstagramFile] = useState<string | null>(null);
  const [facebookFile, setFacebookFile] = useState<string | null>(null);
  const [nombresFile, setNombresFile] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const fetchImage = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      const img = data.data.image?.url || null;
      setImageUrl(img);
      if (img) {
        localStorage.setItem('imagenPublicacion', img);
      }
    } catch (error) {
      setImageUrl(null);
    }
    setLoading(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Revocar blob URL anterior si existe
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);

    const blobUrl = URL.createObjectURL(file);
    blobUrlRef.current = blobUrl;

    // Mostrar preview inmediatamente con el blob URL — sin procesar nada, sin memoria extra
    setImageUrl(blobUrl);
    toast.current?.show({ severity: 'success', summary: '¡Imagen cargada!', detail: 'Imagen subida exitosamente', life: 3000 });

    // Comprimir y guardar en localStorage en segundo plano (lo necesita SorteoPage)
    const tempImg = new Image();
    tempImg.onload = () => {
      try {
        const MAX = 600;
        let { width, height } = tempImg;
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(tempImg, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.7);
        try {
          localStorage.setItem('imagenPublicacion', compressed);
        } catch { /* quota exceeded */ }
      } catch { /* canvas no disponible */ }
    };
    tempImg.src = blobUrl;
  };

  const handleInstagramFile = (fileContent: string | File) => {
  if (typeof fileContent !== 'string') return; // Ignora si no es string
  if (fileContent && fileContent.trim().length > 0) {
    setInstagramFile(fileContent);
    localStorage.setItem('comentarios_instagram', fileContent);
    toast.current?.show({ severity: 'success', summary: '¡Éxito!', detail: 'Comentarios de Instagram cargados exitosamente', life: 3000 });
  } else {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el archivo de Instagram', life: 3000 });
  }
};

const handleFacebookFile = (fileContent: string | File) => {
  if (typeof fileContent !== 'string') return; // Ignora si no es string
  if (fileContent && fileContent.trim().length > 0) {
    setFacebookFile(fileContent);
    localStorage.setItem('comentarios_facebook', fileContent);
    toast.current?.show({ severity: 'success', summary: '¡Éxito!', detail: 'Comentarios de Facebook cargados exitosamente', life: 3000 });
  } else {
    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el archivo de Facebook', life: 3000 });
  }
};

  const handleNombresFile = async (file: File | string) => {
  if (typeof file === 'string') {
    // Modo antiguo: .txt
    if (file && file.trim().length > 0) {
      setNombresFile(file);
      localStorage.setItem('lista_nombres', file);
      toast.current?.show({ severity: 'success', summary: '¡Éxito!', detail: 'Lista de nombres cargada exitosamente', life: 3000 });
    } else {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el archivo de nombres', life: 3000 });
    }
  } else if (file instanceof File) {
    // Nuevo: Excel
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      // Extrae la primera columna, omitiendo celdas vacías
      const nombres = json.map((row: any) => row[0]).filter(Boolean).join('\n');
      if (nombres.length > 0) {
        setNombresFile(nombres);
        localStorage.setItem('lista_nombres', nombres);
        toast.current?.show({ severity: 'success', summary: '¡Éxito!', detail: 'Lista de nombres de Excel cargada exitosamente', life: 3000 });
      } else {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'El archivo Excel no contiene nombres válidos', life: 3000 });
      }
    };
    reader.readAsArrayBuffer(file);
  }
};

  const handleGoToSorteo = (platform: 'instagram' | 'facebook' | 'ambos' | 'nombres') => {
    if (platform === 'instagram') {
      localStorage.setItem('comentarios', instagramFile || '');
      localStorage.setItem('plataforma', 'instagram');
    } else if (platform === 'facebook') {
      localStorage.setItem('comentarios', facebookFile || '');
      localStorage.setItem('plataforma', 'facebook');
    } else if (platform === 'ambos') {
      // Guardar ambos archivos y plataforma especial
      localStorage.setItem('comentarios_instagram', instagramFile || '');
      localStorage.setItem('comentarios_facebook', facebookFile || '');
      localStorage.setItem('plataforma', 'ambos');
    } else if (platform === 'nombres') {
      localStorage.setItem('lista_nombres', nombresFile || '');
      localStorage.setItem('plataforma', 'nombres');
    }
    navigate('/sorteo');
  };

  const onlyInstagram = !!instagramFile && !facebookFile && !nombresFile;
  const onlyFacebook = !!facebookFile && !instagramFile && !nombresFile;
  const onlyNombres = !!nombresFile && !instagramFile && !facebookFile;
  const bothFiles = !!instagramFile && !!facebookFile && !nombresFile;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-blue-900 via-gray-900 to-yellow-100 py-10 px-2 overflow-x-hidden">
      <Toast ref={toast} position="top-right" />
      {/* Hero visual */}
      <div className="w-full max-w-4xl mx-auto text-center mb-12 animate-fadeIn relative z-10">
        <img
          src="/images/LOGO-FACILÍSIMO-.png"
          alt="Facilísimo Logo"
          className="hidden md:block mx-auto max-h-36 drop-shadow-2xl mb-4 select-none"
          draggable={false}
        />
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-lg whitespace-nowrap">Sorteos Facilísimo</h1>
        <p className="text-xl text-blue-100 mb-2 font-medium">Sorteos aleatorios de forma fácil, rápida y transparente. La suerte decide.</p>
        <p className="text-base text-blue-200">Pega el enlace de tu publicación o carga el listado, previsualiza la imagen y selecciona al ganador de manera completamente aleatoria.</p>
      </div>

      {/* Card central */}
      <div className="max-w-3xl w-full bg-gray-900/90 rounded-3xl border-4 border-yellow-400 shadow-2xl p-10 flex flex-col items-center mb-10 animate-fadeIn relative z-10">
        {/* Input + botones */}
        <div className="w-full flex flex-col gap-4 items-center justify-center mb-6">
          {/* Input de URL */}
          <div className="w-full">
            <div className="relative">
              <FaLink className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-lg" />
              <input
                type="text"
                placeholder="Pega el link de la publicación de Instagram"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/80 border-2 border-gray-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 text-white placeholder:text-blue-200 shadow-md transition-all duration-200 outline-none text-lg"
              />
            </div>
          </div>
          
          {/* Botones lado a lado */}
          <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-center">
            <Button
              label={loading ? 'Cargando...' : 'Previsualizar'}
              icon={<FaMagic className="text-blue-900 text-lg" />}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-yellow-300 hover:from-yellow-500 hover:to-yellow-400 hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-300"
              onClick={fetchImage}
              disabled={!url || loading}
              type="button"
              style={{ minWidth: 180 }}
            />
            
            <span className="text-gray-400 text-sm font-medium hidden md:block">O</span>
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-blue-300 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 hover:shadow-xl transition-all duration-200 min-w-[180px]">
                <FaImage className="text-lg" />
                Cargar imagen
              </div>
            </label>
          </div>
        </div>
        {/* Imagen previsualizada */}
        <div className="w-full flex justify-center mb-6 min-h-[120px]">
          {imageUrl ? (
            <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-blue-400 bg-blue-50 p-2 flex justify-center animate-fadeIn">
              <img
                src={imageUrl}
                alt="Publicación"
                className="max-w-xs rounded-xl object-contain aspect-[3/4] mx-auto"
              />
            </div>
          ) : (
            <div className="w-64 h-28 flex flex-col items-center justify-center bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-base">
              <FaUpload className="text-2xl mb-1" />
              Vista previa de la imagen
            </div>
          )}
        </div>
        {/* FileUploader para Instagram, Facebook y Nombres */}
        <div className="w-full mb-2 flex flex-col md:flex-row gap-4">
          <div className="flex-1 justify-center text-center">
            <FileUploader onFileRead={handleInstagramFile} disabled={false} label="Archivo de comentarios Instagram" />
          </div>
          <div className="flex-1 justify-center text-center">
            <FileUploader onFileRead={handleFacebookFile} disabled={false} label="Archivo de comentarios Facebook" />
          </div>
          <div className="flex-1 justify-center text-center">
            <FileUploader onFileRead={handleNombresFile} disabled={false} label="Archivo de nombres para sorteo" accept=".txt,.xlsx,xls" />
          </div>
        </div>
        
        <div className="w-full text-center mt-2 text-gray-400 text-xs">
          <hr className="my-1" />
          <span>Sube archivos <span className="font-semibold text-green-600">.txt</span> con comentarios o nombres para comenzar</span>
        </div>
        
        {/* Botones para elegir plataforma o nombres */}
        <div className="w-full flex flex-col md:flex-row gap-4 justify-center mt-6">
          <Button
            label="Instagram"
            className="bg-gradient-to-r from-pink-400 to-yellow-400 text-blue-900 font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-pink-300 hover:from-pink-500 hover:to-yellow-500 hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => handleGoToSorteo('instagram')}
            disabled={!onlyInstagram}
          />
          <Button
            label="Facebook"
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-blue-300 hover:from-blue-500 hover:to-blue-700 hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => handleGoToSorteo('facebook')}
            disabled={!onlyFacebook}
          />
          <Button
            label="Nombres"
            className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-purple-300 hover:from-purple-500 hover:to-purple-700 hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => handleGoToSorteo('nombres')}
            disabled={!onlyNombres}
          />
          <Button
            label="Continuar"
            className="bg-gradient-to-r from-green-400 to-green-600 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-green-300 hover:from-green-500 hover:to-green-700 hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => handleGoToSorteo('ambos')}
            disabled={!bothFiles}
          />
        </div>
      </div>

      {/* Sección de pasos visuales */}
      <div className="w-full max-w-3xl mx-auto mb-10 animate-fadeIn relative z-10">
        <div className="bg-gray-800/70 rounded-3xl p-8 border-2 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">🪄 ¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <FaLink className="text-3xl text-blue-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Pega el enlace</h3>
              <p className="text-blue-100 text-base">Copia y pega el link de tu publicación de Instagram.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FaMagic className="text-3xl text-yellow-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Previsualiza la imagen</h3>
              <p className="text-blue-100 text-base">Verifica que la imagen de la publicación sea la correcta.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <FaUpload className="text-3xl text-green-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Sube los comentarios</h3>
              <p className="text-blue-100 text-base">Carga el archivo .txt con los comentarios para iniciar el sorteo.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque de confianza/soporte */}
      <div className="w-full max-w-2xl mx-auto mb-8 animate-fadeIn relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 bg-gradient-to-r from-blue-900/80 to-blue-400/30 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
          <FaHeadset className="text-3xl text-yellow-300 mb-2 md:mb-0" />
          <div className="text-center md:text-left">
            <div className="font-bold text-white text-lg mb-1 flex items-center gap-2 justify-center md:justify-start">
              ¿Necesitas ayuda o soporte?
            </div>
            <div className="text-blue-100 text-sm">Nuestro equipo está listo para ayudarte. <span className="text-yellow-200 font-semibold">Soporte garantizado y clientes satisfechos.</span></div>
          </div>
        </div>
      </div>

      {/* Footer de confianza */}
      <footer className="mt-8 text-gray-300 text-sm text-center w-full animate-fadeIn relative z-10">
        <hr className="my-2 max-w-2xl mx-auto border-blue-900/30" />
        <div className="flex flex-col md:flex-row items-center justify-between max-w-4xl mx-auto px-4">
          {/* Imagen izquierda */}
          <div className="mb-4 md:mb-0">
            <img
              src="/images/COLJUEGOS-Y-SUPERSALUD.png"
              alt="Lotería del Quindío"
              className="h-16 md:h-20 object-contain"
            />
          </div>
          
          {/* Texto central */}
          <div className="text-center">
            <p>
              <span className="font-bold text-yellow-400">Transparencia y confianza:</span> Tus sorteos son 100% justos y seguros.<br />
              &copy; {new Date().getFullYear()} Sorteos FaciFacilísimo. Hecho con <span className="text-red-500">♥</span> para tus sorteos.
            </p>
          </div>
          
          {/* Imagen derecha */}
          <div className="mt-4 md:mt-0">
            <img
              src="/images/LOGO-LOTERÍA-DEL-QUINDÍO.png"
              alt="Coljuegos y Supersalud"
              className="h-16 md:h-20 object-contain"
            />
          </div>
        </div>
      </footer>
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.7s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default HomePage;


