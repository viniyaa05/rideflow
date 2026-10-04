import React from 'react';
import { 
  X, 
  Palette, 
  Sun, 
  Moon, 
  Globe, 
  Check, 
  Sliders, 
  Sparkles 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function SettingsModal({ isOpen, onClose }) {
  const { mode, isDark, toggleTheme, theme, setTheme, themes, currentThemeMeta, palette } = useTheme();
  const { currentLang, changeLanguage, languages, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-asphalt/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-sand-card dark:bg-asphalt-card border border-sand-border dark:border-asphalt-border shadow-2xl p-6 sm:p-7 relative space-y-6 text-asphalt dark:text-sand">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-sand/70 dark:bg-asphalt text-asphalt/70 dark:text-sand/70 hover:text-asphalt dark:hover:text-sand border border-sand-border dark:border-asphalt-border transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rickshaw/10 border border-rickshaw/20 text-rickshaw text-[11px] font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>{currentLang === 'ta' ? 'அமைப்புகள்' : currentLang === 'hi' ? 'सेटिंग्स' : 'Settings'}</span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-asphalt dark:text-sand">
            {currentLang === 'ta' ? 'வண்ணம், தீம் & மொழி' : currentLang === 'hi' ? 'थीम, पैलेट और भाषा' : 'Theme, Palette & Language'}
          </h3>
          <p className="text-xs text-asphalt-muted dark:text-sand-dark">
            {currentLang === 'ta'
              ? 'தமிழ்நாடு போக்குவரத்து இடைமுகத்தை உங்கள் விருப்பத்திற்கு ஏற்ப மாற்றி அமைக்கவும்.'
              : currentLang === 'hi'
              ? 'तमिलनाडु मोबिलिटी इंटरफ़ेस को अपनी पसंद के अनुसार अनुकूलित करें।'
              : 'Customize the Tamil Nadu mobility interface to your exact preference.'}
          </p>
        </div>

        {/* 1. Theme Mode: Dark vs Light */}
        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-asphalt-muted dark:text-sand-dark">
            {currentLang === 'ta' ? 'காட்சி பயன்முறை (Dark / Light)' : currentLang === 'hi' ? 'मोड (डार्क / लाइट)' : 'Display Theme'}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                if (isDark) toggleTheme();
              }}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                !isDark 
                  ? 'bg-sand border-rickshaw text-rickshaw shadow-sm font-black' 
                  : 'bg-sand/30 dark:bg-asphalt border-sand-border dark:border-asphalt-border text-asphalt-muted dark:text-sand-dark'
              }`}
            >
              <Sun className="w-4 h-4 text-rickshaw" />
              <span>{currentLang === 'ta' ? 'பகல் (Sand Paper)' : 'Day (Sand Paper)'}</span>
              {!isDark && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>

            <button
              onClick={() => {
                if (!isDark) toggleTheme();
              }}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 text-xs font-bold transition-all cursor-pointer ${
                isDark 
                  ? 'bg-asphalt border-rickshaw text-rickshaw shadow-sm font-black' 
                  : 'bg-sand/30 dark:bg-asphalt border-sand-border dark:border-asphalt-border text-asphalt-muted dark:text-sand-dark'
              }`}
            >
              <Moon className="w-4 h-4 text-temple" />
              <span>{currentLang === 'ta' ? 'இரவு (Asphalt Night)' : 'Night (Asphalt)'}</span>
              {isDark && <Check className="w-3.5 h-3.5 ml-auto" />}
            </button>
          </div>
        </div>

        {/* 2. Color Palette Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-asphalt-muted dark:text-sand-dark">
            {currentLang === 'ta' ? 'வண்ண தட்டு (Color Palette)' : currentLang === 'hi' ? 'रंग पैलेट' : 'Color Palette Preset'}
          </label>
          <div className="space-y-2">
            {themes.map((tItem) => {
              const isSelected = theme === tItem.id;
              return (
                <button
                  key={tItem.id}
                  onClick={() => setTheme(tItem.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sand/80 dark:bg-asphalt border-rickshaw shadow-xs ring-1 ring-rickshaw/30'
                      : 'bg-sand/30 dark:bg-asphalt/60 border-sand-border dark:border-asphalt-border hover:bg-sand/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-1">
                      {tItem.colors.map((c, i) => (
                        <span 
                          key={i} 
                          className="w-4 h-4 rounded-full border border-white dark:border-asphalt shadow-xs" 
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-asphalt dark:text-sand">{tItem.name}</h4>
                      <p className="text-[11px] text-asphalt-muted dark:text-sand-dark">{tItem.tagline}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-rickshaw flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Language Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-black uppercase tracking-wider text-asphalt-muted dark:text-sand-dark">
            {currentLang === 'ta' ? 'மொழி (Language)' : currentLang === 'hi' ? 'भाषा' : 'Language'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {languages.map((l) => {
              const isCurrent = currentLang === l.code;
              return (
                <button
                  key={l.code}
                  onClick={() => changeLanguage(l.code)}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-rickshaw text-white border-rickshaw font-black shadow-xs'
                      : 'bg-sand/50 dark:bg-asphalt border-sand-border dark:border-asphalt-border text-asphalt dark:text-sand hover:bg-sand'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
