import React from 'react';
import { Video, Film, HardDrive, LogIn, LogOut, Home, UserCog, MessageSquare, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMeeting } from '../context/MeetingContext';

interface NavbarProps {
  onOpenRecordings: () => void;
  onOpenCinemaPreview: () => void;
  onOpenNewMeeting: () => void;
  onOpenAndroidModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRecordings,
  onOpenCinemaPreview,
  onOpenNewMeeting,
  onOpenAndroidModal,
}) => {
  const { currentUser, openAuthModal, openProfileModal, logout } = useAuth();
  const { inMeeting } = useMeeting();

  if (inMeeting) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#0e0907]/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Wordmark & Início Link with Red & Yellow identity */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 text-lg sm:text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90 select-none"
            title="Miazoom - Bate-Papo & Entretenimento"
          >
            {/* Red & Yellow Icon Badge */}
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 shadow-md shadow-amber-500/20">
              <Video className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
              </span>
            </div>

            {/* Wordmark: Mia in Red, zoom in Yellow */}
            <div className="flex items-baseline font-display text-xl sm:text-2xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">Mia</span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">zoom</span>
            </div>
          </a>
        </div>

        {/* Clean Text Navigation Links (Tablet & Desktop) */}
        <nav className="hidden md:flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium text-amber-100/70">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-white hover:text-amber-400 font-bold transition-colors cursor-pointer"
          >
            <Home className="h-4 w-4 text-amber-400" />
            <span>Início</span>
          </button>
          <button
            onClick={onOpenNewMeeting}
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer"
          >
            <MessageSquare className="h-4 w-4 text-red-400" />
            <span>Conversas</span>
          </button>
          <button
            onClick={onOpenCinemaPreview}
            className="flex items-center gap-1.5 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Film className="h-4 w-4 text-amber-400" />
            <span>Cinema com Amigos</span>
          </button>
          <button
            onClick={onOpenRecordings}
            className="flex items-center gap-1.5 hover:text-red-400 transition-colors cursor-pointer"
          >
            <HardDrive className="h-4 w-4 text-red-400" />
            <span>Momentos Salvos</span>
          </button>
        </nav>

        {/* Actions Area */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Android APK Button */}
          <button
            onClick={onOpenAndroidModal}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-red-600/15 via-amber-500/15 to-yellow-400/15 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 hover:border-amber-400 hover:text-white transition-all cursor-pointer shadow-xs"
            title="Instalar ou compilar APK para Android (Versão 8 a 15)"
          >
            <Smartphone className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">App Android</span>
            <span className="sm:hidden text-[11px]">APK</span>
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={openProfileModal}
                title="Editar meu perfil"
                className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-stone-900/80 py-1 px-2 sm:px-3 hover:border-amber-400/60 hover:bg-stone-800 transition-all cursor-pointer group text-left"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full object-cover ring-1 ring-amber-400 group-hover:ring-amber-300 transition-all"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-white group-hover:text-amber-200 truncate max-w-[95px]">
                    {currentUser.name.split(' ')[0]}
                  </p>
                  <p className="text-[9px] text-amber-400 flex items-center gap-0.5">
                    <UserCog className="h-2.5 w-2.5" />
                    <span>Editar Perfil</span>
                  </p>
                </div>
              </button>
              <button
                onClick={logout}
                title="Sair da conta"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-stone-800 text-stone-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-stone-900/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-amber-300 hover:border-amber-400 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              <LogIn className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden xs:inline">Entrar</span>
            </button>
          )}

          {/* Primary Quick Start in Red & Yellow */}
          <button
            onClick={onOpenNewMeeting}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all whitespace-nowrap active:scale-95 cursor-pointer"
          >
            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" />
            <span className="hidden sm:inline">Iniciar Conversa</span>
            <span className="sm:hidden">Conversar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
