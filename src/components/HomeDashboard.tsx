import React, { useState } from 'react';
import {
  Video,
  Film,
  HardDrive,
  ArrowRight,
  Sparkles,
  Share2,
  Play,
  Clock,
  Plus,
  LogIn,
  UserCog,
  UserPlus,
  Smile,
  Music,
  Tv,
  MessageSquare,
  PartyPopper,
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';
import { formatDuration, formatBytes } from '../utils/cryptoSim';

interface Props {
  onOpenRecordings: () => void;
  onOpenCinemaPreview: () => void;
  onOpenAndroidModal?: () => void;
}

export const HomeDashboard: React.FC<Props> = ({
  onOpenRecordings,
  onOpenCinemaPreview,
}) => {
  const { startMeeting, joinMeeting, cloudRecordings } = useMeeting();
  const { currentUser, openAuthModal, openProfileModal } = useAuth();
  const [joinInput, setJoinInput] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInput.trim()) return;
    let target = joinInput.trim();
    if (target.includes('room=')) {
      const match = target.match(/room=([^&]+)/);
      if (match) target = match[1];
    }
    joinMeeting(target);
  };

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
      {/* Profile & User Status Quick Bar (Red & Yellow) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/25 bg-[#140d0a]/90 p-3 sm:px-4 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative group shrink-0">
            <img
              src={currentUser?.avatar || '/src/assets/images/avatar_ana_1790190833213.jpg'}
              alt={currentUser?.name || 'Perfil'}
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-amber-400 shadow-md shadow-amber-500/20"
            />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-tr from-red-600 to-amber-500 text-[11px] ring-2 ring-[#140d0a]">
              <span>{currentUser?.statusEmoji || '🍿'}</span>
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {currentUser ? currentUser.name : 'Visitante'}
              </span>
              {currentUser?.statusEmoji && (
                <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-bold text-amber-300 shrink-0">
                  {currentUser.statusEmoji} Resenha
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-200/70 truncate">
              {currentUser?.bio || 'Pronto para bater papo e curtir vídeos!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {currentUser ? (
            <button
              onClick={openProfileModal}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 hover:text-white transition-all cursor-pointer shadow-xs"
              title="Abrir área de edição de perfil"
            >
              <UserCog className="h-3.5 w-3.5" />
              <span>Editar Perfil</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-600/30 hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Criar Perfil</span>
              </button>
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/25 hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Entrar</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile-First Hero Card in Red & Yellow */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#1c0f0a]/95 via-[#140b08]/90 to-[#0c0806] p-4 sm:p-8 md:p-10 shadow-2xl">
        {/* Ambient dual glows (Crimson Red + Golden Yellow) */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-amber-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-red-600/20 blur-[100px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Main Action Block */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-amber-200">Bate-Papo, Cinema & Diversão ao Vivo</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.2]">
              Junte a galera para curtir no{' '}
              <span className="bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Miazoom
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-amber-100/80 max-w-xl leading-relaxed">
              Videochamadas para bater papo, assistir a filmes e vídeos sincronizados com amigos,
              trocar reações com pipoca e curtir um som juntos no celular ou tablet.
            </p>

            {/* Mobile-optimized Action Rows */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
              <button
                onClick={() => startMeeting()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 px-5 py-3.5 text-sm font-extrabold text-black shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all active:scale-98 cursor-pointer shrink-0"
              >
                <Plus className="h-5 w-5" />
                <span>Iniciar Sala de Conversa</span>
              </button>

              <form onSubmit={handleJoin} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Código da sala de amigos..."
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="flex-1 min-w-0 rounded-xl border border-stone-700 bg-stone-900/90 px-3.5 py-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!joinInput.trim()}
                  className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-3 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all disabled:opacity-40 cursor-pointer"
                >
                  Entrar
                </button>
              </form>
            </div>

            {/* Fun Chips */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs text-amber-200/70 pt-1">
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <span>🍿</span>
                <span>Cinema Sincronizado</span>
              </span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-amber-200">💬 Bate-Papo & Resenha</span>
              <span aria-hidden="true" className="text-stone-600">·</span>
              <span className="text-red-400 font-semibold">🔥 Reações ao Vivo</span>
            </div>
          </div>

          {/* Right Cinema Preview Showcase (Tap to enter) */}
          <div className="lg:col-span-5">
            <div
              onClick={onOpenCinemaPreview}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-amber-500/30 bg-[#160e0a] p-2.5 sm:p-3 shadow-2xl transition-all hover:border-amber-400/60 hover:shadow-amber-500/10"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-950">
                <img
                  src="/src/assets/images/cinema_banner_1790190822081.jpg"
                  alt="Cinema Virtual Miazoom"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Centered Play Button (Red & Yellow) */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-xl shadow-red-600/40 group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 ml-0.5 fill-current" />
                  </div>
                </div>

                <div className="absolute top-2.5 left-2.5 rounded-md bg-gradient-to-r from-red-600 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white uppercase tracking-wider">
                  Cinema com Amigos
                </div>
              </div>

              <div className="mt-2.5 px-1 pb-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Sessão Co-Watching ao Vivo
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                    Abrir <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-2">
                  Assista a vídeos do aparelho ou da internet sincronizados com os amigos e mande reações de pipoca.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Entertainment Cards Grid (Red & Yellow) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Card 1: Cinema Virtual (Red) */}
        <div
          onClick={onOpenCinemaPreview}
          className="group cursor-pointer rounded-2xl border border-red-500/25 bg-stone-900/50 p-4 transition-all hover:border-red-500/50 hover:bg-stone-900/80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 mb-2.5">
            <Film className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white font-display mb-1 group-hover:text-red-300 transition-colors">
            Cinema com Pipoca
          </h3>
          <p className="text-[11px] text-stone-400 leading-tight">
            Filmes e séries tocando juntos na tela de todos.
          </p>
          <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-bold text-red-400">
            <span>Assistir Agora</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Card 2: Bate-Papo & Conversas (Yellow) */}
        <div
          onClick={() => startMeeting()}
          className="group cursor-pointer rounded-2xl border border-amber-500/25 bg-stone-900/50 p-4 transition-all hover:border-amber-400/50 hover:bg-stone-900/80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2.5">
            <MessageSquare className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white font-display mb-1 group-hover:text-amber-300 transition-colors">
            Bate-Papo em Grupo
          </h3>
          <p className="text-[11px] text-stone-400 leading-tight">
            Chamadas em vídeo para botar o papo em dia com os amigos.
          </p>
          <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-bold text-amber-400">
            <span>Abrir Sala</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>

        {/* Card 3: Sala de Espera com Música (Red) */}
        <div className="rounded-2xl border border-red-500/25 bg-stone-900/50 p-4 transition-all hover:border-red-500/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 mb-2.5">
            <Music className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white font-display mb-1">
            Música Ambiente
          </h3>
          <p className="text-[11px] text-stone-400 leading-tight">
            Sons relaxantes para receber os amigos na sala.
          </p>
          <div className="mt-3 pt-2 border-t border-stone-800 text-[10px] text-amber-300 font-semibold">
            Trilha Sonora Relax
          </div>
        </div>

        {/* Card 4: Gravações de Momentos (Yellow) */}
        <div
          onClick={onOpenRecordings}
          className="group cursor-pointer rounded-2xl border border-amber-500/25 bg-stone-900/50 p-4 transition-all hover:border-amber-400/50 hover:bg-stone-900/80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2.5">
            <PartyPopper className="h-4 w-4" />
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-white font-display mb-1 group-hover:text-amber-300 transition-colors">
            Melhores Momentos
          </h3>
          <p className="text-[11px] text-stone-400 leading-tight">
            Grave risadas e conversas para rever depois.
          </p>
          <div className="mt-3 pt-2 border-t border-stone-800 flex items-center justify-between text-[10px] font-bold text-amber-400">
            <span>Ver Gravados ({cloudRecordings.length})</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Recent Recordings / Saved Moments */}
      {cloudRecordings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-[#140d0a]/80 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white font-display flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>Momentos Gravados Recentes</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-200/70">
                Reveja conversas e sessões salvas
              </p>
            </div>
            <button
              onClick={onOpenRecordings}
              className="flex items-center gap-1 rounded-xl border border-stone-700 bg-stone-800/90 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:border-amber-400 transition-colors cursor-pointer"
            >
              <HardDrive className="h-3.5 w-3.5 text-amber-400" />
              <span>Ver Todos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {cloudRecordings.slice(0, 2).map((rec) => (
              <div
                key={rec.id}
                onClick={onOpenRecordings}
                className="flex items-start justify-between rounded-xl border border-stone-800 bg-stone-900/60 p-3 hover:border-amber-500/40 transition-all cursor-pointer"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-bold text-white truncate">{rec.title}</h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-stone-400">
                    <span>{rec.date}</span>
                    <span>·</span>
                    <span className="font-mono text-amber-400">{formatDuration(rec.durationSeconds)}</span>
                    <span>·</span>
                    <span>{formatBytes(rec.sizeBytes)}</span>
                  </div>
                </div>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Play className="h-3.5 w-3.5 ml-0.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
