import React, { useRef, useState } from 'react';
import { Toast } from 'primereact/toast';
import { validateAndProcessFile, type TargetFunction } from '../utils/fileProcessor';

export interface FileUploaderProps {
  onFileRead: (fileContent: string, fileName?: string) => void | Promise<void>;
  onFileCleared?: () => void;
  toast?: React.RefObject<any>; 
  disabled?: boolean;
  label?: string; 
  accept?: string;
  targetFunction?: TargetFunction;
  currentFileName?: string | null;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileRead,
  onFileCleared,
  disabled,
  label,
  accept = '.txt,.xlsx,.xls',
  targetFunction = 'nombres',
  currentFileName,
}) => {
  const localToast = useRef<Toast>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleButtonClick = () => {
    if (disabled || isProcessing) return;
    if (inputRef.current) {
      // Limpiar previamente el valor para garantizar que el evento change
      // se dispare incluso si se vuelve a seleccionar el mismo archivo
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setIsProcessing(true);
    try {
      const result = await validateAndProcessFile(file, targetFunction);
      if (!result.success) {
        localToast.current?.show({
          severity: 'error',
          summary: 'Formato inválido',
          detail: result.error || 'El archivo seleccionado no cumple con el formato requerido.',
          life: 4500
        });
      } else {
        localToast.current?.show({
          severity: 'success',
          summary: '¡Éxito!',
          detail: `Archivo procesado correctamente (${result.count || 0} registros)`,
          life: 3000
        });
        await onFileRead(result.data || '', file.name);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
      localToast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ocurrió un error inesperado al leer el archivo. Intenta nuevamente.',
        life: 4000
      });
    } finally {
      setIsProcessing(false);
      // Siempre limpiar el valor del input para permitir seleccionar
      // inmediatamente otro archivo o exactamente el mismo archivo
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <Toast ref={localToast} position="top-center" />
      {label && <div className="mb-2 text-blue-200 font-bold text-base md:text-lg min-h-[48px] flex items-center justify-center">{label}</div>}
      
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        onClick={(e) => {
          (e.currentTarget as HTMLInputElement).value = '';
        }}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={disabled || isProcessing}
        className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-blue-900 text-lg py-3 shadow-lg font-semibold rounded-lg border-2 border-yellow-300 transition-all duration-200 cursor-pointer active:scale-95"
      >
        <i className={isProcessing ? "pi pi-spin pi-spinner text-lg" : "pi pi-upload text-lg"} />
        <span>{isProcessing ? 'Procesando...' : 'Sorteos'}</span>
      </button>

      {/* Indicador de archivo cargado */}
      {currentFileName && (
        <div className="mt-2 w-full flex items-center justify-between bg-blue-950/70 border border-blue-400/40 rounded-lg px-3 py-1.5 text-xs text-blue-200 animate-fadeIn">
          <span className="truncate max-w-[180px] font-medium" title={currentFileName}>
            ✓ {currentFileName}
          </span>
          {onFileCleared && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileCleared();
              }}
              className="ml-2 text-red-400 hover:text-red-300 font-bold px-1 rounded transition"
              title="Quitar archivo"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
