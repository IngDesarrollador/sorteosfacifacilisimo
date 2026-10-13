import * as XLSX from 'xlsx';
import { parseComments, parseCommentsFacebook, type CommentBlock } from './commentParser';
import { parseParticipantData } from './participantParser';

export type TargetFunction = 'instagram' | 'facebook' | 'nombres';

export interface FileProcessResult {
  success: boolean;
  data?: string;
  count?: number;
  error?: string;
  fileName: string;
}

const ALLOWED_EXTENSIONS = ['.txt', '.xlsx', '.xls'];

/**
 * Valida la extensión del archivo
 */
export function isValidFileExtension(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return ALLOWED_EXTENSIONS.some(ext => lower.endsWith(ext));
}

/**
 * Regex para detectar tokens de tiempo/fecha habituales en comentarios
 */
const DATE_REGEX = /(\d+\s*(sem|h|d|min|días|dias|seg|s)\b)/i;

/**
 * Detecta si el texto crudo parece corresponder a una lista de nombres simples
 * (es decir, una lista de palabras/nombres sin timestamps, sin 'Responder', etc.)
 */
function isProbablyNameList(text: string): boolean {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return false;
  
  const commentMarkers = [
    /\b(responder|ocultar|me gusta|compartir)\b/i,
    /foto del perfil de/i,
    DATE_REGEX
  ];
  
  const hasCommentMarkers = lines.some(l => commentMarkers.some(re => re.test(l)));
  return !hasCommentMarkers;
}

/**
 * Detecta si el texto crudo contiene marcadores específicos de Facebook
 */
function hasFacebookMarkers(text: string): boolean {
  return (
    /\bocultar\b/i.test(text) ||
    /me gusta\s*·\s*responder/i.test(text) ||
    /ver más respuestas/i.test(text) ||
    /más relevantes/i.test(text) ||
    /escribió un comentario/i.test(text)
  );
}

/**
 * Detecta si el texto TXT tiene estructura característica de Instagram:
 * Linea 0: usuario
 * Linea 1: fecha (e.g. 2 d, 1 sem)
 * Linea 2: comentario
 */
function hasInstagramTxtStructure(lines: string[]): boolean {
  if (lines.length < 3) return false;
  // En Instagram, la segunda línea de un bloque es típicamente una fecha
  const hasDateInLine1 = DATE_REGEX.test(lines[1]);
  const hasDateInLine2 = DATE_REGEX.test(lines[2]);
  return hasDateInLine1 && !hasDateInLine2;
}

/**
 * Detecta si el texto TXT tiene estructura característica de Facebook:
 * Linea 0: usuario
 * Linea 1: comentario
 * Linea 2: fecha (e.g. 2 d, 1 sem)
 */
function hasFacebookTxtStructure(lines: string[]): boolean {
  if (lines.length < 3) return false;
  const hasDateInLine1 = DATE_REGEX.test(lines[1]);
  const hasDateInLine2 = DATE_REGEX.test(lines[2]);
  return !hasDateInLine1 && hasDateInLine2;
}

/**
 * Normaliza celdas de Excel a strings limpios
 */
function cellToString(cell: any): string {
  if (cell === null || cell === undefined) return '';
  return String(cell).trim();
}

/**
 * Encuentra la hoja más adecuada con contenido en un workbook
 */
function findBestWorksheet(workbook: XLSX.WorkBook): { worksheet: XLSX.WorkSheet | null; sheetName: string } {
  let bestSheet: XLSX.WorkSheet | null = null;
  let bestSheetName = '';
  let maxRowCount = 0;

  for (const sName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sName];
    if (sheet && sheet['!ref']) {
      const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      const nonEmptyRows = rows.filter(r => Array.isArray(r) && r.some(c => cellToString(c) !== ''));
      if (nonEmptyRows.length > maxRowCount) {
        maxRowCount = nonEmptyRows.length;
        bestSheet = sheet;
        bestSheetName = sName;
      }
    }
  }

  return { worksheet: bestSheet, sheetName: bestSheetName };
}

/**
 * Convierte una hoja de cálculo Excel en un array estructurado de CommentBlock
 * reconociendo automáticamente columnas como Cédula, Usuario/Nombre, Comentario/Número y Fecha.
 */
export function processExcelToCommentBlocks(
  worksheet: XLSX.WorkSheet,
  platform?: string
): CommentBlock[] {
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const rows = rawRows.filter(r => Array.isArray(r) && r.some(cell => cellToString(cell) !== ''));

  if (rows.length === 0) return [];

  // Detectar si la primera fila son encabezados descriptivos (ej: "usuario", "nombre", "cedula", etc.)
  const firstRowLower = rows[0].map(c => cellToString(c).toLowerCase());
  const isHeaderRow = firstRowLower.some(h =>
    /(usuario|username|user|nombres?|participante|cliente|c[eé]dula|documento|identificaci|doc\b|cc\b|nit\b)/i.test(h)
  );
  const dataRows = isHeaderRow ? rows.slice(1) : rows;

  const blocks: CommentBlock[] = [];
  dataRows.forEach((r, idx) => {
    // Pasar el dato original de la fila completa a parseParticipantData
    const { usuario, cedula } = parseParticipantData(r);

    if (!usuario && !cedula) return;

    const username = usuario || (cedula ? cedula : `Participante ${idx + 1}`);

    blocks.push({
      id: `row-${idx}-${cedula || username || idx}`,
      username,
      cedula: cedula ? cedula.trim() : undefined,
      date: '',
      comment: username,
      rawBlock: `${username}${cedula ? ` - ${cedula}` : ''}`,
      platform: platform || 'nombres'
    });
  });

  return blocks;
}

/**
 * Procesa y valida un archivo para la función de INSTAGRAM (Únicamente .txt)
 */
async function processInstagramFile(file: File): Promise<FileProcessResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  if (!lowerName.endsWith('.txt')) {
    return {
      success: false,
      error: 'La función de Instagram solo admite archivos .txt de comentarios. Para archivos Excel (.xlsx/.xls) utiliza la opción de Nombres para sorteo.',
      fileName
    };
  }

  const text = await file.text();
  if (!text || !text.trim()) {
    return {
      success: false,
      error: 'El archivo seleccionado está vacío. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Si es claramente un archivo de nombres
  if (isProbablyNameList(text)) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Instagram. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  // Si contiene marcadores o estructura de Facebook
  if (hasFacebookMarkers(text) || hasFacebookTxtStructure(lines)) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Instagram. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  const blocks = parseComments(text);
  if (!blocks || blocks.length === 0) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Instagram. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  return {
    success: true,
    data: text,
    count: blocks.length,
    fileName
  };
}

/**
 * Procesa y valida un archivo para la función de FACEBOOK (Únicamente .txt)
 */
async function processFacebookFile(file: File): Promise<FileProcessResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  if (!lowerName.endsWith('.txt')) {
    return {
      success: false,
      error: 'La función de Facebook solo admite archivos .txt de comentarios. Para archivos Excel (.xlsx/.xls) utiliza la opción de Nombres para sorteo.',
      fileName
    };
  }

  const text = await file.text();
  if (!text || !text.trim()) {
    return {
      success: false,
      error: 'El archivo seleccionado está vacío. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Si es claramente un archivo de nombres
  if (isProbablyNameList(text)) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Facebook. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  // Si tiene la estructura característica de Instagram (fecha en línea 1, comentario en línea 2)
  if (hasInstagramTxtStructure(lines)) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Facebook. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  const blocks = parseCommentsFacebook(text);
  if (!blocks || blocks.length === 0) {
    return {
      success: false,
      error: 'El archivo seleccionado no cumple con el formato requerido para Facebook. Verifica que estés cargando el archivo correcto.',
      fileName
    };
  }

  return {
    success: true,
    data: text,
    count: blocks.length,
    fileName
  };
}

/**
 * Procesa y valida un archivo para la función de NOMBRES DE SORTEO
 */
async function processNombresFile(file: File): Promise<FileProcessResult> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.txt')) {
    const text = await file.text();
    if (!text || !text.trim()) {
      return {
        success: false,
        error: 'El archivo seleccionado está vacío. Verifica que estés cargando el archivo correcto.',
        fileName
      };
    }

    // Si contiene estructura típica de comentarios de redes sociales
    const hasCommentStructure = (
      /\b(responder|ocultar)\b/i.test(text) ||
      /foto del perfil de/i.test(text) ||
      DATE_REGEX.test(text)
    );

    if (hasCommentStructure) {
      return {
        success: false,
        error: 'El archivo seleccionado no cumple con el formato requerido para Nombres. Verifica que estés cargando el archivo correcto.',
        fileName
      };
    }

    const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      return {
        success: false,
        error: 'El archivo seleccionado no cumple con el formato requerido para Nombres. Verifica que estés cargando el archivo correcto.',
        fileName
      };
    }

    const blocks: CommentBlock[] = [];
    rawLines.forEach((line, idx) => {
      const { usuario, cedula } = parseParticipantData(line);
      if (!usuario && !cedula) return;

      const username = usuario || (cedula ? cedula : `Participante ${idx + 1}`);

      blocks.push({
        id: `txt-nom-${idx}-${cedula || username || idx}`,
        username,
        cedula: cedula ? cedula.trim() : undefined,
        date: '',
        comment: username,
        rawBlock: `${username}${cedula ? ` - ${cedula}` : ''}`,
        platform: 'nombres'
      });
    });

    if (blocks.length === 0) {
      return {
        success: false,
        error: 'El archivo seleccionado no contiene nombres o registros válidos.',
        fileName
      };
    }

    return {
      success: true,
      data: JSON.stringify(blocks),
      count: blocks.length,
      fileName
    };
  }

  // Excel (.xlsx, .xls)
  try {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return {
        success: false,
        error: 'El archivo Excel no contiene hojas con información.',
        fileName
      };
    }

    const { worksheet } = findBestWorksheet(workbook);

    if (!worksheet) {
      return {
        success: false,
        error: 'El archivo Excel no contiene datos válidos.',
        fileName
      };
    }

    const blocks = processExcelToCommentBlocks(worksheet, 'nombres');
    if (blocks.length === 0) {
      return {
        success: false,
        error: 'El archivo seleccionado no contiene nombres o registros válidos.',
        fileName
      };
    }

    return {
      success: true,
      data: JSON.stringify(blocks),
      count: blocks.length,
      fileName
    };
  } catch (err) {
    return {
      success: false,
      error: 'Error al leer el archivo Excel. Verifica que no esté corrupto o protegido.',
      fileName
    };
  }
}

/**
 * Función principal para validar y procesar cualquier archivo según la función destino
 */
export async function validateAndProcessFile(
  file: File,
  targetFunction: TargetFunction
): Promise<FileProcessResult> {
  const fileName = file.name;

  // 1. Validar extensión permitida según función
  const lower = fileName.toLowerCase();
  if (targetFunction === 'instagram' || targetFunction === 'facebook') {
    if (!lower.endsWith('.txt')) {
      const funcName = targetFunction === 'instagram' ? 'Instagram' : 'Facebook';
      return {
        success: false,
        error: `La función de ${funcName} solo admite archivos .txt de comentarios. Para archivos Excel (.xlsx/.xls) utiliza la opción de Nombres para sorteo.`,
        fileName
      };
    }
  } else {
    if (!isValidFileExtension(fileName)) {
      return {
        success: false,
        error: 'Tipo de archivo no permitido. Solo se permiten archivos .txt, .xlsx o .xls.',
        fileName
      };
    }
  }

  // 2. Procesamiento específico según función
  switch (targetFunction) {
    case 'instagram':
      return processInstagramFile(file);
    case 'facebook':
      return processFacebookFile(file);
    case 'nombres':
      return processNombresFile(file);
    default:
      return {
        success: false,
        error: 'Función de sorteo no reconocida.',
        fileName
      };
  }
}
