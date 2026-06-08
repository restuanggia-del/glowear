'use client';

import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type DialogType = 'success' | 'error' | 'info' | 'confirm' | 'warning';

export interface DialogState {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface DialogModalProps {
  dialog: DialogState;
  onClose: () => void;
}

export const DEFAULT_DIALOG: DialogState = {
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
};

export default function DialogModal({ dialog, onClose }: DialogModalProps) {
  if (!dialog.isOpen) return null;

  const iconMap: Record<DialogType, React.ReactNode> = {
    success: <CheckCircle2 size={32} />,
    error: <X size={32} />,
    confirm: <AlertCircle size={32} />,
    warning: <AlertCircle size={32} />,
    info: <Info size={32} />,
  };

  const colorMap: Record<DialogType, string> = {
    success: 'bg-emerald-100 text-emerald-500',
    error: 'bg-rose-100 text-rose-500',
    confirm: 'bg-amber-100 text-amber-500',
    warning: 'bg-amber-100 text-amber-500',
    info: 'bg-blue-100 text-blue-500',
  };

  const btnMap: Record<DialogType, string> = {
    success: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
    error: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20',
    confirm: 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20',
    warning: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
    info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
  };

  const isConfirm = dialog.type === 'confirm' || dialog.type === 'warning';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isConfirm && onClose()}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-100 p-8 text-center">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-5 shadow-inner ${colorMap[dialog.type]}`}>
          {iconMap[dialog.type]}
        </div>

        {/* Text */}
        <h3 className="text-xl font-black text-slate-900 leading-tight mb-2">{dialog.title}</h3>
        <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 px-2">{dialog.message}</p>

        {/* Buttons */}
        {isConfirm ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={dialog.onConfirm}
              className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-95 ${btnMap[dialog.type]}`}
            >
              {dialog.confirmText || 'Ya, Lanjutkan'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95"
            >
              {dialog.cancelText || 'Batal'}
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition-all active:scale-95 ${btnMap[dialog.type]}`}
          >
            Mengerti
          </button>
        )}
      </div>
    </div>
  );
}
