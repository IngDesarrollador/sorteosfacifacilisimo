import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface WinnerDialogProps {
  visible: boolean;
  comments: { username: string; comment: string; cedula?: string }[];
  onHide: () => void;
  sorteoTitulo?: string;
}

// Utilidad para convertir una imagen pública a base64
async function getBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const WinnerDialog: React.FC<WinnerDialogProps> = ({ visible, comments, onHide, sorteoTitulo = 'Ganadores del Sorteo' }) => {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [iconBase64, setIconBase64] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      // Carga las imágenes solo cuando el diálogo es visible
      getBase64FromUrl('/images/Facilisimo-removebg-preview.png').then(setLogoBase64);
      getBase64FromUrl('/images/icono-img-removebg-preview.png').then(setIconBase64);
    }
  }, [visible]);

  // Puedes ajustar el tamaño del confeti según tu layout
  const width = window.innerWidth;
  const height = window.innerHeight;

  function exportGanadoresPDF(winners: { username: string; comment: string; cedula?: string }[]) {
    const doc = new jsPDF();
    const hasCedula = winners.some(w => !!w.cedula && w.cedula.trim().length > 0);

    // Header con logo y nombre
    doc.setFillColor(255, 221, 51); // Amarillo Facilísimo
    doc.rect(0, 0, 210, 40, 'F');
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 10, 5, 50, 30);
    }
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text(sorteoTitulo, 70, 25);

    // Tabla de ganadores
    autoTable(doc, {
      startY: 50,
      head: hasCedula ? [['#', 'Usuario', 'Cédula', 'Comentario']] : [['#', 'Usuario', 'Comentario']],
      body: winners.map((w, i) =>
        hasCedula ? [i + 1, w.username, w.cedula || '-', w.comment] : [i + 1, w.username, w.comment]
      ),
      styles: {
        fontSize: 12,
        cellPadding: 4,
        halign: 'left',
      },
      headStyles: {
        fillColor: [33, 37, 41], // Azul oscuro
        textColor: [255, 221, 51], // Amarillo
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Gris claro
      },
      columnStyles: hasCedula
        ? {
            0: { halign: 'center', cellWidth: 12 },
            1: { cellWidth: 40 },
            2: { cellWidth: 35 },
            3: { cellWidth: 85 },
          }
        : {
            0: { halign: 'center', cellWidth: 12 },
            1: { cellWidth: 40 },
            2: { cellWidth: 120 },
          },
      margin: { left: 10, right: 10 },
    });

    // Footer con icono y slogan
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(33, 37, 41); // Azul oscuro
    doc.rect(0, pageHeight - 20, 210, 20, 'F');
    if (iconBase64) {
      doc.addImage(iconBase64, 'PNG', 10, pageHeight - 18, 12, 12);
    }
    doc.setFontSize(12);
    doc.setTextColor(255, 221, 51);
    doc.text('Sorteos FaciFacilísimo - ¡Tu sorteo, fácil y transparente!', 25, pageHeight - 8);

    doc.save('ganadores_facilisimo.pdf');
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <h2 className="text-2xl font-bold mb-6 text-green-600">🎉 {sorteoTitulo} 🎉</h2>
        <ul className="mb-6">
          {comments.map((winner, idx) => (
            <li key={idx} className="mb-4 border-b pb-2">
              <span className="font-bold text-lg text-blue-700">
                {idx + 1}. {winner.username}
                {winner.cedula && (
                  <span className="ml-2 text-sm text-gray-500 font-semibold font-mono">(CC: {winner.cedula})</span>
                )}
              </span>
              <div className="text-gray-700">{winner.comment}</div>
            </li>
          ))}
        </ul>
        <button
          className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition mb-2"
          onClick={() => exportGanadoresPDF(comments)}
          disabled={!logoBase64 || !iconBase64}
        >
          Guardar y compartir
        </button>
        <br />
        <button
          className="text-gray-500 underline mt-2"
          onClick={onHide}
        >
          Volver a filtrar
        </button>
      </div>
    </div>
  );
};

export default WinnerDialog;
