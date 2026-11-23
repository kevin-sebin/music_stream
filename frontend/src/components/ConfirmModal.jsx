import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Delete",
  isDanger = true
}) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#121318] border border-neutral-800 rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-3 border-t border-neutral-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-full text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-full font-bold text-xs tracking-tight shadow-lg transition-transform active:scale-95 disabled:opacity-50 ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                : 'bg-white hover:bg-neutral-200 text-black'
            }`}
          >
            {isLoading && <Loader2 size={13} className="animate-spin mr-1" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
