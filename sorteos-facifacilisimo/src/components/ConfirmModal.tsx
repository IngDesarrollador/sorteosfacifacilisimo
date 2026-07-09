import React from 'react';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  confirmLabel,
  confirmClass = 'bg-blue-500 hover:bg-blue-600',
  onConfirm,
  onCancel,
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-6 py-2 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className={`px-6 py-2 rounded-lg font-bold text-white transition ${confirmClass}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
