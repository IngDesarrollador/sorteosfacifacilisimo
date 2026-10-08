export interface CommentBlock {
  id?: string;
  username: string;
  cedula?: string;
  date: string;
  comment: string;
  rawBlock: string;
  platform?: string;
}

/**
 * Parsea el contenido almacenado en localStorage.
 * Si es un JSON serializado (generado desde Excel o estructurado), lo procesa directamente conservando id, cédula y comentario.
 * Si es texto plano (archivos .txt de Instagram/Facebook), utiliza el parser correspondiente.
 */
export function parseStoredContent(
  rawContent: string,
  fallbackParser: (text: string) => CommentBlock[],
  platform?: string
): CommentBlock[] {
  if (!rawContent || !rawContent.trim()) return [];

  // Intenta parsear como JSON estructurado
  try {
    const parsed = JSON.parse(rawContent);
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      return parsed.map((item, idx) => ({
        id: item.id || `stored-${idx}-${item.cedula || item.username || 'item'}`,
        username: String(item.username || '').trim() || (item.cedula ? String(item.cedula).trim() : 'Participante'),
        cedula: item.cedula ? String(item.cedula).trim() : undefined,
        date: String(item.date || '').trim() || new Date().toLocaleDateString('es-ES'),
        comment: String(item.comment || '').trim() || 'Participante del sorteo',
        rawBlock: item.rawBlock || `${item.username}\n${item.date}\n${item.comment}`,
        platform: platform || item.platform
      }));
    }
  } catch {
    // Si no es JSON, continúa como texto plano
  }

  // Parser tradicional para texto plano (.txt)
  const blocks = fallbackParser(rawContent);
  return blocks.map((c, idx) => ({
    ...c,
    id: c.id || `txt-${idx}-${c.username}`,
    platform: platform || c.platform
  }));
}

export function parseComments(text: string): CommentBlock[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: CommentBlock[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const username = lines[i];
    
    // Verificar que la línea actual sea un nombre de usuario válido
    if (!username || /^Foto del perfil de /.test(username) || username === 'Responder' || username === 'Ocultar') {
      i++;
      continue;
    }
    
    const dateLine = lines[i + 1] || '';
    let commentLines: string[] = [];
    let j = i + 2;
    
    // Recolectar todas las líneas del comentario hasta encontrar el siguiente usuario
    while (j < lines.length) {
      const currentLine = lines[j];
      
      // Si encontramos el siguiente usuario o fin de bloque, terminamos
      if (/^Foto del perfil de /.test(currentLine) || currentLine === 'Responder' || currentLine === 'Ocultar') {
        break;
      }
      
      // Si encontramos una línea que parece ser una fecha (contiene h, min, d, etc.), también terminamos
      if (/(\d+\s*(sem|h|d|min|días|dias|seg|s)\b)/i.test(currentLine)) {
        break;
      }
      
      // Si la línea no está vacía, la agregamos al comentario
      if (currentLine && currentLine.trim()) {
        commentLines.push(currentLine);
      }
      
      j++;
    }
    
    // Crear el bloque con el comentario completo
    const comment = commentLines.join('\n');
    const rawBlock = [username, dateLine, ...commentLines].join('\n');
    
    blocks.push({
      username,
      date: dateLine,
      comment,
      rawBlock,
    });
    
    // Mover el índice al siguiente usuario
    i = j;
    
    // Saltar líneas 'Responder', 'Ocultar' o 'Foto del perfil de ...' repetidas
    while (i < lines.length && (lines[i] === 'Responder' || lines[i] === 'Ocultar' || /^Foto del perfil de /.test(lines[i]))) {
      i++;
    }
  }
  
  return blocks;
}

// Parser para Facebook
export function parseCommentsFacebook(text: string): CommentBlock[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: CommentBlock[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const username = lines[i];
    if (!username || /^Foto del perfil de /.test(username) || username === 'Responder' || username === 'Ocultar') {
      i++;
      continue;
    }

    const commentLine = lines[i + 1] || '';
    const dateLine = lines[i + 2] || '';
    const nextLine = lines[i + 3] || '';
    
    // Un bloque termina si la siguiente línea es 'Responder', 'Ocultar' o 'Foto del perfil de ...'
    if (nextLine === 'Responder' || nextLine === 'Ocultar' || /^Foto del perfil de /.test(nextLine)) {
      const rawBlock = [username, commentLine, dateLine, nextLine].join('\n');
      blocks.push({
        username,
        date: dateLine,
        comment: commentLine,
        rawBlock,
      });
      i += 3;
      // Saltar líneas repetidas
      while (lines[i + 1] && (/^Foto del perfil de /.test(lines[i + 1]) || lines[i + 1] === 'Responder' || lines[i + 1] === 'Ocultar')) {
        i++;
      }
      i++;
      continue;
    }
    
    // Detecta si la línea de fecha contiene 'sem', 'h', 'd', etc.
    if (/(\d+\s*(sem|h|d|min|días|dias|seg|s)\b)/i.test(dateLine)) {
      const rawBlock = [username, commentLine, dateLine].join('\n');
      blocks.push({
        username,
        date: dateLine,
        comment: commentLine,
        rawBlock,
      });
      i += 3;
      while (i < lines.length && (lines[i] === 'Responder' || lines[i] === 'Ocultar' || /^Foto del perfil de /.test(lines[i]))) {
        i++;
      }
      continue;
    }
    
    i++;
  }
  
  return blocks;
}

export default parseComments;
