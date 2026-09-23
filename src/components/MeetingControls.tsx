import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share2,
  Users,
  MessageSquare,
  Film,
  Disc,
  StopCircle,
  Hand,
  Shield,
  PhoneOff,
  Image as ImageIcon,
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { formatDuration } from '../utils/cryptoSim';

interface Props {
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onOpenHostControls: () => void;
  onOpenInvite: () => void;
  isChatOpen: boolean;
  isParticipantsOpen: boolean;
}

export const MeetingControls: React.FC<Props> = ({
  onToggleChat,
  onToggleParticipants,
  onOpenHostControls,
  isChatOpen,
  isParticipantsOpen,
}) => {
  const {
    isMuted,
    isVideoOff,
    isHandRaised,
    isScreenSharing,
    isCinemaMode,
    isRecording,
    recordingDurationSeconds,
    waitingParticipants,
    participants,
    isHost,
    virtualBackground,
    toggleMute,
    toggleVideo,
    toggleHandRaise,
    toggleScreenShare,
    setIsCinemaMode,
    requestStartRecording,
    stopRecording,
    leaveMeeting,
    setVirtualBackground,
  } = useMeeting();

  const [showBgPicker, setShowBgPicker] = useState(false);

  return (
    <div className="relative z-30 flex items-center justify-between border-t border-slate-800/90 bg-[#070b18]/95 px-2.5 sm:px-4 py-2 sm:py-3 backdrop-blur-md pb-safe">
      {/* Left zone: Meeting info / Recording Status */}
      <div className="flex items-center gap-2">
        {isRecording ? (
          <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-950/40 px-2.5 py-1 text-xs text-red-300">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-rec-pulse" />
            <span className="font-extrabold tracking-wider text-[10px] sm:text-xs text-red-400">REC</span>
            <span className="font-mono text-white text-[10px] sm:text-xs">
              {formatDuration(recordingDurationSeconds)}
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Seguro</span>
          </div>
        )}
      </div>

      {/* Center Zone: Core AV and Mode Switches */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Mic Toggle (Red when muted, Blue-accented when active) */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Ativar Microfone' : 'Silenciar'}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isMuted
              ? 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30'
              : 'bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20'
          }`}
        >
          {isMuted ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>

        {/* Video Toggle (Red when off, Blue-accented when active) */}
        <button
          onClick={toggleVideo}
          title={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isVideoOff
              ? 'bg-red-600 text-white hover:bg-red-500 shadow-md shadow-red-600/30'
              : 'bg-blue-600/10 text-blue-400 border border-blue-500/30 hover:bg-blue-600/20'
          }`}
        >
          {isVideoOff ? <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Video className="h-4 w-4 sm:h-5 sm:w-5" />}
        </button>

        {/* Virtual Background Picker (Hidden on extra small screens to save room) */}
        <div className="relative hidden xs:block">
          <button
            onClick={() => setShowBgPicker(!showBgPicker)}
            title="Plano de Fundo Virtual"
            className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
              virtualBackground !== 'none'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          {showBgPicker && (
            <div className="absolute bottom-13 left-1/2 -translate-x-1/2 w-48 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl z-40 text-xs space-y-1">
              <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Fundo Virtual
              </span>
              <button
                onClick={() => {
                  setVirtualBackground('none');
                  setShowBgPicker(false);
                }}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  virtualBackground === 'none' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Padrão
              </button>
              <button
                onClick={() => {
                  setVirtualBackground('blur');
                  setShowBgPicker(false);
                }}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  virtualBackground === 'blur' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Desfoque
              </button>
              <button
                onClick={() => {
                  setVirtualBackground('studio');
                  setShowBgPicker(false);
                }}
                className={`w-full rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  virtualBackground === 'studio' ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                Escritório
              </button>
            </div>
          )}
        </div>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Parar Compartilhamento' : 'Compartilhar Tela'}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isScreenSharing
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* Virtual Cinema Room Mode Switch in Red & Blue */}
        <button
          onClick={() => setIsCinemaMode(!isCinemaMode)}
          title={isCinemaMode ? 'Voltar para Grade' : 'Sala de Cinema Virtual'}
          className={`flex h-10 sm:h-11 items-center gap-1.5 rounded-xl px-2.5 sm:px-3.5 transition-all cursor-pointer font-bold text-xs ${
            isCinemaMode
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-600/30'
              : 'bg-gradient-to-r from-red-600/20 to-blue-600/20 text-white border border-red-500/30 hover:border-blue-500/50'
          }`}
        >
          <Film className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
          <span className="hidden md:inline">
            {isCinemaMode ? 'Grade' : 'Cinema'}
          </span>
        </button>

        {/* Cloud Recording Toggle */}
        {isRecording ? (
          <button
            onClick={stopRecording}
            title="Parar Gravação"
            className="flex h-10 sm:h-11 items-center gap-1 rounded-xl bg-red-600 hover:bg-red-500 px-2.5 sm:px-3 text-xs font-bold text-white shadow-md shadow-red-600/30 transition-all cursor-pointer"
          >
            <StopCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden lg:inline">Parar REC</span>
          </button>
        ) : (
          <button
            onClick={requestStartRecording}
            title="Gravar na Nuvem"
            className="flex h-10 sm:h-11 items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2 sm:px-3 text-xs font-semibold text-slate-200 border border-slate-700 transition-all cursor-pointer"
          >
            <Disc className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
            <span className="hidden lg:inline">Gravar</span>
          </button>
        )}

        {/* Raise Hand */}
        <button
          onClick={toggleHandRaise}
          title={isHandRaised ? 'Abaixar Mão' : 'Levantar Mão'}
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isHandRaised
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Hand className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {/* Right Zone: Host, Panels & End Call */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Host Controls */}
        {isHost && (
          <button
            onClick={onOpenHostControls}
            title="Painel do Anfitrião"
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-slate-800 text-blue-400 hover:bg-slate-700 border border-blue-500/30 transition-all cursor-pointer"
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        )}

        {/* Participants Button */}
        <button
          onClick={onToggleParticipants}
          title="Participantes"
          className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isParticipantsOpen
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          {waitingParticipants.length > 0 && isHost ? (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-600 text-white font-extrabold text-[9px] sm:text-[10px] animate-bounce">
              {waitingParticipants.length}
            </span>
          ) : (
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-slate-700 text-white font-bold text-[8px] sm:text-[9px]">
              {participants.length}
            </span>
          )}
        </button>

        {/* Chat Button */}
        <button
          onClick={onToggleChat}
          title="Chat da Sala"
          className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl transition-all cursor-pointer ${
            isChatOpen
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        {/* End Call Button (Bold Red) */}
        <button
          onClick={leaveMeeting}
          title="Sair da Chamada"
          className="flex h-10 sm:h-11 items-center gap-1 sm:gap-1.5 rounded-xl bg-red-600 px-3 sm:px-4 text-xs font-bold text-white hover:bg-red-500 transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
        >
          <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  );
};
