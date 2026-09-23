import React, { useState } from 'react';
import {
  ShieldCheck,
  Link2,
  Copy,
  Check,
  Grid,
  Film,
  UserPlus,
  PhoneOff,
  Home,
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { VideoTile } from './VideoTile';
import { MeetingControls } from './MeetingControls';
import { ChatPanel } from './ChatPanel';
import { ParticipantsPanel } from './ParticipantsPanel';
import { VirtualCinemaRoom } from './VirtualCinemaRoom';
import { HostControlsModal } from './HostControlsModal';
import { WaitingRoomSettingsModal } from './WaitingRoomSettingsModal';
import { RecordingConsentModal } from './RecordingConsentModal';
import { InviteModal } from './InviteModal';

export const MeetingRoom: React.FC = () => {
  const {
    roomId,
    participants,
    isCinemaMode,
    setIsCinemaMode,
    isScreenSharing,
    screenStream,
    isRecording,
    leaveMeeting,
  } = useMeeting();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isHostControlsOpen, setIsHostControlsOpen] = useState(false);
  const [isWaitingRoomConfigOpen, setIsWaitingRoomConfigOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleQuickCopyLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Determine mobile-first grid layout
  const getGridClasses = (count: number) => {
    if (count <= 1) return 'grid-cols-1 max-w-2xl h-full';
    if (count === 2) return 'grid-cols-1 sm:grid-cols-2 max-w-4xl h-full';
    if (count <= 4) return 'grid-cols-2 max-w-4xl h-full';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-5xl h-full';
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 max-w-6xl h-full';
  };

  return (
    <div className="relative flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#0c0a09] text-amber-50 select-none">
      {/* Top Meeting Bar HUD (Red & Yellow Mobile Optimized) */}
      <div className="relative z-20 flex h-13 sm:h-14 items-center justify-between border-b border-amber-500/20 bg-[#140c08]/95 px-3 sm:px-4 backdrop-blur-md pt-safe">
        {/* Room Identification & Branding */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Voltar para Tela Inicial Button */}
          <button
            onClick={leaveMeeting}
            className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-2 sm:px-2.5 py-1 text-xs font-semibold text-red-200 hover:text-white hover:border-red-400 hover:bg-red-900/50 transition-all cursor-pointer shadow-xs"
            title="Voltar para a Tela Inicial (Sair da Conversa)"
          >
            <Home className="h-3.5 w-3.5 text-red-400" />
            <span className="hidden sm:inline">Início</span>
          </button>

          <div className="flex items-center gap-1.5 font-display text-sm sm:text-base font-black">
            <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Mia</span>
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">zoom</span>
            <span className="text-stone-600 font-normal">/</span>
            <span className="font-mono text-xs font-bold text-amber-400 truncate max-w-[85px] sm:max-w-none">
              {roomId}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
            <span>🍿 Sala de Conversas</span>
          </div>
        </div>

        {/* View Mode & Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher: Grade (Yellow) / Cinema (Red) */}
          <div className="flex rounded-xl bg-stone-900 border border-stone-800 p-0.5">
            <button
              onClick={() => setIsCinemaMode(false)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isCinemaMode
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Grade</span>
            </button>
            <button
              onClick={() => setIsCinemaMode(true)}
              className={`flex items-center gap-1 px-2 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isCinemaMode
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Film className="h-3.5 w-3.5 text-red-400" />
              <span className="hidden xs:inline">Cinema</span>
            </button>
          </div>

          {/* Quick Copy Link */}
          <button
            onClick={handleQuickCopyLink}
            title="Copiar Link da Sala de Amigos"
            className="flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-800/90 px-2 sm:px-2.5 py-1 text-xs font-medium text-stone-200 hover:border-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Link2 className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className="hidden sm:inline">{copiedLink ? 'Copiado' : 'Link'}</span>
          </button>

          {/* Invite Trigger */}
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:brightness-110 px-2.5 py-1 text-xs font-extrabold text-black transition-all cursor-pointer shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5 text-black" />
            <span className="hidden sm:inline">Convidar</span>
          </button>
        </div>
      </div>

      {/* Center Stage: Video Grid / Screen Share or Virtual Cinema Room */}
      <div className="relative flex flex-1 overflow-hidden">
        <main
          className={`relative flex flex-1 items-center justify-center overflow-hidden ${
            isCinemaMode ? 'p-0' : 'p-1.5 sm:p-3'
          }`}
        >
          {isCinemaMode ? (
            <VirtualCinemaRoom />
          ) : isScreenSharing && screenStream ? (
            /* Screen Share View */
            <div className="relative flex h-full w-full flex-col lg:flex-row gap-2">
              <div className="relative flex-1 rounded-2xl overflow-hidden border border-blue-500/30 bg-black shadow-2xl flex items-center justify-center">
                <video
                  autoPlay
                  playsInline
                  ref={(el) => {
                    if (el && screenStream) el.srcObject = screenStream;
                  }}
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-2.5 left-2.5 rounded-lg bg-black/80 px-2 py-0.5 text-[11px] font-semibold text-blue-400 backdrop-blur-sm border border-blue-500/20">
                  Compartilhando Tela
                </div>
              </div>

              {/* Side Participant Ribbon */}
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-y-auto lg:w-56 max-h-28 lg:max-h-none">
                {participants.map((p) => (
                  <div key={p.id} className="h-24 w-36 lg:w-full shrink-0">
                    <VideoTile participant={p} isCompact />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Standard Mobile Video Grid */
            <div className={`grid w-full gap-2 items-center justify-center p-1 ${getGridClasses(participants.length)}`}>
              {participants.map((p) => (
                <div key={p.id} className="h-full w-full min-h-[140px] max-h-[100%]">
                  <VideoTile participant={p} />
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Slide-in Mobile Drawer Panels */}
        <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <ParticipantsPanel
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          onOpenInvite={() => setIsInviteOpen(true)}
        />
      </div>

      {/* Meeting Controls HUD at bottom */}
      <MeetingControls
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        onToggleChat={() => {
          setIsChatOpen(!isChatOpen);
          if (isParticipantsOpen) setIsParticipantsOpen(false);
        }}
        onToggleParticipants={() => {
          setIsParticipantsOpen(!isParticipantsOpen);
          if (isChatOpen) setIsChatOpen(false);
        }}
        onOpenHostControls={() => setIsHostControlsOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
      />

      {/* Global In-Call Modals */}
      <HostControlsModal
        isOpen={isHostControlsOpen}
        onClose={() => setIsHostControlsOpen(false)}
        onOpenWaitingRoomConfig={() => setIsWaitingRoomConfigOpen(true)}
      />

      <WaitingRoomSettingsModal
        isOpen={isWaitingRoomConfigOpen}
        onClose={() => setIsWaitingRoomConfigOpen(false)}
      />

      <RecordingConsentModal />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};
