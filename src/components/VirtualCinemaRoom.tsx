import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Film,
  Plus,
  Tv,
  Check,
  RotateCcw,
  Upload,
  Music,
  HardDrive,
  FileAudio,
  FileVideo,
  Disc,
  Radio,
  Trash2,
  FolderOpen,
  Scaling,
  Users,
  Eye,
  EyeOff,
  Expand,
  Shrink,
  MicOff,
  Home,
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { Participant } from '../types/meeting';

interface ImportedMediaItem {
  id: string;
  name: string;
  url: string;
  type: 'video' | 'audio';
  size: string;
  fileName: string;
  addedAt: string;
}

// Compact, mobile-first attendee badge for cinema view
const CinemaAttendeeMini: React.FC<{
  participant: Participant;
  size: 'mini' | 'micro';
}> = ({ participant, size }) => {
  const { localStream, screenStream } = useMeeting();
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

  const isMicro = size === 'micro';

  return (
    <div
      className={`group relative flex items-center shrink-0 rounded-full transition-all select-none ${
        isMicro
          ? 'p-0.5'
          : 'gap-1.5 bg-slate-900/90 border border-slate-800/90 py-0.5 px-1.5 sm:px-2'
      } ${
        participant.isSpeaking
          ? 'ring-2 ring-blue-500 shadow-xs shadow-blue-500/50'
          : ''
      }`}
      title={`${participant.name} ${participant.isSpeaking ? '(Falando)' : ''}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 ${
          isMicro ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-7 w-7 sm:h-8 sm:w-8'
        }`}
      >
        {!participant.isVideoOff && (isLocal ? !!localStream : true) ? (
          isLocal ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover -scale-x-100"
            />
          ) : (
            <img
              src={participant.avatar}
              alt={participant.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <img
            src={participant.avatar}
            alt={participant.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        )}

        {participant.isSpeaking && (
          <span className="absolute inset-0 rounded-full ring-2 ring-blue-400 animate-ping opacity-60" />
        )}

        {participant.isMuted && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-red-600 text-white">
            <MicOff className="h-1.5 w-1.5" />
          </div>
        )}
      </div>

      {!isMicro && (
        <span className="text-[10px] sm:text-[11px] font-medium text-slate-200 truncate max-w-[60px] sm:max-w-[80px]">
          {participant.name.split(' ')[0]}
        </span>
      )}
    </div>
  );
};

const PRESET_MOVIES = [
  {
    id: 'bunny',
    title: 'Animação Clássica 4K - Big Buck Bunny',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    category: 'Animação / Família',
    duration: '09:56',
    type: 'video' as const,
  },
  {
    id: 'tears',
    title: 'Odyssey Espacial - Sci-Fi Trailer Cinemático',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    category: 'Ficção Científica',
    duration: '12:14',
    type: 'video' as const,
  },
  {
    id: 'sintel',
    title: 'Fantasia & Aventura Épica - Sintel',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    category: 'Fantasia 4K',
    duration: '14:48',
    type: 'video' as const,
  },
  {
    id: 'nature',
    title: 'Natureza & Planeta Terra 4K HDR',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    category: 'Documentário',
    duration: '00:15',
    type: 'video' as const,
  },
];

const REACTION_EMOJIS = ['🍿', '🎬', '👏', '😱', '❤️', '🔥', '😂', '🎵'];

export const VirtualCinemaRoom: React.FC = () => {
  const {
    cinemaState,
    updateCinemaState,
    sendCinemaReaction,
    cinemaReactions,
    participants,
    cinemaLightsDimmed,
    setCinemaLightsDimmed,
    leaveMeeting,
  } = useMeeting();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [modalTab, setModalTab] = useState<'device' | 'catalog' | 'url'>('device');
  const [isSeekingLocally, setIsSeekingLocally] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);
  const [audienceSize, setAudienceSize] = useState<'mini' | 'micro' | 'hidden'>('mini');
  const [videoScaleMode, setVideoScaleMode] = useState<'contain' | 'cover'>('contain');
  const [isCinemaFocus, setIsCinemaFocus] = useState(false);

  // Local device imported files in this session
  const [importedFiles, setImportedFiles] = useState<ImportedMediaItem[]>([]);

  // Synchronize player with state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isSeekingLocally) return;

    // Check if video source changed
    if (video.src !== cinemaState.videoUrl) {
      video.src = cinemaState.videoUrl;
    }

    // Sync play / pause
    if (cinemaState.isPlaying && video.paused) {
      video.play().catch(() => {});
    } else if (!cinemaState.isPlaying && !video.paused) {
      video.pause();
    }

    // Sync time if drift is larger than 1.5 seconds
    const timeDelta = Math.abs(video.currentTime - cinemaState.currentTime);
    if (timeDelta > 1.5) {
      video.currentTime = cinemaState.currentTime;
    }
  }, [cinemaState, isSeekingLocally]);

  const handleTogglePlay = () => {
    const nextPlay = !cinemaState.isPlaying;
    const currentT = videoRef.current ? videoRef.current.currentTime : cinemaState.currentTime;
    updateCinemaState({
      isPlaying: nextPlay,
      currentTime: currentT,
    });
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setLocalTime(time);
    setIsSeekingLocally(true);
  };

  const handleSeekCommit = () => {
    setIsSeekingLocally(false);
    if (videoRef.current) {
      videoRef.current.currentTime = localTime;
    }
    updateCinemaState({
      currentTime: localTime,
      isPlaying: cinemaState.isPlaying,
    });
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isSeekingLocally) return;
    setLocalTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Process imported audio or video file
  const processMediaFile = (file: File) => {
    const isAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|wav|ogg|flac|aac|m4a|wma)$/i.test(file.name);
    const mediaType: 'video' | 'audio' = isAudio ? 'audio' : 'video';
    const blobUrl = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    const formattedSize = formatFileSize(file.size);

    const newItem: ImportedMediaItem = {
      id: Math.random().toString(36).substring(2, 9),
      name: cleanTitle,
      fileName: file.name,
      url: blobUrl,
      type: mediaType,
      size: formattedSize,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setImportedFiles((prev) => [newItem, ...prev.filter((item) => item.fileName !== file.name)]);

    updateCinemaState({
      videoUrl: blobUrl,
      title: cleanTitle,
      fileName: file.name,
      fileSize: formattedSize,
      mediaType,
      isLocalFile: true,
      currentTime: 0,
      isPlaying: true,
    });

    setImportNotification(`Carregado: ${file.name} (${formattedSize})`);
    setTimeout(() => setImportNotification(null), 3500);
    setShowCustomModal(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processMediaFile(file);
    // Reset file input value so user can re-select the same file if needed
    e.target.value = '';
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processMediaFile(file);
    }
  };

  const handleAddCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    const isAudioUrl = /\.(mp3|wav|ogg|flac|aac|m4a)(\?.*)?$/i.test(customUrlInput.trim());
    updateCinemaState({
      videoUrl: customUrlInput.trim(),
      title: isAudioUrl ? 'Faixa de Áudio em Rede' : 'Vídeo Personalizado Sincronizado',
      currentTime: 0,
      isPlaying: true,
      mediaType: isAudioUrl ? 'audio' : 'video',
      isLocalFile: false,
    });
    setCustomUrlInput('');
    setShowCustomModal(false);
  };

  const formatVideoTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isAudioPlaying = cinemaState.mediaType === 'audio';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex h-full w-full flex-col overflow-hidden transition-colors duration-700 ${
        cinemaLightsDimmed ? 'bg-[#05070c]' : 'bg-[#0a0f1d]'
      }`}
    >
      {/* Hidden File Input for Device Storage */}
      <input
        type="file"
        ref={fileInputRef}
        accept="video/*,audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-cyan-950/85 backdrop-blur-md border-4 border-dashed border-cyan-400 p-8 text-center animate-in fade-in duration-150">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 mb-4 animate-bounce">
            <Upload className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-bold text-white font-display mb-2">
            Solte seu vídeo ou música aqui
          </h3>
          <p className="text-sm text-cyan-200 max-w-md">
            Importação instantânea direta do armazenamento do seu dispositivo. Compatível com MP4, MKV, WebM, MP3, WAV, FLAC e mais.
          </p>
        </div>
      )}

      {/* Toast Notification when file imported */}
      {importNotification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-xl bg-cyan-900/90 border border-cyan-500/50 px-4 py-2.5 shadow-xl backdrop-blur-md text-cyan-100 text-xs font-medium animate-in fade-in slide-in-from-top-3">
          <Check className="h-4 w-4 text-cyan-400" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Floating Audience Popcorn / Live Emoji Stream */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        {cinemaReactions.map((rx) => (
          <div
            key={rx.id}
            style={{ left: `${rx.xPercent}%`, bottom: '120px' }}
            className="animate-float-reaction absolute flex flex-col items-center select-none"
          >
            <span className="text-3xl filter drop-shadow-lg">{rx.emoji}</span>
            <span className="mt-0.5 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
              {rx.userName}
            </span>
          </div>
        ))}
      </div>

      {/* Cinema Room Header HUD (or minimal exit button when in focus mode) */}
      {isCinemaFocus ? (
        <div className="absolute top-2 right-2 z-40 flex items-center gap-2">
          <button
            onClick={() => setIsCinemaFocus(false)}
            className="flex items-center gap-1.5 rounded-full bg-stone-900/90 border border-amber-500/40 px-3 py-1.5 text-xs text-amber-200 hover:text-white backdrop-blur-md shadow-lg cursor-pointer"
            title="Sair do Modo Foco (Mostrar cabeçalho e opções)"
          >
            <Shrink className="h-3.5 w-3.5 text-amber-400" />
            <span>Sair do Foco</span>
          </button>
        </div>
      ) : (
        <div className="relative z-20 flex items-center justify-between border-b border-amber-500/20 bg-[#140d0a]/80 px-3 sm:px-4 py-2 backdrop-blur-md">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-black shadow-md shadow-amber-500/20">
              {isAudioPlaying ? (
                <Music className="h-4 w-4 text-black" />
              ) : (
                <Film className="h-4 w-4 text-black" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight font-display truncate max-w-[120px] xs:max-w-[180px] sm:max-w-md">
                  {cinemaState.title}
                </h2>
                {cinemaState.isLocalFile ? (
                  <span className="hidden xs:flex items-center gap-1 rounded bg-amber-500/15 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-amber-300 border border-amber-500/30 shrink-0">
                    <HardDrive className="h-2.5 w-2.5" />
                    <span className="hidden sm:inline">Dispositivo Local</span>
                    <span className="sm:hidden">Local</span>
                  </span>
                ) : (
                  <span className="hidden xs:inline rounded bg-red-500/15 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-red-400 border border-red-500/25 shrink-0">
                    Sincronizado
                  </span>
                )}
                {isAudioPlaying && (
                  <span className="rounded bg-amber-500/15 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold text-amber-300 border border-amber-500/30 shrink-0">
                    Áudio
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate">
                Por: <span className="text-stone-300 font-medium">{cinemaState.controllerName}</span>
                {cinemaState.fileSize && (
                  <span className="ml-1.5 text-stone-500 font-mono tabular-nums">• {cinemaState.fileSize}</span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Voltar para Tela Inicial Button */}
            <button
              onClick={leaveMeeting}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-2 sm:px-2.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:text-white transition-all shadow-xs cursor-pointer"
              title="Sair do Cinema e Voltar para a Tela Inicial"
            >
              <Home className="h-3.5 w-3.5 text-red-400" />
              <span className="hidden sm:inline">Início</span>
            </button>

            {/* Quick Import from Device Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 sm:gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-2 sm:px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-900/60 hover:text-amber-200 transition-all shadow-xs cursor-pointer"
              title="Importar vídeo ou música do seu dispositivo celular ou tablet"
            >
              <Upload className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Importar do Dispositivo</span>
              <span className="sm:hidden text-[11px]">Importar</span>
            </button>

            {/* Video Fit Toggle (Encaixar vs Preencher) */}
            <button
              onClick={() => setVideoScaleMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
              className={`flex items-center gap-1 rounded-xl border px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                videoScaleMode === 'cover'
                  ? 'bg-red-600/20 text-red-300 border-red-500/40'
                  : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
              }`}
              title={
                videoScaleMode === 'contain'
                  ? 'Preencher Tela (zoom sem faixas pretas)'
                  : 'Encaixar Proporção Original'
              }
            >
              <Scaling className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">
                {videoScaleMode === 'cover' ? 'Preenchido' : 'Encaixado'}
              </span>
            </button>

            {/* Mode Focus Toggle */}
            <button
              onClick={() => setIsCinemaFocus(true)}
              className="hidden xs:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Modo Foco: Maximiza a tela do vídeo no celular/tablet"
            >
              <Expand className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden md:inline">Foco</span>
            </button>

            {/* Lights Toggle */}
            <button
              onClick={() => setCinemaLightsDimmed((prev) => !prev)}
              className={`flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 sm:px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                cinemaLightsDimmed
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}
              title="Apagar/Acender luzes do cinema"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden md:inline">{cinemaLightsDimmed ? 'Luzes Off' : 'Luzes On'}</span>
            </button>

            {/* Catalog/Manage button */}
            <button
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2 sm:px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              title="Adicionar ou gerenciar vídeos"
            >
              <Plus className="h-3.5 w-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Conteúdo</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Theater Layout: Large Screen + Side/Bottom Audience Reaction Strip */}
      <div className="relative flex flex-1 flex-col overflow-hidden min-h-0 w-full h-full">
        {/* Cinema Screen Container - Maximized space for mobile & tablet */}
        <div className="relative flex flex-1 flex-col items-center justify-center p-0.5 sm:p-2 md:p-3 overflow-hidden w-full h-full min-h-0">
          {/* Dynamic Ambient Theater Backlight Glow */}
          <div
            className={`pointer-events-none absolute h-[80%] w-[90%] rounded-full transition-opacity duration-1000 ${
              cinemaLightsDimmed
                ? isAudioPlaying
                  ? 'bg-gradient-to-r from-purple-600/20 via-pink-500/20 to-emerald-600/20 blur-[110px] opacity-100'
                  : 'bg-gradient-to-r from-blue-600/15 via-cyan-500/20 to-purple-600/15 blur-[100px] opacity-100'
                : 'opacity-0'
            }`}
          />

          {/* Screen Frame - Maximized width & height with dynamic fit */}
          <div
            className={`group relative w-full h-full max-h-full flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl border border-slate-800/80 bg-black shadow-2xl ring-1 ring-white/5 transition-all ${
              videoScaleMode === 'cover' ? 'aspect-auto' : 'aspect-video max-w-full'
            }`}
          >
            {/* The native video element plays both video and audio streams seamlessly */}
            <video
              ref={videoRef}
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className={`h-full w-full transition-all ${
                videoScaleMode === 'cover' ? 'object-cover' : 'object-contain'
              } ${isAudioPlaying ? 'opacity-0 absolute pointer-events-none' : ''}`}
            />

            {/* Immersive Audio Visualizer View when Media is Audio/Music */}
            {isAudioPlaying && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[#070d18] to-slate-950 p-4 sm:p-6 select-none overflow-hidden">
                {/* Radial ambient rings */}
                <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
                <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl" />

                {/* Animated Vinyl / Turntable Disc */}
                <div className="relative flex items-center justify-center mb-4 sm:mb-6">
                  <div
                    className={`relative flex h-28 w-28 sm:h-44 sm:w-44 items-center justify-center rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl shadow-purple-900/30 ${
                      cinemaState.isPlaying ? 'animate-spin-slow' : ''
                    }`}
                  >
                    {/* Vinyl Grooves */}
                    <div className="absolute inset-2 rounded-full border border-slate-800/80" />
                    <div className="absolute inset-5 rounded-full border border-slate-800/60" />
                    <div className="absolute inset-8 rounded-full border border-slate-800/40" />

                    {/* Center Vinyl Label */}
                    <div className="flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 shadow-inner">
                      <Disc className="h-6 w-6 sm:h-8 sm:w-8 text-white/90" />
                    </div>
                  </div>

                  {/* Pulsing Audio Ripples when Playing */}
                  {cinemaState.isPlaying && (
                    <div className="absolute -inset-3 sm:-inset-4 rounded-full border border-purple-500/30 animate-ping pointer-events-none" />
                  )}
                </div>

                {/* Track Metadata & Equalizer */}
                <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-purple-300 border border-purple-500/30 mb-1.5">
                    <Radio className="h-3 w-3 text-purple-400 animate-pulse" />
                    Reprodução de Música Hi-Fi
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white font-display tracking-tight line-clamp-1">
                    {cinemaState.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                    {cinemaState.fileName && <span className="truncate max-w-[200px]">{cinemaState.fileName}</span>}
                    {cinemaState.fileSize && <span>• {cinemaState.fileSize}</span>}
                  </p>

                  {/* Dynamic Animated Sound Wave Bars */}
                  <div className="mt-3 sm:mt-4 flex items-end justify-center gap-1 h-8 sm:h-10 w-44 sm:w-48">
                    <div className={`w-1.5 rounded-full bg-cyan-400 ${cinemaState.isPlaying ? 'animate-eq-1' : 'h-2'}`} />
                    <div className={`w-1.5 rounded-full bg-indigo-400 ${cinemaState.isPlaying ? 'animate-eq-2' : 'h-3'}`} />
                    <div className={`w-1.5 rounded-full bg-purple-400 ${cinemaState.isPlaying ? 'animate-eq-3' : 'h-1.5'}`} />
                    <div className={`w-1.5 rounded-full bg-pink-400 ${cinemaState.isPlaying ? 'animate-eq-4' : 'h-4'}`} />
                    <div className={`w-1.5 rounded-full bg-cyan-400 ${cinemaState.isPlaying ? 'animate-eq-2' : 'h-2'}`} />
                    <div className={`w-1.5 rounded-full bg-purple-400 ${cinemaState.isPlaying ? 'animate-eq-1' : 'h-3'}`} />
                    <div className={`w-1.5 rounded-full bg-pink-400 ${cinemaState.isPlaying ? 'animate-eq-3' : 'h-1.5'}`} />
                    <div className={`w-1.5 rounded-full bg-indigo-400 ${cinemaState.isPlaying ? 'animate-eq-4' : 'h-2.5'}`} />
                  </div>
                </div>
              </div>
            )}

            {/* In-screen Big Play/Pause indicator on hover or pause */}
            {!cinemaState.isPlaying && (
              <div
                onClick={handleTogglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 cursor-pointer backdrop-blur-[2px] transition-all"
              >
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-2xl shadow-red-600/50 transform hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 sm:h-10 sm:w-10 ml-1.5 fill-current" />
                </div>
              </div>
            )}

            {/* Bottom Synchronized Control Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col bg-gradient-to-t from-black/95 via-black/70 to-transparent p-2.5 sm:p-4 opacity-95 group-hover:opacity-100 transition-opacity">
              {/* Scrub Bar */}
              <div className="mb-2 flex items-center gap-2 sm:gap-3">
                <span className="font-mono tabular-nums text-[10px] sm:text-xs text-slate-300 shrink-0">
                  {formatVideoTime(localTime)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  value={localTime}
                  onChange={handleSeekChange}
                  onMouseUp={handleSeekCommit}
                  onTouchEnd={handleSeekCommit}
                  className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-700 accent-blue-500 focus:outline-none"
                />
                <span className="font-mono tabular-nums text-[10px] sm:text-xs text-slate-400 shrink-0">
                  {formatVideoTime(duration)}
                </span>
              </div>

              {/* Playback Button Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white hover:from-red-500 hover:to-blue-500 transition-all cursor-pointer shadow-md shadow-red-600/20"
                  >
                    {cinemaState.isPlaying ? (
                      <Pause className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
                    ) : (
                      <Play className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5 fill-current" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0;
                        updateCinemaState({ currentTime: 0 });
                      }
                    }}
                    title="Reiniciar do Início"
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                      }
                      setIsMuted(!isMuted);
                    }}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>

                  {/* Device Import shortcut in controls */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Carregar outro vídeo ou música do dispositivo"
                    className="hidden xs:flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  >
                    <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-400" />
                    <span className="text-[10px] sm:text-[11px]">Dispositivo</span>
                  </button>

                  {/* Quick Scale Mode Toggle in Player Controls */}
                  <button
                    onClick={() => setVideoScaleMode((prev) => (prev === 'contain' ? 'cover' : 'contain'))}
                    title={videoScaleMode === 'contain' ? 'Preencher Tela' : 'Encaixar 16:9'}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                      videoScaleMode === 'cover'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Scaling className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">
                      {videoScaleMode === 'cover' ? 'Preencher' : 'Encaixar'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setIsCinemaFocus((prev) => !prev)}
                    className="hidden sm:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                    title={isCinemaFocus ? 'Sair do Foco' : 'Modo Foco Total'}
                  >
                    {isCinemaFocus ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Small/Compact Audience Section ("icones das pessoas que assistem seja menor") */}
        {audienceSize === 'hidden' ? (
          /* Floating button when audience is hidden to maximize video area */
          <div className="absolute bottom-3 right-3 z-30">
            <button
              onClick={() => setAudienceSize('mini')}
              className="flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 text-xs text-slate-300 hover:text-white shadow-xl backdrop-blur-md cursor-pointer transition-all hover:scale-105"
              title="Exibir espectadores que estão assistindo"
            >
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              <span>Plateia ({participants.length})</span>
              <Eye className="h-3 w-3 text-cyan-400" />
            </button>
          </div>
        ) : (
          /* Sleek, ultra-compact horizontal bar for attendees and quick reactions */
          <div className="relative z-20 flex items-center justify-between gap-2 border-t border-slate-800/80 bg-slate-950/90 px-2 sm:px-4 py-1 sm:py-1.5 backdrop-blur-md shrink-0">
            {/* Left: Mini/Micro Audience Avatars */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
              <div className="flex items-center gap-1 shrink-0 text-slate-400 text-xs font-semibold">
                <Users className="h-3.5 w-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Assistindo:</span>
                <span className="font-mono text-cyan-300 font-bold">{participants.length}</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {participants.map((p) => (
                  <CinemaAttendeeMini key={p.id} participant={p} size={audienceSize} />
                ))}
              </div>
            </div>

            {/* Right: Quick Reactions + Audience Size Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Popcorn and live emojis tray */}
              <div className="hidden xs:flex items-center gap-0.5 rounded-full bg-slate-900/80 p-0.5 border border-slate-800">
                {REACTION_EMOJIS.slice(0, 6).map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendCinemaReaction(emoji)}
                    className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full hover:bg-slate-800 hover:scale-115 transition-all text-xs sm:text-sm cursor-pointer"
                    title={`Reagir com ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Audience Size Controls: [Mini | Micro | Ocultar] */}
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-[10px] font-medium">
                <button
                  onClick={() => setAudienceSize('mini')}
                  className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    audienceSize === 'mini'
                      ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ícones Miniatura"
                >
                  Mini
                </button>
                <button
                  onClick={() => setAudienceSize('micro')}
                  className={`px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                    audienceSize === 'micro'
                      ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ícones Micro (ainda menores para celular e tablet)"
                >
                  Micro
                </button>
                <button
                  onClick={() => setAudienceSize('hidden')}
                  className="px-1.5 py-0.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-0.5"
                  title="Ocultar plateia para deixar o leitor de vídeo ainda maior"
                >
                  <EyeOff className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">Ocultar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catalog & Import Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl text-slate-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Tv className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-display">
                  Gerenciar Mídia da Sala de Cinema
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-800 pb-3 mb-4">
              <button
                onClick={() => setModalTab('device')}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  modalTab === 'device'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <HardDrive className="h-3.5 w-3.5 text-blue-400" />
                <span>Meu Dispositivo</span>
              </button>

              <button
                onClick={() => setModalTab('catalog')}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  modalTab === 'catalog'
                    ? 'bg-red-600/20 text-red-300 border border-red-500/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Film className="h-3.5 w-3.5 text-red-400" />
                <span>Catálogo</span>
              </button>

              <button
                onClick={() => setModalTab('url')}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  modalTab === 'url'
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <Radio className="h-3.5 w-3.5 text-blue-400" />
                <span>URL Direta</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* TAB 1: DEVICE IMPORT */}
              {modalTab === 'device' && (
                <div className="space-y-4">
                  {/* Drag and Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-500/40 bg-blue-950/15 p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-950/25 transition-all cursor-pointer group"
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600/20 to-blue-600/20 text-blue-300 border border-blue-500/30 group-hover:scale-110 transition-transform mb-3">
                      <Upload className="h-7 w-7 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Escolher arquivo no armazenamento do dispositivo
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mb-3">
                      Selecione um vídeo (filme, série, clipe) ou faixa de música armazenada no seu celular ou tablet
                    </p>

                    <button
                      type="button"
                      className="rounded-xl bg-gradient-to-r from-red-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white group-hover:from-red-500 group-hover:to-blue-500 transition-all shadow-md shadow-red-600/20 cursor-pointer"
                    >
                      Procurar no Armazenamento
                    </button>

                    <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
                      <span className="text-[10px] text-slate-400 font-medium mr-1">Suporta:</span>
                      {['MP4', 'MKV', 'WEBM', 'MOV', 'MP3', 'WAV', 'FLAC', 'AAC', 'M4A', 'OGG'].map((ext) => (
                        <span
                          key={ext}
                          className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-mono font-medium text-slate-300"
                        >
                          {ext}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Imported Files History in Session */}
                  {importedFiles.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                          Arquivos Importados Nesta Sessão ({importedFiles.length})
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {importedFiles.map((file) => {
                          const isCurrentlyActive = cinemaState.videoUrl === file.url;
                          return (
                            <div
                              key={file.id}
                              className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                                isCurrentlyActive
                                  ? 'border-cyan-500 bg-cyan-950/30'
                                  : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                    file.type === 'audio'
                                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                  }`}
                                >
                                  {file.type === 'audio' ? (
                                    <FileAudio className="h-4 w-4" />
                                  ) : (
                                    <FileVideo className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-xs font-bold text-white truncate">{file.name}</h5>
                                  <p className="text-[10px] text-slate-400 font-mono tabular-nums">
                                    {file.type === 'audio' ? 'Áudio' : 'Vídeo'} • {file.size} • {file.addedAt}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isCurrentlyActive ? (
                                  <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400">
                                    <Check className="h-3.5 w-3.5" />
                                    Em Reprodução
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      updateCinemaState({
                                        videoUrl: file.url,
                                        title: file.name,
                                        fileName: file.fileName,
                                        fileSize: file.size,
                                        mediaType: file.type,
                                        isLocalFile: true,
                                        currentTime: 0,
                                        isPlaying: true,
                                      });
                                      setShowCustomModal(false);
                                    }}
                                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
                                  >
                                    Reproduzir
                                  </button>
                                )}

                                <button
                                  onClick={() =>
                                    setImportedFiles((prev) => prev.filter((item) => item.id !== file.id))
                                  }
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-rose-400 transition-colors cursor-pointer"
                                  title="Remover da lista"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: PRESET 4K CATALOG */}
              {modalTab === 'catalog' && (
                <div className="space-y-3">
                  <label className="text-xs font-semibold text-slate-300">
                    Selecione um título pré-configurado em 4K HDR:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRESET_MOVIES.map((movie) => {
                      const isActive = cinemaState.videoUrl === movie.url;
                      return (
                        <button
                          key={movie.id}
                          onClick={() => {
                            updateCinemaState({
                              videoUrl: movie.url,
                              title: movie.title,
                              currentTime: 0,
                              isPlaying: true,
                              mediaType: 'video',
                              isLocalFile: false,
                            });
                            setShowCustomModal(false);
                          }}
                          className={`flex flex-col rounded-xl border p-3 text-left transition-all cursor-pointer ${
                            isActive
                              ? 'border-cyan-500 bg-cyan-950/30'
                              : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-cyan-400 font-semibold">{movie.category}</span>
                            {isActive && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                          </div>
                          <h4 className="text-xs font-bold text-white mt-1 line-clamp-1">{movie.title}</h4>
                          <span className="text-[10px] text-slate-500 mt-1">Duração: {movie.duration}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOM URL */}
              {modalTab === 'url' && (
                <form onSubmit={handleAddCustomVideo} className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Insira o link direto de um vídeo ou áudio (MP4, WebM, MP3 ou HLS stream):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/conteudo.mp4"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                    >
                      Sincronizar
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Dica: Suporta URLs diretas de servidores de mídia e transmissões HTTPS compatíveis com HTML5.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
