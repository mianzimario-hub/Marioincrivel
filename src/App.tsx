/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Film, HardDrive, User, Home, Smartphone } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MeetingProvider, useMeeting } from './context/MeetingContext';
import { Navbar } from './components/Navbar';
import { HomeDashboard } from './components/HomeDashboard';
import { MeetingRoom } from './components/MeetingRoom';
import { WaitingRoomView } from './components/WaitingRoomView';
import { AuthModal } from './components/AuthModal';
import { RecordingsModal } from './components/RecordingsModal';
import { ProfileModal } from './components/ProfileModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';

const MainContent: React.FC = () => {
  const { inMeeting, isWaiting, joinMeeting, startMeeting, cloudRecordings } = useMeeting();
  const { currentUser, openAuthModal, openProfileModal } = useAuth();
  const [isRecordingsOpen, setIsRecordingsOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'cinema' | 'recordings' | 'profile' | 'apk'>('home');

  // Check URL parameters on mount for dynamic links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const recParam = params.get('recording');
    const apkParam = params.get('apk');

    if (roomParam) {
      joinMeeting(roomParam);
    } else if (recParam) {
      setIsRecordingsOpen(true);
    } else if (apkParam) {
      setIsAndroidModalOpen(true);
    }
  }, [joinMeeting]);

  const handleOpenCinemaPreview = () => {
    startMeeting('mia-cinema-preview');
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-amber-50 flex flex-col selection:bg-amber-500 selection:text-black relative">
      {/* Top Bar (only displayed outside of active meeting) */}
      <Navbar
        onOpenRecordings={() => setIsRecordingsOpen(true)}
        onOpenCinemaPreview={handleOpenCinemaPreview}
        onOpenNewMeeting={() => startMeeting()}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
      />

      {/* Main Viewport Router */}
      <div className="flex-1 flex flex-col pb-20 md:pb-0">
        {inMeeting ? (
          <MeetingRoom />
        ) : isWaiting ? (
          <WaitingRoomView />
        ) : (
          <HomeDashboard
            onOpenRecordings={() => setIsRecordingsOpen(true)}
            onOpenCinemaPreview={handleOpenCinemaPreview}
            onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
          />
        )}
      </div>

      {/* Mobile Bottom Navigation Dock in Red & Yellow */}
      {!inMeeting && !isWaiting && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#140c08]/95 backdrop-blur-xl border-t border-amber-500/20 px-2 py-2 pb-safe shadow-2xl">
          <div className="flex items-center justify-around">
            {/* Tab 1: Início */}
            <button
              onClick={() => {
                setActiveMobileTab('home');
                setIsRecordingsOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeMobileTab === 'home'
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeMobileTab === 'home' ? 'bg-amber-500/20 text-amber-400' : ''}`}>
                <Home className="h-4 w-4" />
              </div>
              <span className="text-[10px] tracking-tight">Início</span>
            </button>

            {/* Tab 2: Cinema */}
            <button
              onClick={() => {
                setActiveMobileTab('cinema');
                handleOpenCinemaPreview();
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer text-stone-400 hover:text-red-400"
            >
              <div className="p-1.5 rounded-lg hover:bg-red-600/20">
                <Film className="h-4 w-4 text-red-400" />
              </div>
              <span className="text-[10px] tracking-tight">Cinema</span>
            </button>

            {/* Tab 3: App Android (APK) */}
            <button
              onClick={() => {
                setActiveMobileTab('apk');
                setIsAndroidModalOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer text-stone-400 hover:text-amber-300"
            >
              <div className="relative p-1.5 rounded-lg bg-gradient-to-tr from-red-600/30 to-amber-500/30 border border-amber-500/40 text-amber-300">
                <Smartphone className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-amber-300 tracking-tight">APK</span>
            </button>

            {/* Tab 4: Momentos Salvos */}
            <button
              onClick={() => {
                setActiveMobileTab('recordings');
                setIsRecordingsOpen(true);
              }}
              className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer text-stone-400 hover:text-amber-400"
            >
              <div className="relative p-1.5 rounded-lg hover:bg-amber-500/20">
                <HardDrive className="h-4 w-4 text-amber-400" />
                {cloudRecordings.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-white font-bold text-[8px]">
                    {cloudRecordings.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight">Salvos</span>
            </button>

            {/* Tab 5: Perfil / Editar Perfil */}
            <button
              onClick={() => {
                setActiveMobileTab('profile');
                if (currentUser) {
                  openProfileModal();
                } else {
                  openAuthModal('login');
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                activeMobileTab === 'profile'
                  ? 'text-amber-400 font-bold scale-105'
                  : 'text-stone-400 hover:text-amber-200'
              }`}
            >
              <div className="p-1 rounded-lg">
                {currentUser ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="h-5 w-5 rounded-full object-cover ring-2 ring-amber-400"
                  />
                ) : (
                  <User className="h-4 w-4 text-stone-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight">
                {currentUser ? 'Perfil' : 'Conta'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <AuthModal />
      <ProfileModal />
      <AndroidInstallModal
        isOpen={isAndroidModalOpen}
        onClose={() => {
          setIsAndroidModalOpen(false);
          setActiveMobileTab('home');
        }}
      />
      <RecordingsModal
        isOpen={isRecordingsOpen}
        onClose={() => {
          setIsRecordingsOpen(false);
          setActiveMobileTab('home');
        }}
      />

      {/* Offline Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MeetingProvider>
        <MainContent />
      </MeetingProvider>
    </AuthProvider>
  );
}
