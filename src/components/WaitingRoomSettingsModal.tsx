import React, { useState } from 'react';
import { X, Sliders, Music, ShieldCheck, Check } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitingRoomSettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { waitingRoomConfig, updateWaitingRoomConfig } = useMeeting();

  const [message, setMessage] = useState(waitingRoomConfig.welcomeMessage);
  const [ambientSound, setAmbientSound] = useState(waitingRoomConfig.ambientSound);
  const [brandName, setBrandName] = useState(waitingRoomConfig.brandName);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateWaitingRoomConfig({
      welcomeMessage: message,
      ambientSound,
      brandName,
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Personalizar Sala de Espera</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Configure a experiência dos participantes antes da admissão</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Nome da Organização / Evento
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ex: Miazoom Enterprise / Reunião Estratégica"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mensagem de Boas-Vindas aos Convidados
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem exibida na tela de espera..."
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none resize-none"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">Música de Espera Relaxante</p>
                  <p className="text-[11px] text-slate-400">Toca acordes sintetizados suaves em harmonia Cmaj7</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={ambientSound}
                onChange={(e) => setAmbientSound(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-200">Aviso de Segurança e Gravação</p>
                  <p className="text-[11px] text-slate-400">Exibir certificação AES-256 e aviso de privacidade</p>
                </div>
              </div>
              <span className="text-[11px] text-blue-400 font-bold">Ativado</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:from-red-500 hover:to-blue-500 transition-all cursor-pointer"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-white" />
                  <span>Salvo com sucesso!</span>
                </>
              ) : (
                <span>Salvar Configurações</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
