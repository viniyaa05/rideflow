import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  Clock, 
  Key, 
  Lock, 
  Sparkles, 
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStoredJWT, decodeJWT } from '../utils/jwtAuth';

export default function TokenInspectorModal({ onClose }) {
  const { user, jwtToken } = useAuth();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedBearer, setCopiedBearer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86400);

  const decoded = decodeJWT(jwtToken);

  useEffect(() => {
    if (!decoded?.payload?.exp) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      setTimeLeft(Math.max(0, decoded.payload.exp - now));
    }, 1000);
    return () => clearInterval(interval);
  }, [decoded]);

  const formatCountdown = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs}h ${mins}m ${s}s`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedBearer(true);
      setTimeout(() => setCopiedBearer(false), 2000);
    }
  };

  if (!jwtToken) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">No Active JWT Token</h3>
          </div>
          <p className="text-xs text-slate-600">Please sign in with any account to generate a cryptographic JWT Bearer token.</p>
          <button onClick={onClose} className="w-full py-2 bg-slate-100 font-bold rounded-xl text-xs">Close</button>
        </div>
      </div>
    );
  }

  const parts = jwtToken.split('.');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 tracking-tight">JSON Web Token (JWT) Inspector</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                  HS256 Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Standard RFC 7519 Cryptographic Token Verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Live Expiration Timer Banner */}
          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
              <span className="font-bold text-purple-950">Active Token TTL:</span>
              <span className="font-mono font-extrabold text-purple-700 departure-digit text-sm">
                {formatCountdown(timeLeft)}
              </span>
            </div>
            <span className="text-[10px] text-purple-700 font-bold bg-white px-2 py-1 rounded-lg border border-purple-200">
              Role: {decoded?.payload?.role || 'RIDER'}
            </span>
          </div>

          {/* Color-Coded Encoded Token String */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Raw Encoded Compact Serialization (Header.Payload.Signature)
              </span>
              <button
                onClick={() => copyToClipboard(jwtToken, 'token')}
                className="flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:text-purple-900"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? 'Copied Token!' : 'Copy Token'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 font-mono text-[11px] break-all leading-relaxed select-all">
              <span className="text-rose-400 font-bold">{parts[0]}</span>
              <span className="text-slate-400">.</span>
              <span className="text-purple-400 font-bold">{parts[1]}</span>
              <span className="text-slate-400">.</span>
              <span className="text-cyan-400 font-bold">{parts[2]}</span>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] text-slate-500 font-medium">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400" /> Header (Algorithm)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400" /> Payload (Claims)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> HMAC Signature</span>
            </div>
          </div>

          {/* Decoded Claims Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Header Claims */}
            <div className="space-y-1.5">
              <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" />
                Decoded Header
              </span>
              <pre className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 text-rose-950 font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(decoded?.header, null, 2)}
              </pre>
            </div>

            {/* Payload Claims */}
            <div className="space-y-1.5">
              <span className="font-bold text-purple-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Decoded Payload Claims
              </span>
              <pre className="p-3 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950 font-mono text-[11px] overflow-x-auto max-h-48">
                {JSON.stringify(decoded?.payload, null, 2)}
              </pre>
            </div>

          </div>

          {/* Bearer Header Snippet */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">HTTP Authorization Header</span>
              <code className="text-[11px] font-mono font-bold text-slate-800 truncate block">
                Authorization: Bearer {jwtToken.slice(0, 32)}...
              </code>
            </div>

            <button
              onClick={() => copyToClipboard(`Authorization: Bearer ${jwtToken}`, 'bearer')}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 flex-shrink-0 transition-colors shadow-2xs"
            >
              {copiedBearer ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedBearer ? 'Copied' : 'Copy Header'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
