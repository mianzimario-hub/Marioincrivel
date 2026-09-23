import React from 'react';
import { ShieldAlert, Lock, CheckCircle, LogOut } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

export const RecordingConsentModal: React.FC = () => {
  const {
    recordingPromptOpen,
    recordingPromptData,
    confirmConsentAndStartRecording,
    leaveMeeting,
    dismissRecordingPrompt,
    isHost,
  } = useMeeting();

  if (!recordingPromptOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0f0c16] p-5 sm:p-6 shadow-2xl text-slate-100 ring-1 ring-red-500/20">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 animate-pulse">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              Notificação de Privacidade
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">
              Gravação em Nuvem Solicitada
            </h3>
          </div>
        </div>

        <div className="mb-5 space-y-3 text-xs sm:text-sm text-slate-300">
          <p className="leading-relaxed">
            <strong className="text-white">{recordingPromptData?.hostName || 'O anfitrião'}</strong>{' '}
            está iniciando a gravação desta sessão do Miazoom.
          </p>

          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-400">
              <Lock className="h-4 w-4 shrink-0" />
              <span className="font-semibold">Criptografia AES-256-GCM Ativa</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              O fluxo de vídeo, áudio e tela é gravado diretamente na nuvem sob chave criptográfica
              zero-knowledge. Todos os participantes recebem notificação de conformidade.
            </p>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400">
            Ao clicar em &quot;Consentir e Continuar&quot;, você autoriza o registro da sua
            participação na ata audiovisual desta conferência.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={leaveMeeting}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Recusar e Sair</span>
          </button>

          <button
            type="button"
            onClick={isHost ? confirmConsentAndStartRecording : dismissRecordingPrompt}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-600/20 hover:from-red-500 hover:to-blue-500 transition-all cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Consentir e Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
