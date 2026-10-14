// Para exportar PDF profesional, usa la función exportGanadoresPDF del WinnerDialog. Pega tus imágenes en base64 en las variables logoBase64 y iconBase64.
import React, { useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import type { FileUploadHandlerEvent } from 'primereact/fileupload';

export interface FileUploaderProps {
  onFileRead: (fileContent: string | File) => void;
  toast?: React.RefObject<any>; 
  disabled?: boolean;
  label?: string; 
  accept?: string; // <-- agrega esta línea
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileRead, disabled, label, accept }) => {
  const toast = useRef<Toast>(null);

  const handleUpload = async (e: FileUploadHandlerEvent) => {
    const file = e.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Si es Excel, pasa el File directamente
      onFileRead(file);
    } else if (fileName.endsWith('.txt')) {
      // Si es txt, lee el texto y pásalo
      try {
        const text = await file.text();
        if (!text.trim()) {
          return;
        }
        onFileRead(text);
      } catch (error) {
        console.error('Error al leer el archivo:', error);
      }
    } else {
      // Mostrar notificación estética con Toast
      toast.current?.show({ 
        severity: 'warn', 
        summary: 'Tipo de archivo no válido', 
        detail: 'Solo se permiten archivos .txt, .xlsx o .xls', 
        life: 4000,
        style: {
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          color: 'white',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} position="top-center" />
      {label && <div className="mb-2 text-blue-900 font-bold text-lg">{label}</div>}
      <FileUpload
        name="comments"
        accept={accept || ".txt"} 
        customUpload
        uploadHandler={handleUpload}
        chooseLabel="Sorteos"
        mode="basic"
        auto
        maxFileSize={1000000}
        disabled={disabled}
        chooseOptions={{
          className: "w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-lg py-3 shadow-lg font-semibold rounded-lg border-2 border-yellow-300 transition-all duration-200",
          icon: 'pi pi-upload',
        }}
      />
    </div>
  );
};

export default FileUploader;
