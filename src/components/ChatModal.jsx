import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Phone, 
  ShieldCheck, 
  Star, 
  Check, 
  CheckCheck, 
  Sparkles, 
  Smile, 
  MessageSquare,
  Car,
  Users
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ChatModal({ recipient, type = 'driver', onClose }) {
  const { currentThemeMeta } = useTheme();
  const [messages, setMessages] = useState(() => {
    const isDriver = type === 'driver';
    const isRental = type === 'rental';
    let greeting;
    if (isDriver) {
      greeting = `Vanakkam! This is Captain ${recipient?.name || 'your driver'}. I'm heading towards your pickup location in the ${recipient?.vehicleModel || 'car'}. AC is set to 22°C.`;
    } else if (isRental) {
      greeting = `Vanakkam! Thanks for your interest in the ${recipient?.vehicleModel || 'vehicle'}. It's sanitized, fully fueled, and ready for keyless pickup whenever you are.`;
    } else {
      greeting = `Vanakkam! Thanks for connecting for the carpool commute to ${recipient?.to || 'destination'}. Let me know if you need a corner pickup!`;
    }
    return [
      {
        id: 'msg-1',
        sender: 'recipient',
        text: greeting,
        time: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callAlert, setCallAlert] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const quickReplies = type === 'driver' 
    ? ["I'm at the main gate", "Running 2 mins late", "Near the toll plaza", "I have 2 bags of luggage"]
    : type === 'rental'
    ? ["Is this car still available?", "What's included in the price?", "Where do I pick it up?", "Can I extend the rental?"]
    : ["Is a seat still open?", "What time do you leave?", "Can you stop at the signal?", "Thanks, see you tomorrow morning!"];

  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const lower = text.toLowerCase();
    let replyText = "";

    if (type === 'driver') {
      if (lower.includes('where') || lower.includes('eta') || lower.includes('time') || lower.includes('far')) {
        replyText = `Just crossed the junction signal now, about 3 minutes away in the ${recipient?.vehicleModel || 'car'}!`;
      } else if (lower.includes('luggage') || lower.includes('bag') || lower.includes('trunk') || lower.includes('boot')) {
        replyText = "Yes, plenty of boot space in the car for your luggage and boxes.";
      } else if (lower.includes('late') || lower.includes('wait') || lower.includes('minute')) {
        replyText = "No problem! I have parked safely near the curb. Take your time.";
      } else if (lower.includes('gate') || lower.includes('here') || lower.includes('outside') || lower.includes('door')) {
        replyText = "Got it! Turning on hazard blinkers so you can easily spot the vehicle.";
      } else {
        replyText = "Sounds good! See you in just a couple of minutes.";
      }
    } else if (type === 'rental') {
      if (lower.includes('available') || lower.includes('still')) {
        replyText = 'Yes, it\'s available and reserved the moment you complete checkout.';
      } else if (lower.includes('include') || lower.includes('price') || lower.includes('cost')) {
        replyText = 'The price includes insurance, sanitization, and 24/7 roadside assistance.';
      } else if (lower.includes('pick') || lower.includes('location') || lower.includes('where')) {
        replyText = `Pickup is from ${recipient?.location || 'our hub location'} — I'll share exact GPS pin after booking.`;
      } else if (lower.includes('extend') || lower.includes('longer')) {
        replyText = 'Sure, you can extend directly from the app before your slot ends, subject to availability.';
      } else {
        replyText = 'Happy to help — let me know if you have any other questions before booking!';
      }
    } else {
      if (lower.includes('seat') || lower.includes('available') || lower.includes('join')) {
        replyText = `Yes, seats are confirmed for the ${recipient?.departureTime || 'morning'} commute. Looking forward to having you ride along!`;
      } else if (lower.includes('pick') || lower.includes('stop') || lower.includes('signal') || lower.includes('route')) {
        replyText = "Sure, I can easily pause right by the signal on the way. Just be there 5 mins prior.";
      } else if (lower.includes('time') || lower.includes('leave') || lower.includes('schedule')) {
        replyText = `We leave punctually at ${recipient?.departureTime || '08:30 AM'} from ${recipient?.from || 'pickup'}.`;
      } else {
        replyText = "Perfect! Looking forward to sharing the commute. Let me know if anything comes up.";
      }
    }

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: 'msg-' + Date.now() + 1,
          sender: 'recipient',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1200);
  };

  const triggerMockCall = () => {
    setCallAlert(true);
    setTimeout(() => setCallAlert(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[580px]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={recipient?.avatar || recipient?.hostAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={recipient?.name || recipient?.hostName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-200 bg-slate-100"
              />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 leading-tight">
                  {recipient?.name || recipient?.hostName || 'Captain Karthik'}
                </h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {type === 'driver' ? 'Driver Captain' : type === 'rental' ? 'Fleet Host' : 'Carpool Host'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {recipient?.vehicleModel || 'Innova Crysta'} • {recipient?.rating || recipient?.hostRating || 4.96} ⭐
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerMockCall}
              title="Voice Call"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border border-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mock Call Banner Notification */}
        {callAlert && (
          <div className="p-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs text-center font-bold animate-fade-in flex items-center justify-center gap-2">
            <Phone className="w-3.5 h-3.5 animate-bounce" />
            <span>Simulating secure in-app call to {recipient?.name || recipient?.hostName}...</span>
          </div>
        )}

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
          
          {/* Encryption Notice */}
          <div className="text-center my-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-slate-200 text-[10px] text-slate-500 font-bold shadow-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              End-to-end encrypted RideFlow conversation
            </span>
          </div>

          {messages.map((msg) => {
            const isMe = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  style={isMe ? { background: currentThemeMeta.accentHex, color: '#ffffff' } : {}}
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                    isMe
                      ? 'font-medium rounded-br-none shadow-xs'
                      : 'bg-white text-slate-900 rounded-bl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-slate-400">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck className="w-3 h-3 text-pink-600" />}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-600 italic bg-white px-3 py-1.5 rounded-full w-fit border border-slate-200 shadow-xs">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-[11px]">{recipient?.name || recipient?.hostName} is typing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {quickReplies.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold whitespace-nowrap transition-colors border border-slate-200"
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder={`Message ${recipient?.name || recipient?.hostName || 'captain'}...`}
            style={{ color: '#0f172a', backgroundColor: '#ffffff' }}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-pink-400 shadow-xs"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim()}
            style={{ background: currentThemeMeta.accentHex }}
            className="p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all font-bold shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
