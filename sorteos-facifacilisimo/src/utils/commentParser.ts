export interface CommentBlock {
  username: string;
  date: string;
  comment: string;
  rawBlock: string;
}

export function parseComments(text: string): CommentBlock[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks: CommentBlock[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const username = lines[i];
    
    // Verificar que la línea actual sea un nombre de usuario válido
    if (!username || /^Foto del perfil de /.test(username)) {
      i++;
      continue;
    }
    
    const dateLine = lines[i + 1] || '';
    let commentLines: string[] = [];
    let j = i + 2;
    
    // Recolectar todas las líneas del comentario hasta encontrar el siguiente usuario
    while (j < lines.length) {
      const currentLine = lines[j];
      
      // Si encontramos el siguiente usuario, terminamos
      if (/^Foto del perfil de /.test(currentLine) || currentLine === 'Responder') {
        break;
      }
      
      // Si encontramos una línea que parece ser una fecha (contiene h, min, d, etc.), también terminamos
      if (/(\d+\s*(sem|h|d|min))/.test(currentLine)) {
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
    
    // Saltar líneas 'Foto del perfil de ...' repetidas
    while (i < lines.length && /^Foto del perfil de /.test(lines[i])) {
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
      // Saltar líneas 'Foto del perfil de ...' repetidas
      while (lines[i + 1] && /^Foto del perfil de /.test(lines[i + 1])) i++;
      i++;
      continue;
    }
    
    // Detecta si la línea de fecha contiene 'sem', 'h', 'd', etc.
    if (/(\d+\s*(sem|h|d|min))/.test(dateLine)) {
      const rawBlock = [username, commentLine, dateLine].join('\n');
      blocks.push({
        username,
        date: dateLine,
        comment: commentLine,
        rawBlock,
      });
      i += 3;
      continue;
    }
    
    i++;
  }
  
  return blocks;
}

export default parseComments;
