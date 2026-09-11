'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, X, AlertCircle, Info, Flame, Clock, CheckCircle2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  loading?: boolean;
  itemPreview?: {
    image?: string;
    title: string;
    subtitle?: string;
    badge?: string;
  };
  children?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  itemPreview,
  children,
}: ConfirmModalProps) {
  const modalDescription = description || message;
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, loading, onClose]);

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 text-red-600 border border-red-200/60',
      icon: <Trash2 className="h-6 w-6 text-red-600" />,
      btn: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 shadow-lg',
      badge: 'bg-red-50 text-red-700 border-red-200',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200/60',
      icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
      btn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 shadow-lg',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    info: {
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-200/60',
      icon: <Info className="h-6 w-6 text-indigo-600" />,
      btn: 'bg-zinc-950 hover:bg-zinc-850 text-white shadow-zinc-900/20 shadow-lg',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-lg',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  }[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !loading && onClose()}
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col gap-5 z-10 text-zinc-800"
          >
            {/* Top Close Button */}
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header with Icon and Title */}
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-2xl shrink-0 ${variantStyles.iconBg}`}>
                {variantStyles.icon}
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-lg font-black text-zinc-950 tracking-tight font-sans">
                  {title}
                </h3>
                {modalDescription && (
                  <div className="text-xs text-zinc-500 mt-1 leading-relaxed font-sans font-medium">
                    {modalDescription}
                  </div>
                )}
              </div>
            </div>

            {/* Item Preview Card (If provided) */}
            {itemPreview && (
              <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/70">
                {itemPreview.image && (
                  <div className="h-12 w-12 rounded-xl overflow-hidden bg-white border border-zinc-200/80 shrink-0">
                    <img
                      src={itemPreview.image}
                      alt={itemPreview.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-zinc-900 truncate font-sans">
                      {itemPreview.title}
                    </h4>
                    {itemPreview.badge && (
                      <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-200/80 text-zinc-700 px-2 py-0.5 rounded font-mono">
                        {itemPreview.badge}
                      </span>
                    )}
                  </div>
                  {itemPreview.subtitle && (
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 truncate">
                      {itemPreview.subtitle}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Custom Children / Extra inputs */}
            {children}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-650 bg-zinc-100 hover:bg-zinc-200 transition-all cursor-pointer font-sans"
              >
                {cancelText}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={`px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer font-sans disabled:opacity-50 ${variantStyles.btn}`}
              >
                {loading && <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
