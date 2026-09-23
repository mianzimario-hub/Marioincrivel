import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  onOpenAndroidModal?: () => void;
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<Props> = ({
  onOpenAndroidModal,
  className = '',
  variant = 'compact',
}) => {
  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone/native APK mode, show small indicator or return null
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
    } else if (onOpenAndroidModal) {
      onOpenAndroidModal();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (variant === 'full') {
    return (
      <>
        <button
          onClick={handleClick}
          className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all cursor-pointer ${className}`}
        >
          <Smartphone className="h-4 w-4 text-black" />
          <span>{isAndroid ? 'Instalar App Android (APK)' : 'Instalar no Celular'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#140d0a] border border-amber-500/30 p-6 shadow-2xl text-amber-50">
              <h3 className="text-base font-bold text-white">Instalar no iPhone / iPad</h3>
              <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                1. Toque no botão <strong>Compartilhar</strong> (ícone de quadrado com seta para cima) no Safari.<br />
                2. Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.<br />
                3. Confirme para abrir em tela cheia como aplicativo!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-stone-800 py-2 text-xs font-bold text-white hover:bg-stone-700 cursor-pointer"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Compact variant for Navbar / Header
  return (
    <>
      <button
        onClick={handleClick}
        title="Instalar aplicativo APK para Android"
        className={`flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-gradient-to-r from-red-600/20 to-amber-500/20 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 hover:border-amber-400 hover:text-white transition-all cursor-pointer ${className}`}
      >
        <Smartphone className="h-3.5 w-3.5 text-amber-400 shrink-0" />
        <span className="hidden sm:inline">App Android</span>
        <span className="sm:hidden">APK</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#140d0a] border border-amber-500/30 p-6 shadow-2xl text-amber-50">
            <h3 className="text-base font-bold text-white">Instalar no iPhone / iPad</h3>
            <p className="mt-2 text-xs text-stone-300 leading-relaxed">
              1. Toque no botão <strong>Compartilhar</strong> no Safari.<br />
              2. Selecione <strong>Adicionar à Tela de Início</strong>.
            </p>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-4 w-full rounded-xl bg-stone-800 py-2 text-xs font-bold text-white hover:bg-stone-700 cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
