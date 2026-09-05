'use client';

import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Send, X, MessageSquare, ShieldCheck, ExternalLink } from 'lucide-react';

export default function WhatsAppButton() {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');

  // Clean raw phone to international digits format
  const rawNumber = (settings as any)?.whatsappNumber || settings.phone || '8801603742963';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const formattedNumber = cleanNumber.startsWith('88') ? cleanNumber : `88${cleanNumber}`;

  const defaultMessage = 'Hello ONWEAR! I have an inquiry regarding your apparel & orders.';
  const directWaUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encodeURIComponent(defaultMessage)}`;

  const handleSend = (textToSend?: string) => {
    const message = textToSend || customMsg.trim() || defaultMessage;
    const encoded = encodeURIComponent(message);
    const url = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encoded}`;
    
    // Open in new tab or direct window redirect
    try {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    }
    setCustomMsg('');
    setIsOpen(false);
  };

  const quickPrompts = [
    'Hello, I want to track my order 📦',
    'Can you help me choose the right size? 📏',
    'Do you have home delivery outside Dhaka? 🚚',
    'I want to inquire about bKash/Nagad payment 💳'
  ];

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex flex-col items-end select-none">
      
      {/* 1. INTERACTIVE CHAT POPUP WINDOW */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-32px)] max-w-[360px] bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-sm uppercase tracking-wider text-white border border-white/30">
                  OW
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#25D366] border-2 border-[#075E54]" />
              </div>
              <div className="flex flex-col">
                <h4 className="font-bold text-sm tracking-wide text-white">ONWEAR Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                  <span>Online • Instant WhatsApp</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Chat Background & Message Bubbles */}
          <div className="bg-[#ECE5DD] p-4 flex flex-col gap-3 max-h-[320px] overflow-y-auto">
            
            {/* Timestamp */}
            <div className="text-center">
              <span className="bg-white/80 text-zinc-500 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                Today
              </span>
            </div>

            {/* Support Welcome Bubble */}
            <div className="flex items-start gap-2 max-w-[95%]">
              <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-xs text-xs text-zinc-800 leading-relaxed border border-zinc-200/50">
                <p className="font-bold text-zinc-950 mb-1">Hello there! 👋</p>
                <p className="text-zinc-650">
                  Welcome to <strong>ONWEAR</strong>. Click a prompt below or type your message to chat directly on WhatsApp:
                </p>
                <span className="text-[9px] text-zinc-400 font-mono block text-right mt-1.5">Support Team</span>
              </div>
            </div>

            {/* Quick action prompt chips */}
            <div className="flex flex-col gap-1.5 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 pl-1">
                Frequently Asked:
              </span>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, idx) => {
                  const encoded = encodeURIComponent(prompt);
                  const promptUrl = `https://api.whatsapp.com/send?phone=${formattedNumber}&text=${encoded}`;
                  return (
                    <a
                      key={idx}
                      href={promptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-left text-xs font-semibold bg-white/95 hover:bg-white text-zinc-800 p-2.5 rounded-xl border border-zinc-200/80 shadow-xs hover:border-[#25D366] hover:text-[#075E54] transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <Send className="h-3 w-3 text-zinc-300 group-hover:text-[#25D366] shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* 1-Click Direct Chat Button */}
            <div className="pt-1">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors text-center"
              >
                <span>Open Direct WhatsApp</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

          </div>

          {/* Chat Input Box */}
          <div className="p-3 bg-white border-t border-zinc-100 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="flex-1 text-xs bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2.5 focus:outline-none focus:border-[#25D366] focus:bg-white text-zinc-900 font-medium placeholder-zinc-400"
              />
              <button
                onClick={() => handleSend()}
                className="p-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                title="Send Message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1 font-mono">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Instant Support</span>
              </span>
              <span className="font-mono text-zinc-500 font-bold">{settings.phone || '01603-742963'}</span>
            </div>
          </div>

        </div>
      )}

      {/* 2. FLOATING ACTION LAUNCH BUTTON */}
      <div className="flex items-center gap-2">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-full shadow-xl border border-zinc-800 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#25D366]" />
            <span>Chat with us</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105 hover:bg-[#20ba59] active:scale-95 transition-all duration-300 p-3 ring-4 ring-[#25D366]/20 cursor-pointer"
          title="Chat on WhatsApp"
          aria-label="Open ONWEAR WhatsApp live chat widget"
        >
          {/* Pulsing online ring */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white border-2 border-[#25D366]"></span>
            </span>
          )}

          {isOpen ? (
            <X className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          ) : (
            <svg
              className="h-5 w-5 sm:h-6 sm:w-6 fill-current text-white"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
          )}
        </button>
      </div>

    </div>
  );
}
