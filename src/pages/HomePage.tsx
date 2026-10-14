import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUploader from '../components/FileUploaderProps';
import { Button } from 'primereact/button';
import { FaLink, FaUpload, FaMagic, FaHeadset, FaImage } from 'react-icons/fa';
import { Toast } from 'primereact/toast';
import { setStorageItem, removeStorageItem } from '../utils/storage';

const HomePage = () => {
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [instagramFile, setInstagramFile] = useState<string | null>(null);
  const [facebookFile, setFacebookFile] = useState<string | null>(null);
  const [nombresFile, setNombresFile] = useState<string | null>(null);
  const [instagramFileName, setInstagramFileName] = useState<string | null>(null);
  const [facebookFileName, setFacebookFileName] = useState<string | null>(null);
  const [nombresFileName, setNombresFileName] = useState<string | null>(null);
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const blobUrlRef = useRef<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    removeStorageItem('imagenPublicacion');
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
    } catch (error) {
      setImageUrl(null);
    }
    setLoading(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (imageInputRef.current) imageInputRef.current.value = '';
      return;
    }

    try {
      // 1. Validar extensiones y tipo MIME
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'];
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/bmp'];
      const fileName = file.name.toLowerCase();
      const hasValidExt = validExtensions.some(ext => fileName.endsWith(ext));
      const hasValidMime = file.type ? validMimes.includes(file.type.toLowerCase()) : false;

      if (!hasValidExt && !hasValidMime) {
        toast.current?.show({
          severity: 'error',
          summary: 'Formato no permitido',
          detail: 'El archivo seleccionado no es una imagen válida o no cumple con el formato permitido (.jpg, .jpeg, .png, .webp, .gif, .bmp).',
          life: 4000
        });
        return;
      }

      // 2. Validar tamaño máximo (10 MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        toast.current?.show({
          severity: 'error',
          summary: 'Tamaño excedido',
          detail: 'La imagen seleccionada supera el tamaño máximo permitido de 10 MB.',
          life: 4000
        });
        return;
      }

      // 3. Crear Blob URL y validar legibilidad mediante elemento Image
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
      const blobUrl = URL.createObjectURL(file);
      blobUrlRef.current = blobUrl;

      const tempImg = new Image();
      tempImg.onload = () => {
        setImageUrl(blobUrl);
        toast.current?.show({
          severity: 'success',
          summary: '¡Imagen cargada!',
          detail: 'Imagen subida exitosamente',
          life: 3000
        });

        // Comprimir y almacenar en localStorage en segundo plano para SorteoPage
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
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setImageUrl(compressed);
          }
        } catch {
          /* canvas no disponible */
        }
      };

      tempImg.onerror = () => {
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }
        toast.current?.show({
          severity: 'error',
          summary: 'Error de imagen',
          detail: 'El archivo seleccionado no es una imagen válida o está dañado.',
          life: 4000
        });
      };

      tempImg.src = blobUrl;
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado al procesar la imagen.',
        life: 4000
      });
    } finally {
      // Siempre limpiar el valor del input para permitir volver a seleccionar la misma imagen
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
      event.target.value = '';
    }
  };

  const handleInstagramFile = async (fileContent: string, fileName?: string) => {
    if (fileContent && fileContent.trim().length > 0) {
      setInstagramFile(fileContent);
      setInstagramFileName(fileName || 'archivo_instagram');
      await setStorageItem('comentarios_instagram', fileContent);
    }
  };

  const handleFacebookFile = async (fileContent: string, fileName?: string) => {
    if (fileContent && fileContent.trim().length > 0) {
      setFacebookFile(fileContent);
      setFacebookFileName(fileName || 'archivo_facebook');
      await setStorageItem('comentarios_facebook', fileContent);
    }
  };

  const handleNombresFile = async (fileContent: string, fileName?: string) => {
    if (fileContent && fileContent.trim().length > 0) {
      setNombresFile(fileContent);
      setNombresFileName(fileName || 'archivo_nombres');
      await setStorageItem('lista_nombres', fileContent);
    }
  };

  const handleClearInstagram = () => {
    setInstagramFile(null);
    setInstagramFileName(null);
    removeStorageItem('comentarios_instagram');
    removeStorageItem('comentarios');
  };

  const handleClearFacebook = () => {
    setFacebookFile(null);
    setFacebookFileName(null);
    removeStorageItem('comentarios_facebook');
    removeStorageItem('comentarios');
  };

  const handleClearNombres = () => {
    setNombresFile(null);
    setNombresFileName(null);
    removeStorageItem('lista_nombres');
  };

  const handleGoToSorteo = async (platform: 'instagram' | 'facebook' | 'ambos' | 'nombres') => {
    if (platform === 'instagram') {
      await setStorageItem('comentarios', instagramFile || '');
      await setStorageItem('plataforma', 'instagram');
    } else if (platform === 'facebook') {
      await setStorageItem('comentarios', facebookFile || '');
      await setStorageItem('plataforma', 'facebook');
    } else if (platform === 'ambos') {
      await setStorageItem('comentarios_instagram', instagramFile || '');
      await setStorageItem('comentarios_facebook', facebookFile || '');
      await setStorageItem('plataforma', 'ambos');
    } else if (platform === 'nombres') {
      await setStorageItem('lista_nombres', nombresFile || '');
      await setStorageItem('plataforma', 'nombres');
    }
    navigate('/sorteo', { state: { imageUrl: imageUrl?.startsWith('blob:') ? null : imageUrl } });
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
        <h1 className="font-extrabold text-white mb-3 tracking-tight drop-shadow-lg whitespace-nowrap" style={{ fontSize: '2.5rem' }}>Sorteos Facilísimo</h1>
        <p className="text-blue-100 mb-2 font-medium" style={{ fontSize: '1rem' }}>Sorteos aleatorios de forma fácil, rápida y transparente. La suerte decide.</p>
        <p className="text-blue-200" style={{ fontSize: '1rem' }}>Pega el enlace de tu publicación o carga el listado, previsualiza la imagen y selecciona al ganador de manera completamente aleatoria.</p>
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
                ref={imageInputRef}
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.svg,.bmp"
                onChange={handleImageUpload}
                onClick={(e) => {
                  (e.currentTarget as HTMLInputElement).value = '';
                }}
                className="hidden"
              />
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg px-8 py-3 rounded-xl shadow-lg border-2 border-blue-300 hover:from-blue-600 hover:to-cyan-600 hover:scale-105 hover:shadow-xl transition-all duration-200 min-w-[180px]">
                <FaImage className="text-lg" />
                Cargar imagen
              </div>
            </label>
          </div>
        </div>
        {/* Vista previa: recuadro vacío hasta que se cargue una imagen */}
        <div className="w-full flex justify-center mb-6">
          {imageUrl ? (
            <div
              key="image-preview-loaded"
              className="relative group rounded-2xl overflow-hidden shadow-xl border-4 border-blue-400 bg-blue-50 p-2 flex justify-center animate-fadeIn"
            >
              <img
                src={imageUrl}
                alt="Publicación"
                className="max-w-xs rounded-xl object-contain aspect-[3/4] mx-auto"
                onError={() => {
                  setImageUrl(null);
                  toast.current?.show({
                    severity: 'error',
                    summary: 'Error de imagen',
                    detail: 'El archivo seleccionado no es una imagen válida o está dañado.',
                    life: 4000
                  });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (blobUrlRef.current) {
                    URL.revokeObjectURL(blobUrlRef.current);
                    blobUrlRef.current = null;
                  }
                  setImageUrl(null);
                  removeStorageItem('imagenPublicacion');
                }}
                className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition opacity-90 hover:opacity-100 cursor-pointer"
                title="Quitar imagen"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              key="image-preview-placeholder"
              className="w-64 h-28 flex flex-col items-center justify-center bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 text-base select-none"
            >
              <FaUpload className="text-2xl mb-1" />
              <span>Vista previa de la imagen</span>
            </div>
          )}
        </div>
        {/* FileUploader para Instagram, Facebook y Nombres */}
        <div className="w-full mb-2 flex flex-col md:flex-row gap-4">
          <div className="flex-1 justify-center text-center">
            <FileUploader
              onFileRead={handleInstagramFile}
              onFileCleared={handleClearInstagram}
              currentFileName={instagramFileName}
              disabled={false}
              label="Archivo de comentarios Instagram"
              targetFunction="instagram"
              accept=".txt"
            />
          </div>
          <div className="flex-1 justify-center text-center">
            <FileUploader
              onFileRead={handleFacebookFile}
              onFileCleared={handleClearFacebook}
              currentFileName={facebookFileName}
              disabled={false}
              label="Archivo de comentarios Facebook"
              targetFunction="facebook"
              accept=".txt"
            />
          </div>
          <div className="flex-1 justify-center text-center">
            <FileUploader
              onFileRead={handleNombresFile}
              onFileCleared={handleClearNombres}
              currentFileName={nombresFileName}
              disabled={false}
              label="Archivo de nombres para sorteo"
              targetFunction="nombres"
              accept=".txt,.xlsx,.xls"
            />
          </div>
        </div>
        
        <div className="w-full text-center mt-2 text-gray-400 text-xs">
          <hr className="my-1 border-gray-700" />
          <span>Sube archivos <span className="font-semibold text-green-400">.txt</span> para Instagram o Facebook, o <span className="font-semibold text-green-400">.txt, .xlsx o .xls</span> para Nombres</span>
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
              <p className="text-blue-100 text-base">Carga el archivo .txt o Excel (.xlsx, .xls) con los comentarios o nombres para iniciar el sorteo.</p>
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
