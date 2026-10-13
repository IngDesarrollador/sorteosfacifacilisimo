export interface ParticipantParsedData {
  usuario: string;
  cedula: string;
}

/**
 * Analiza el dato/comentario original completo y determina qué parte es TEXTO y qué parte es NÚMERO.
 * 
 * Reglas:
 * - La posición NO importa. Puede aparecer primero el número y después el texto, o al revés.
 * - Todo lo que contenga letras corresponde a TEXTO / USUARIO.
 * - Todo bloque puramente numérico corresponde a CÉDULA.
 * 
 * Regla Final:
 * - SI HAY TEXTO + NÚMERO: TEXTO → USUARIO, NÚMERO → CÉDULA
 * - SI SOLO HAY TEXTO: TEXTO → USUARIO, CÉDULA → VACÍO
 * - SI SOLO HAY NÚMERO: NÚMERO → USUARIO, CÉDULA → VACÍO
 */
export function parseParticipantData(originalInput: string | any[]): ParticipantParsedData {
  if (!originalInput) {
    return { usuario: '', cedula: '' };
  }

  let text = '';
  if (Array.isArray(originalInput)) {
    text = originalInput
      .map(c => (c !== null && c !== undefined ? String(c).trim() : ''))
      .filter(c => {
        if (!c) return false;
        // Descartar encabezados o nombres estáticos de empresa
        if (/red de servicios|facilisimo|empresa|apostar|s\.?a\.?/i.test(c)) return false;
        return true;
      })
      .join(' ');
  } else {
    text = String(originalInput);
  }

  // Normalizar separadores comunes (comas, punto y comas, tabulaciones) a espacios
  const cleaned = text.replace(/[,;\t]+/g, ' ').trim();
  if (!cleaned) {
    return { usuario: '', cedula: '' };
  }

  // Dividir en tokens respetando los espacios
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  const textTokens: string[] = [];
  const numberTokens: string[] = [];

  for (const token of tokens) {
    // Si contiene al menos una letra (incluye tildes, ñ, etc.), corresponde a TEXTO
    if (/[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ]/.test(token)) {
      textTokens.push(token);
    } else {
      // Bloque numérico (admitiendo formatos como 1.023.456 o 1023456)
      const sanitizedNum = token.replace(/[.-]/g, '');
      if (/^\d+$/.test(sanitizedNum)) {
        numberTokens.push(sanitizedNum);
      } else {
        // Si no son dígitos, agrupar con el texto
        textTokens.push(token);
      }
    }
  }

  const textResult = textTokens.join(' ').trim();
  const numberResult = numberTokens.join(' ').trim();

  // REGLAS FINALES:
  // 1. SI HAY TEXTO + NÚMERO:
  //    TEXTO → USUARIO
  //    NÚMERO → CÉDULA
  if (textResult && numberResult) {
    return {
      usuario: textResult,
      cedula: numberResult
    };
  }

  // 2. SI SOLO HAY TEXTO:
  //    TEXTO → USUARIO
  //    CÉDULA → VACÍO
  if (textResult && !numberResult) {
    return {
      usuario: textResult,
      cedula: ''
    };
  }

  // 3. SI SOLO HAY NÚMERO:
  //    NÚMERO → USUARIO
  //    CÉDULA → VACÍO
  if (!textResult && numberResult) {
    return {
      usuario: numberResult,
      cedula: ''
    };
  }

  return {
    usuario: cleaned,
    cedula: ''
  };
}
