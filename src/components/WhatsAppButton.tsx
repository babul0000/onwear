'use client';

import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { MessageCircle, X } from 'lucide-react';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const [showTooltip, setShowTooltip] = useState(true);

  // Clean raw phone to international digits format
  const rawNumber = (settings as any)?.whatsappNumber || settings.phone || '8801603742663';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`;

  const defaultMessage = encodeURIComponent('Hello ONWEAR! I have an inquiry regarding clothing & orders.');
  const waUrl = `https://wa.me/${formattedNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-20 md:bottom-8 left-4 md:left-8 z-40 flex items-end gap-3 select-none">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-zinc-950 text-white text-xs font-semibold px-3.5 py-2 shadow-xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <span>Need help? Chat with us on WhatsApp</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-zinc-400 hover:text-white p-0.5"
            title="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105 hover:bg-[#20ba59] transition-all duration-300 p-3.5 ring-4 ring-[#25D366]/20"
        title="Chat on WhatsApp"
        aria-label="Chat with ONWEAR support on WhatsApp"
      >
        {/* Pulsing indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#25D366]"></span>
        </span>

        {/* Custom clean WhatsApp SVG icon */}
        <svg
          className="h-6 w-6 fill-current text-white"
          viewBox="0 0 24 24"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </a>
    </div>
  );
}
