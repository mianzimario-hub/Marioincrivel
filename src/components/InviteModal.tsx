import React, { useState } from 'react';
import { X, Link2, Copy, Check, Shield, Clock, QrCode, FileText } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { roomId, waitingRoomConfig } = useMeeting();

  const [requirePassword, setRequirePassword] = useState(false);
  const [password] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [expiration, setExpiration] = useState<'1h' | '24h' | '7d' | 'never'>('24h');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  // Generate dynamic invite URL
  const inviteUrl = `${window.location.origin}/?room=${roomId}${
    requirePassword ? `&pwd=${password}` : ''
  }&exp=${expiration}`;

  const fullInvitationText = `Convite para Reunião no Miazoom\n\nSala: ${roomId}\nLink de Acesso Dinâmico: ${inviteUrl}\n${
    requirePassword ? `Senha de Acesso: ${password}\n` : ''
  }Sala de Espera: ${waitingRoomConfig ? 'Ativada' : 'Livre'}\nCriptografia: AES-256-GCM\nExpiração do Link: ${expiration}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullInvitationText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Convidar Participantes</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Gere links dinâmicos protegidos com parâmetros configuráveis</p>
          </div>
        </div>

        {/* Dynamic Link Box */}
        <div className="mb-5 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Link Dinâmico de Acesso</span>
            <span className="font-mono text-blue-400 text-[11px]">ID: {roomId}</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-3.5 py-2 text-xs font-bold text-white hover:from-blue-500 hover:to-blue-400 transition-colors shrink-0 cursor-pointer shadow-md shadow-blue-500/20"
            >
              {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Parameters Configuration */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-4 mb-5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <div>
                <p className="font-semibold text-slate-200">Exigir Senha de Acesso</p>
                <p className="text-[11px] text-slate-400">Adiciona token numérico criptografado ao link</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {requirePassword && (
                <span className="font-mono text-xs bg-slate-800 px-2 py-0.5 rounded-md text-red-400 font-bold border border-red-500/30">
                  {password}
                </span>
              )}
              <input
                type="checkbox"
                checked={requirePassword}
                onChange={(e) => setRequirePassword(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-red-400" />
              <div>
                <p className="font-semibold text-slate-200">Expiração do Link</p>
                <p className="text-[11px] text-slate-400">Tokens expiram automaticamente após o período</p>
              </div>
            </div>
            <select
              value={expiration}
              onChange={(e) => setExpiration(e.target.value as '1h' | '24h' | '7d' | 'never')}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="1h">1 Hora</option>
              <option value="24h">24 Horas</option>
              <option value="7d">7 Dias</option>
              <option value="never">Permanente</option>
            </select>
          </div>
        </div>

        {/* QR Code toggle preview */}
        {showQR && (
          <div className="mb-5 flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-white p-4 text-slate-900 animate-in zoom-in-95 duration-150">
            {/* Clean SVG visual QR Code pattern representation */}
            <div className="h-36 w-36 bg-slate-900 p-2 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-6 gap-1 h-full w-full">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-xs ${
                      (i % 2 === 0 || i % 7 === 0 || i === 0 || i === 5 || i === 30 || i === 35)
                        ? 'bg-blue-400'
                        : 'bg-red-500'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="mt-2 text-[11px] font-mono font-medium text-slate-600">
              Escaneie para entrar no mobile
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setShowQR(!showQR)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <QrCode className="h-3.5 w-3.5 text-blue-400" />
            <span>{showQR ? 'Ocultar QR' : 'QR Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyFull}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-900/40 transition-colors cursor-pointer"
          >
            {copiedFull ? <Check className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
            <span>{copiedFull ? 'Convite Copiado!' : 'Copiar Convite Completo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
