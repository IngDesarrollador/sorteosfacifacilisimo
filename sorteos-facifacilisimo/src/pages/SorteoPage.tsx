import { useEffect, useRef, useState, useMemo } from 'react';
import CommentsTable from '../components/CommentsTable';
import Filters from '../components/Filters';
import FiltersFacebook from '../components/FiltersFacebook';
import Countdown from '../components/Countdown';
import ConfirmModal from '../components/ConfirmModal';
import { parseComments, parseCommentsFacebook, type CommentBlock } from '../utils/commentParser';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaTrashAlt } from 'react-icons/fa';

const SIMILARITY_THRESHOLD = 0.85;

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length];
}

function normalizeForSimilarity(s: string): string {
  return s
    .toLowerCase()
    .replace(/@/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .trim();
}

function isSimilarComment(a: string, b: string): boolean {
  const na = normalizeForSimilarity(a);
  const nb = normalizeForSimilarity(b);
  if (na === nb) return true;
  const maxLen = Math.max(na.length, nb.length);
  if (maxLen === 0) return true;
  return (1 - levenshtein(na, nb) / maxLen) >= SIMILARITY_THRESHOLD;
}

function getPermutations(str: string): string[] {
  if (str.length <= 1) return [str];
  const perms: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const rest = str.slice(0, i) + str.slice(i + 1);
    for (const perm of getPermutations(rest)) {
      perms.push(char + perm);
    }
  }
  return Array.from(new Set(perms));
}

// Función para formatear números con separadores de miles
const formatNumber = (num: number): string => {
  return num.toLocaleString('es-ES');
};

const SorteoPage = () => {
  const [comments, setComments] = useState<CommentBlock[]>([]);
  const [winners, setWinners] = useState<CommentBlock[]>([]);
  const [showCountdown, setShowCountdown] = useState(false);
  const [sorteoTitulo, setSorteoTitulo] = useState('');
  const toast = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'instagram' | 'facebook' | 'ambos' | 'nombres'>('instagram');
  const [activeFilter, setActiveFilter] = useState<'instagram' | 'facebook' | 'ambos' | 'nombres'>('ambos');
  const [uniqueMode, setUniqueMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'participantes' | 'excluidos'>('participantes');
  const [mainParticipants, setMainParticipants] = useState<CommentBlock[]>([]);
  const [excludedParticipants, setExcludedParticipants] = useState<CommentBlock[]>([]);
  const [selectedMain, setSelectedMain] = useState<Set<string>>(new Set());
  const [selectedExcluded, setSelectedExcluded] = useState<Set<number>>(new Set());
  const selectedMainRef = useRef<Set<string>>(new Set());
  const selectedExcludedRef = useRef<Set<number>>(new Set());
  selectedMainRef.current = selectedMain;
  selectedExcludedRef.current = selectedExcluded;
  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    confirmLabel: '',
    confirmClass: '',
    onConfirm: () => {},
  });
  const [commentsInstagram, setCommentsInstagram] = useState<CommentBlock[]>([]);
  const [commentsFacebook, setCommentsFacebook] = useState<CommentBlock[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const img = localStorage.getItem('imagenPublicacion');
    const plat = localStorage.getItem('plataforma') as 'instagram' | 'facebook' | 'ambos' | 'nombres';
    if (img && img.trim() !== "") {
      setImageUrl(img);
    } else {
      setImageUrl(null);
    }
  
    setPlatform(plat || 'instagram');
    if (plat === 'ambos') {
      const contentIG = localStorage.getItem('comentarios_instagram') || '';
      const contentFB = localStorage.getItem('comentarios_facebook') || '';
      const parsedIG = parseComments(contentIG).map(c => ({ ...c, platform: 'instagram' }));
      const parsedFB = parseCommentsFacebook(contentFB).map(c => ({ ...c, platform: 'facebook' }));
      setCommentsInstagram(parsedIG);
      setCommentsFacebook(parsedFB);
      setComments([...parsedIG, ...parsedFB]);
      setActiveFilter('ambos');
    } else if (plat === 'nombres') {
      const nombresContent = localStorage.getItem('lista_nombres') || '';
      if (nombresContent) {
        // Procesar cada línea y separar por comas también
        const nombresList = nombresContent
          .split('\n')
          .flatMap(line => line.split(','))
          .map(name => name.trim())
          .filter(name => name.length > 0);
        
        // Crear objetos CommentBlock para cada nombre individual
        const nombresComments: CommentBlock[] = nombresList.map((nombre) => ({
          username: nombre,
          comment: `Nombre en lista: ${nombre}`,
          date: new Date().toLocaleDateString('es-ES'),
          rawBlock: `${nombre}\n${new Date().toLocaleDateString('es-ES')}\nNombre en lista: ${nombre}`
        }));
        
        setComments(nombresComments);
      }
    } else {
      const content = localStorage.getItem('comentarios');
      if (plat === 'facebook') {
        const parsed = parseCommentsFacebook(content || '').map(c => ({ ...c, platform: 'facebook' }));
        setComments(parsed);
      } else {
        const parsed = parseComments(content || '').map(c => ({ ...c, platform: 'instagram' }));
        setComments(parsed);
      }
      setActiveFilter(plat || 'instagram');
    }
  }, []);

  // Permite filtrar por solo IG, solo FB o ambos (opcional, puedes quitar el selector si no lo quieres)
  useEffect(() => {
    if (platform === 'ambos') {
      if (activeFilter === 'instagram') {
        setComments(commentsInstagram);
      } else if (activeFilter === 'facebook') {
        setComments(commentsFacebook);
      } else {
        setComments([...commentsInstagram, ...commentsFacebook]);
      }
    }
  }, [activeFilter, platform, commentsInstagram, commentsFacebook]);

  useEffect(() => {
    if (uniqueMode) {
      if (comments.length === 0) {
        toast.current?.show({ severity: 'warn', summary: 'Sin comentarios', detail: 'No hay comentarios cargados para agrupar.', life: 3000 });
        setUniqueMode(false);
        return;
      }

      // Agrupar por username (normalizado) y dentro de cada grupo
      // excluir comentarios muy similares usando distancia de Levenshtein
      const byUsername = new Map<string, CommentBlock[]>();
      for (const c of comments) {
        const uKey = c.username.trim().toLowerCase();
        if (!byUsername.has(uKey)) byUsername.set(uKey, []);
        byUsername.get(uKey)!.push(c);
      }

      const mainArr: CommentBlock[] = [];
      const removedArr: CommentBlock[] = [];

      for (const group of byUsername.values()) {
        const kept: CommentBlock[] = [];
        for (const c of group) {
          const isDup = kept.some(k => isSimilarComment(k.comment, c.comment));
          if (isDup) {
            removedArr.push(c);
          } else {
            kept.push(c);
          }
        }
        mainArr.push(...kept);
      }

      setMainParticipants(mainArr);
      setExcludedParticipants(removedArr);

      if (removedArr.length > 0) {
        toast.current?.show({ severity: 'info', summary: 'Modo único activado', detail: `Se encontraron ${removedArr.length} comentario(s) duplicado(s) y fueron excluidos.`, life: 3500 });
      } else {
        toast.current?.show({ severity: 'success', summary: 'Modo único activado', detail: 'No se encontraron comentarios duplicados.', life: 3000 });
      }
    } else {
      setMainParticipants([]);
      setExcludedParticipants([]);
      setActiveTab('participantes');
    }
    setSelectedMain(new Set());
    setSelectedExcluded(new Set());
  }, [uniqueMode, comments]);

  const pool = useMemo(() => {
    if (!uniqueMode) return comments;
    return mainParticipants;
  }, [comments, mainParticipants, uniqueMode]);

  const handleSearch = (query: string, type: string, orden: boolean, maxWinners: number) => {
    setSearchTerm(query);
    
    if (type !== 'aleatorio' && !query) {
      toast.current?.show({ severity: 'warn', summary: 'Búsqueda vacía', detail: 'Ingresa un criterio de búsqueda.', life: 2500 });
      return;
    }

    let found: CommentBlock[] = [];
    if (type === 'aleatorio') {
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      found = shuffled.slice(0, maxWinners);
    } else if (type === 'numero') {
      if (orden) {
        found = pool.filter(c => c.comment.replace(/\s/g, '').includes(query));
      } else {
        const perms = getPermutations(query);
        found = pool.filter(c =>
          perms.some(perm => c.comment.replace(/\s/g, '').includes(perm))
        );
      }
    } else if (type === 'palabra') {
      found = pool.filter(c => c.comment.toLowerCase().includes(query.toLowerCase()));
    } else if (type === 'marcador') {
      found = pool.filter(c => c.comment.includes(query));
    }

    if (found.length > 0) {
      setWinners(found.slice(0, maxWinners));
      localStorage.setItem('ganadores', JSON.stringify(found.slice(0, maxWinners)));
      localStorage.setItem('criterioBusqueda', JSON.stringify({
        tipo: type,
        valor: query
      }));
      localStorage.setItem('sorteoTitulo', sorteoTitulo);
      setShowCountdown(true);
    } else {
      setWinners([]);
      toast.current?.show({ severity: 'warn', summary: 'Sin coincidencias', detail: 'No se encontró ningún comentario que coincida.', life: 2500 });
    }
  };

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    navigate('/ganadores');
    toast.current?.show({ severity: 'success', summary: '¡Ganadores encontrados!', detail: `Se encontraron ${winners.length} comentarios que coinciden.`, life: 2500 });
  };

  const totalComentarios = pool.length;
  const usuariosUnicos = new Set(pool.map(c => c.username)).size;

  const batchExclude = () => {
    const usernames = selectedMainRef.current;
    if (usernames.size === 0) return;
    const toExclude = mainParticipants.filter(c => usernames.has(c.username + '||' + c.comment));
    setMainParticipants(prev => prev.filter(c => !usernames.has(c.username + '||' + c.comment)));
    setExcludedParticipants(prev => {
      const keys = new Set(prev.map(c => c.username + '||' + c.comment));
      return [...prev, ...toExclude.filter(c => !keys.has(c.username + '||' + c.comment))];
    });
    setSelectedMain(new Set());
  };

  const batchReinstate = () => {
    const idxs = selectedExcludedRef.current;
    if (idxs.size === 0) return;
    const toReinstate = excludedParticipants.filter((_, i) => idxs.has(i));
    setExcludedParticipants(prev => prev.filter((_, i) => !idxs.has(i)));
    setMainParticipants(prev => {
      const keys = new Set(prev.map(c => c.username + '||' + c.comment));
      return [...prev, ...toReinstate.filter(c => !keys.has(c.username + '||' + c.comment))];
    });
    setSelectedExcluded(new Set());
  };

  return (
  <div className="w-full min-h-screen bg-gradient-to-br from-blue-900 via-gray-900 to-yellow-100 py-4 sm:py-6 px-2 overflow-x-hidden">
    <Toast ref={toast} position="top-center" />

    {showCountdown && <Countdown onComplete={handleCountdownComplete} />}

    {/* Header */}
    <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
          Sorteos Facilísimo
        </h1>
        <p className="text-gray-300 text-base sm:text-lg">
          Encuentra ganadores de forma rápida y transparente
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {[ 
          { label: 'Comentarios', value: formatNumber(totalComentarios), color: 'blue' },
          { label: 'Usuarios', value: formatNumber(usuariosUnicos), color: 'green' },
          { label: 'Ganadores', value: formatNumber(winners.length), color: 'yellow' },
          { label: 'Buscado', value: searchTerm || '-', color: 'purple' },
        ].map((stat, i) => (
          <div
            key={i}
            className={`bg-${stat.color}-600/80 text-white text-center rounded-xl p-3 sm:p-4 border-2`}
          >
            <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
            <div className="text-xs sm:text-sm">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Layout principal */}
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">

      {/* FILTROS */}
      <div className="bg-gray-900/90 rounded-2xl border-2 border-yellow-400 shadow-xl p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
          Buscar Ganadores
        </h2>

        {/* Título */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-white font-semibold mb-2 text-center">
            Título del Sorteo
          </label>
          <input
            type="text"
            value={sorteoTitulo}
            onChange={(e) => setSorteoTitulo(e.target.value)}
            className="w-full px-4 py-2 sm:py-3 rounded-xl bg-gray-800 border-2 border-gray-700 focus:border-yellow-400 text-white text-sm sm:text-base text-center"
          />
        </div>

        {/* Imagen */}
        {imageUrl && (
          <div className="mb-4 sm:mb-6 flex justify-center">
            <img
              src={imageUrl}
              alt="Publicación"
              className="max-w-[200px] sm:max-w-xs rounded-xl border-2 border-blue-400"
            />
          </div>
        )}

        {/* Botones plataforma */}
        {platform === 'ambos' && (
          <div className="mb-4 flex gap-2 justify-center flex-wrap">
            {['ambos', 'instagram', 'facebook'].map((p) => (
              <button
                key={p}
                onClick={() => setActiveFilter(p as any)}
                className={`px-3 py-2 rounded-lg text-sm font-bold border-2 transition
                  ${activeFilter === p
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-800 text-white border-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4">
          {platform === 'facebook' ? (
            <FiltersFacebook onSearch={handleSearch} />
          ) : (
            <Filters onSearch={handleSearch} />
          )}
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-gray-900/90 rounded-2xl border-2 border-blue-400 shadow-xl p-4 sm:p-6 flex flex-col h-[70vh] sm:h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Comentarios ({formatNumber(totalComentarios)})
          </h2>
          <button
            type="button"
            onClick={() => setUniqueMode(!uniqueMode)}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
              uniqueMode
                ? 'bg-green-500 text-white border-green-400 shadow-lg shadow-green-500/30'
                : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-green-400 hover:text-white'
            }`}
          >
            <FaUsers className="text-sm" /> {uniqueMode ? 'Modo único' : 'Agrupar'}
          </button>
        </div>

        {/* Pestañas — solo visibles en modo único */}
        {uniqueMode && (
          <div className="flex gap-1 mb-3 border-b border-gray-700 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('participantes')}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-all duration-150 ${
                activeTab === 'participantes'
                  ? 'bg-blue-600/30 text-white border-blue-400'
                  : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
              }`}
            >
              Participantes
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-blue-500/40 text-blue-200">
                {formatNumber(mainParticipants.length)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('excluidos')}
              className={`flex-1 sm:flex-none px-3 sm:px-5 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-all duration-150 flex items-center justify-center gap-1.5 ${
                activeTab === 'excluidos'
                  ? 'bg-red-600/20 text-red-300 border-red-400'
                  : 'text-gray-400 border-transparent hover:text-red-300 hover:border-red-500/50'
              }`}
            >
              <FaTrashAlt className="text-xs" />
              Excluidos
              {excludedParticipants.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-red-500/40 text-red-200 font-bold">
                  {formatNumber(excludedParticipants.length)}
                </span>
              )}
            </button>
          </div>
        )}

        {/* CONTENEDOR SCROLL */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* Pestaña Participantes (o vista normal sin modo único) */}
          {(!uniqueMode || activeTab === 'participantes') && (
            <>
              {uniqueMode && selectedMain.size > 0 && (
                <div className="sticky top-0 z-10 mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      const count = selectedMain.size;
                      const name = count === 1 ? [...selectedMain][0].split('||')[0] : '';
                      setModalData({
                        title: count === 1 ? 'Excluir participante' : 'Excluir participantes',
                        message: count === 1
                          ? `¿Excluir al participante "${name}" del sorteo?`
                          : `¿Excluir a ${count} participantes del sorteo?`,
                        confirmLabel: 'Sí, excluir',
                        confirmClass: 'bg-red-500 hover:bg-red-600',
                        onConfirm: () => {
                          batchExclude();
                          setModalVisible(false);
                        },
                      });
                      setModalVisible(true);
                    }}
                    className="w-full px-4 py-2 rounded-lg font-bold text-white bg-red-500 hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    {selectedMain.size !== 1 ? 'Excluir seleccionados' : 'Excluir seleccionado'}
                  </button>
                </div>
              )}
              <div className="overflow-x-auto sm:overflow-x-visible">
                <CommentsTable
                  comments={pool}
                  renderActions={uniqueMode ? (c) => (
                    <input
                      type="checkbox"
                      checked={selectedMain.has(c.username + '||' + c.comment)}
                      onChange={() => {
                        const key = c.username + '||' + c.comment;
                        setSelectedMain(prev => {
                          const next = new Set(prev);
                          if (next.has(key)) next.delete(key);
                          else next.add(key);
                          return next;
                        });
                      }}
                      className="w-5 h-5 cursor-pointer accent-red-500"
                      title="Seleccionar para excluir"
                    />
                  ) : undefined}
                />
              </div>
            </>
          )}

          {/* Pestaña Excluidos */}
          {uniqueMode && activeTab === 'excluidos' && (
            <>
              {excludedParticipants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-500 gap-2">
                  <FaTrashAlt className="text-3xl opacity-30" />
                  <p className="text-sm">No hay comentarios excluidos</p>
                </div>
              ) : (
                <>
                  {selectedExcluded.size > 0 && (
                    <div className="sticky top-0 z-10 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          const count = selectedExcluded.size;
                          const firstIdx = [...selectedExcluded][0];
                          const name = count === 1 ? excludedParticipants[firstIdx]?.username : '';
                          setModalData({
                            title: count === 1 ? 'Reincorporar participante' : 'Reincorporar participantes',
                            message: count === 1
                              ? `¿Reincorporar al participante "${name}" al sorteo?`
                              : `¿Reincorporar a ${count} participantes al sorteo?`,
                            confirmLabel: 'Sí, reincorporar',
                            confirmClass: 'bg-green-500 hover:bg-green-600',
                            onConfirm: () => {
                              batchReinstate();
                              setModalVisible(false);
                            },
                          });
                          setModalVisible(true);
                        }}
                        className="w-full px-4 py-2 rounded-lg font-bold text-white bg-green-500 hover:bg-green-600 transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        {selectedExcluded.size !== 1 ? 'Reincorporar seleccionados' : 'Reincorporar seleccionado'}
                      </button>
                    </div>
                  )}
                  <CommentsTable
                    comments={excludedParticipants}
                    renderActions={(c, idx) => (
                      <input
                        type="checkbox"
                        checked={selectedExcluded.has(idx)}
                        onChange={() => {
                          setSelectedExcluded(prev => {
                            const next = new Set(prev);
                            if (next.has(idx)) next.delete(idx);
                            else next.add(idx);
                            return next;
                          });
                        }}
                        className="w-5 h-5 cursor-pointer accent-green-500"
                        title="Seleccionar para reincorporar"
                      />
                    )}
                  />
                </>
              )}
            </>
          )}

        </div>
      </div>
    </div>

    {/* Footer */}
    <footer className="text-gray-400 text-xs sm:text-sm text-center pb-4">
      &copy; {new Date().getFullYear()} Sorteos Facilísimo
    </footer>

    <ConfirmModal
      visible={modalVisible}
      title={modalData.title}
      message={modalData.message}
      confirmLabel={modalData.confirmLabel}
      confirmClass={modalData.confirmClass}
      onConfirm={modalData.onConfirm}
      onCancel={() => setModalVisible(false)}
    />
  </div>
);
}
export default SorteoPage;
