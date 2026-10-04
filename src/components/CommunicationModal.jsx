import React from 'react';
import { 
  X, 
  MessageSquare, 
  Phone, 
  Mail, 
  ExternalLink, 
  Clock, 
  ShieldCheck, 
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function CommunicationModal({ isOpen, onClose }) {
  const { currentLang, t } = useLanguage();

  if (!isOpen) return null;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      currentLang === 'ta'
        ? 'வணக்கம் RideFlow! எனக்கு தமிழ்நாடு பயண முன்பதிவு மற்றும் வாகன உதவி தேவைப்படுகிறது.'
        : currentLang === 'hi'
        ? 'नमस्ते RideFlow! मुझे तमिलनाडु यात्रा बुकिंग और वाहन सहायता चाहिए।'
        : 'Hello RideFlow! I need assistance with travel booking and transit in Tamil Nadu.'
    );
    window.open(`https://wa.me/918072832066?text=${text}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = 'tel:+914425380000';
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('RideFlow Tamil Nadu Support & Booking Enquiry');
    const body = encodeURIComponent(
      'Location: Chennai / Coimbatore / Madurai / Trichy\nEnquiry Type: Booking / Driver / Carpool\n\n'
    );
    window.location.href = `mailto:rideflow2026@gmail.com?subject=${subject}&body=${body}`;
  };

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

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rickshaw/10 border border-rickshaw/20 text-rickshaw text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {currentLang === 'ta' ? '24x7 தமிழ்நாடு பயண உதவி' : currentLang === 'hi' ? '24x7 तमिलनाडु सहायता डेस्क' : '24x7 Tamil Nadu Transit Desk'}
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-asphalt dark:text-sand">
            {currentLang === 'ta' ? 'நேரடி தொடர்பு & உதவி' : currentLang === 'hi' ? 'सीधा संपर्क और सहायता' : 'Direct Transit Communication'}
          </h3>
          <p className="text-xs text-asphalt-muted dark:text-sand-dark leading-relaxed">
            {currentLang === 'ta'
              ? 'வாட்ஸ்அப், தொலைபேசி அல்லது மின்னஞ்சல் மூலம் சென்னை, கோவை, மதுரை ஆதரவுக் குழுவை உடனே தொடர்பு கொள்ளுங்கள்.'
              : currentLang === 'hi'
              ? 'व्हाट्सएप, फोन या ईमेल के माध्यम से चेन्नई, कोयंबटूर, मदुरै सहायता टीम से तुरंत संपर्क करें।'
              : 'Connect directly with our corridor dispatch desks across Chennai, Coimbatore, Madurai & Trichy.'}
          </p>
        </div>

        {/* Communication Channels */}
        <div className="space-y-3">
          
          {/* 1. WhatsApp Button */}
          <button
            onClick={handleWhatsApp}
            className="w-full p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/15 border border-[#25D366]/30 text-asphalt dark:text-sand flex items-center justify-between transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <MessageSquare className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[#128C7E] dark:text-[#25D366]">WhatsApp Support</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#25D366]/20 text-[#075E54] dark:text-[#25D366] font-bold">Fastest</span>
                </div>
                <p className="text-xs text-asphalt-muted dark:text-sand-dark mt-0.5">+91 80728 32066 • OMR & City Dispatch</p>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-asphalt-muted group-hover:text-asphalt dark:group-hover:text-sand transition-colors" />
          </button>

          {/* 2. Direct Phone Call */}
          <button
            onClick={handleCall}
            className="w-full p-4 rounded-2xl bg-rickshaw/10 hover:bg-rickshaw/15 border border-rickshaw/30 text-asphalt dark:text-sand flex items-center justify-between transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rickshaw text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-rickshaw">24x7 Transit Helpline</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-rickshaw/20 text-rickshaw font-bold">Toll Free</span>
                </div>
                <p className="text-xs text-asphalt-muted dark:text-sand-dark mt-0.5">044-2538-0000 / 1800-425-0001</p>
              </div>
            </div>
            <Phone className="w-4 h-4 text-rickshaw group-hover:scale-110 transition-transform" />
          </button>

          {/* 3. Official Email */}
          <button
            onClick={handleEmail}
            className="w-full p-4 rounded-2xl bg-marina/10 hover:bg-marina/15 border border-marina/30 text-asphalt dark:text-sand flex items-center justify-between transition-all group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-marina text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-marina dark:text-marina-light">Official Transit Desk</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-marina/20 text-marina dark:text-marina-light font-bold">Gmail</span>
                </div>
                <p className="text-xs text-asphalt-muted dark:text-sand-dark mt-0.5">rideflow2026@gmail.com</p>
              </div>
            </div>
            <Mail className="w-4 h-4 text-marina dark:text-marina-light group-hover:scale-110 transition-transform" />
          </button>

        </div>

        {/* Corridor Hubs Footer */}
        <div className="pt-3 border-t border-sand-border dark:border-asphalt-border flex items-center justify-between text-[11px] text-asphalt-muted dark:text-sand-dark">
          <span className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-rickshaw" />
            Chennai • Coimbatore • Madurai • Trichy
          </span>
          <span className="flex items-center gap-1 font-bold text-marina dark:text-marina-light">
            <Clock className="w-3 h-3" />
            Live Ops
          </span>
        </div>

      </div>
    </div>
  );
}
