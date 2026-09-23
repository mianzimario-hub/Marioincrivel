import React, { useRef, useEffect } from 'react';
import { MicOff, Shield, Hand } from 'lucide-react';
import { Participant } from '../types/meeting';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  participant: Participant;
  isCompact?: boolean;
}

export const VideoTile: React.FC<Props> = ({ participant, isCompact = false }) => {
  const { localStream, screenStream, virtualBackground } = useMeeting();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isLocal = participant.name.includes('(Você)');
  const isScreen = participant.isScreenSharing;

  useEffect(() => {
    if (!videoRef.current) return;

    if (isLocal) {
      if (isScreen && screenStream) {
        videoRef.current.srcObject = screenStream;
      } else if (!participant.isVideoOff && localStream) {
        videoRef.current.srcObject = localStream;
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [isLocal, isScreen, participant.isVideoOff, localStream, screenStream]);

  return (
    <div
      className={`group relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border border-slate-800/90 bg-[#070b18] shadow-lg transition-all ${
        participant.isSpeaking ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20' : ''
      }`}
    >
      {/* Background Studio option if chosen */}
      {isLocal && virtualBackground === 'studio' && !participant.isVideoOff && (
        <img
          src="/src/assets/images/studio_bg_1790190854143.jpg"
          alt="Virtual Studio Background"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover filter blur-[1px] opacity-40"
        />
      )}

      {/* Video stream if active */}
      {!participant.isVideoOff && (isLocal ? !!localStream : true) ? (
        <div className="relative h-full w-full overflow-hidden flex items-center justify-center">
          {isLocal ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover ${
                isScreen ? '' : '-scale-x-100'
              } ${virtualBackground === 'blur' ? 'backdrop-blur-md' : ''}`}
            />
          ) : (
            // Simulated / Remote Peer Video with subtle animated camera frame or backdrop
            <div className="relative h-full w-full">
              <img
                src={participant.avatar}
                alt={participant.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
            </div>
          )}
        </div>
      ) : (
        /* Video Off Avatar State */
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <div className="relative">
            <img
              src={participant.avatar}
              alt={participant.name}
              referrerPolicy="no-referrer"
              className={`rounded-full object-cover ring-2 ring-slate-700 shadow-md ${
                isCompact ? 'h-12 w-12' : 'h-20 w-20 md:h-24 md:w-24'
              }`}
            />
            {participant.isSpeaking && (
              <span className="absolute inset-0 rounded-full ring-4 ring-cyan-400/60 animate-ping" />
            )}
          </div>
          {!isCompact && (
            <p className="mt-3 text-xs font-semibold text-slate-300 truncate max-w-[160px]">
              {participant.name}
            </p>
          )}
        </div>
      )}

      {/* Hand Raised Badge */}
      {participant.isHandRaised && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-md bg-amber-500/90 px-2 py-1 text-[10px] font-bold text-slate-950 shadow-md animate-bounce">
          <Hand className="h-3 w-3" />
          <span>Mão Levantada</span>
        </div>
      )}

      {/* Host Badge */}
      {participant.isHost && (
        <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-blue-600/90 border border-blue-400/30 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-md backdrop-blur-xs">
          <Shield className="h-2.5 w-2.5" />
          <span>Anfitrião</span>
        </div>
      )}

      {/* Bottom Name & Mute HUD */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 rounded-lg bg-black/75 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-200 backdrop-blur-sm truncate max-w-[75%] border border-slate-700/50">
          <span className="truncate">{participant.name}</span>
          {participant.isSpeaking && (
            <span className="flex h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-1">
          {participant.isMuted && (
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-600 text-white shadow-md">
              <MicOff className="h-3 w-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
