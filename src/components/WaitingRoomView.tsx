import React, { useEffect, useState, useRef } from 'react';
import { Music, Volume2, VolumeX, Mic, MicOff, Video, VideoOff, Home, ArrowLeft, Smile } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';
import { ambientPlayer } from '../utils/audioSynth';

export const WaitingRoomView: React.FC = () => {
  const { waitingRoomConfig, roomId, leaveMeeting, localStream, isMuted, isVideoOff, toggleMute, toggleVideo } = useMeeting();
  const { currentUser } = useAuth();

  const [musicActive, setMusicActive] = useState(waitingRoomConfig.ambientSound);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (musicActive) {
      ambientPlayer.start();
    } else {
      ambientPlayer.stop();
    }
    return () => {
      ambientPlayer.stop();
    };
  }, [musicActive]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0c0a09] p-3 sm:p-4 text-amber-50">
      {/* Background ambient dual lighting in red and yellow */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-[400px] w-[400px] rounded-full bg-red-600/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[400px] w-[400px] rounded-full bg-amber-500/15 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-[#140d0a]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        {/* Top Voltar ao Início Bar */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={leaveMeeting}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-red-400 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-stone-800/60"
            title="Voltar para a tela inicial"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar à Tela Inicial</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span>Sala:</span>
            <span className="font-mono text-amber-400 font-bold">{roomId}</span>
          </div>
        </div>

        {/* Brand Bar in Red & Yellow */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-black">
              <Smile className="h-4 w-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white font-display">
              Miazoom • Lounge de Espera
            </span>
          </div>
        </div>

        {/* Content & Welcome Message */}
        <div className="my-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs text-amber-300 mb-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>Aguardando a galera liberar a entrada</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display mb-2">
            Quase lá! Prepare o som e a pipoca 🍿
          </h2>

          <p className="text-xs sm:text-sm text-amber-100/80 leading-relaxed bg-stone-900/70 p-3 rounded-xl border border-amber-500/20">
            {waitingRoomConfig.welcomeMessage || 'Fique à vontade! Enquanto a chamada não começa, aproveite a trilha sonora e ajuste seu microfone e câmera.'}
          </p>
        </div>

        {/* Guest Pre-call AV check */}
        <div className="rounded-xl border border-amber-500/20 bg-stone-900/60 p-3.5 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-200/80">
              Teste de Câmera & Microfone
            </span>
            <span className="text-[11px] text-amber-400 font-semibold">{currentUser?.name}</span>
          </div>

          <div className="relative mx-auto h-40 sm:h-44 w-full overflow-hidden rounded-xl bg-black border border-stone-800 flex items-center justify-center">
            {!isVideoOff && localStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-500">
                <VideoOff className="h-7 w-7 text-red-400" />
                <span className="text-xs">Sua câmera está desativada</span>
              </div>
            )}

            {/* Quick in-preview toggles in Red & Yellow */}
            <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-black/80 px-3 py-1.5 backdrop-blur-sm border border-stone-700/60">
              <button
                onClick={toggleMute}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                  isMuted ? 'bg-red-600 text-white shadow-md' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                  isVideoOff ? 'bg-red-600 text-white shadow-md' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Ambient music switch & Leave button */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <button
            onClick={() => setMusicActive(!musicActive)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-stone-900/80 px-3 py-2 text-xs font-semibold text-amber-200 hover:border-amber-400 transition-colors cursor-pointer"
          >
            <Music className="h-3.5 w-3.5 text-amber-400" />
            <span>Música:</span>
            {musicActive ? (
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Volume2 className="h-3.5 w-3.5" /> Tocando
              </span>
            ) : (
              <span className="flex items-center gap-1 text-stone-500">
                <VolumeX className="h-3.5 w-3.5" /> Mudo
              </span>
            )}
          </button>

          <button
            onClick={leaveMeeting}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/30 px-3.5 py-2 text-xs font-bold text-red-300 hover:bg-red-900/50 hover:text-white transition-colors cursor-pointer"
            title="Sair da sala de espera e retornar à tela inicial"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Voltar à Tela Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};
