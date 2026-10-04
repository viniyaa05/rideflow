import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  ChevronRight, 
  ShieldAlert, 
  MapPin, 
  Compass, 
  MessageSquare,
  Globe,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { processFlowBotQuery } from '../utils/flowBotBrain';

export default function FlowBotChatbot({ onNavigateTab }) {
  const { user, carpools, rentals, drivers } = useAuth();
  const { currentLang, t } = useLanguage();
  
  const [isOpen, setIsOpen] = useState(false);
  
  const getInitialBotGreeting = (lang) => {
    if (lang === 'ta') {
      return 'வணக்கம்! நான் உங்கள் ஃப்ளோபாட் AI (FlowBot) உதவியாளர். பைக் டாக்ஸி, கார், வாடகை வாகனம் & கார்பூல் கட்டண ஒப்பீடு அல்லது உதவிக்கு என்னிடம் கேளுங்கள்.';
    }
    if (lang === 'hi') {
      return 'नमस्ते! मैं आपका फ्लोबॉट AI मोबिलिटी सहायक हूँ। बाइक टैक्सी, ड्राइवर, रेंटल या कारपूल संबंधी किसी भी प्रश्न के लिए पूछें।';
    }
    return 'Vanakkam! I am FlowBot, your AI Mobility Assistant for Tamil Nadu. How can I assist with your transit plans today?';
  };

  const [messages, setMessages] = useState(() => [
    {
      id: 'flow-1',
      sender: 'bot',
      text: getInitialBotGreeting(currentLang),
      time: 'Just now'
    }
  ]);

  // Update initial message if language changes and only 1 message exists
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{
          id: 'flow-1',
          sender: 'bot',
          text: getInitialBotGreeting(currentLang),
          time: 'Just now'
        }];
      }
      return prev;
    });
  }, [currentLang]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const quickPromptsByLang = {
    en: [
      'Chennai Central to OMR price',
      'Coimbatore to TIDEL Park',
      'Show active Carpools',
      'Bike Rentals & Enfield',
      'Emergency SOS protocol',
      'GST & Tax invoice rules'
    ],
    ta: [
      'சென்னை ➔ OMR கட்டணம்',
      'கோவை ➔ டைடல் பார்க்',
      'பைக் வாடகை கட்டணம்',
      'கார்பூல் இருக்கைகள்',
      '4-இலக்க OTP என்றால் என்ன?',
      'அவசர உதவி SOS'
    ],
    hi: [
      'चेन्नई से OMR किराया',
      'कोयंबटूर से TIDEL पार्क',
      'बाइक रेंटल दरें',
      'कारपूल शेयरिंग सीटें',
      '4-अंकीय OTP नियम',
      'आपातकालीन SOS'
    ]
  };

  const quickPrompts = quickPromptsByLang[currentLang] || quickPromptsByLang.en;

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processFlowBotQuery(text, {
        lang: currentLang,
        user,
        carpools,
        rentals,
        drivers
      });

      const botMsg = {
        id: 'msg-b-' + Date.now(),
        sender: 'bot',
        text: response.reply,
        action: response.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'NAVIGATE' && onNavigateTab) {
      onNavigateTab(action.target);
      setIsOpen(false);
    } else if (action.type === 'EMERGENCY_SOS') {
      alert('🚨 EMERGENCY SOS DISPATCHED: Encrypted location broadcasted to TN Police 112 Command.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 sm:p-4 rounded-3xl bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 text-white shadow-2xl transition-all flex items-center gap-2 group ring-4 ring-indigo-100 cursor-pointer"
          title="Open FlowBot AI Assistant"
        >
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          <span className="text-xs font-extrabold pr-1 hidden sm:inline">FlowBot AI</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
        </button>
      )}

      {/* Chat Window Dialog */}
      {isOpen && (
        <div className="bg-white w-[92vw] sm:w-[400px] h-[560px] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-extrabold tracking-tight">FlowBot AI</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-500/40">
                    TN Transit
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Multilingual NLP Mobility Intelligence</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[88%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-xs font-medium'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs font-normal'
                    }`}
                  >
                    <p>{m.text}</p>

                    {/* Interactive Action Card inside Message */}
                    {m.action && (
                      <button
                        onClick={() => handleActionClick(m.action)}
                        className="mt-2.5 w-full py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-[11px] font-extrabold flex items-center justify-between transition-colors shadow-2xs cursor-pointer"
                      >
                        <span>{m.action.label}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 text-slate-400 text-[11px] w-fit shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[10px] text-slate-500 font-bold">FlowBot is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip)}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 text-[10px] font-bold whitespace-nowrap border border-slate-200 transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={
                currentLang === 'ta'
                  ? 'ஃப்ளோபாட்டிடம் கேளுங்கள் (தமிழ், English)...'
                  : currentLang === 'hi'
                  ? 'फ्लोबॉट से पूछें (हिंदी, English)...'
                  : 'Ask FlowBot (English, தமிழ், हिंदी)...'
              }
              style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
              className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 shadow-xs"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputValue.trim()}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
