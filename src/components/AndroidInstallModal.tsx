import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isAndroid, androidVersion, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'direct' | 'apk-build'>('direct');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    await install();
  };

  const copyCapacitorCommands = () => {
    const text = `npm run build\nnpx cap add android\nnpx cap sync\nnpx cap open android`;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl border border-amber-500/30 bg-[#140d0a] shadow-2xl text-amber-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 px-5 py-4 bg-[#1c0f0a]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20">
              <Smartphone className="h-6 w-6 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-display">
                  Aplicativo Android (APK)
                </h3>
                <span className="rounded-md bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Android 8.0 - 15
                </span>
              </div>
              <p className="text-xs text-amber-200/70">
                Instale no seu celular ou tablet com suporte completo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-900/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('direct')}
            className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'direct'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Instalação Direta no Celular</span>
          </button>

          <button
            onClick={() => setActiveTab('apk-build')}
            className={`flex-1 rounded-xl py-2 px-3 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'apk-build'
                ? 'bg-gradient-to-r from-red-600 to-amber-500 text-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Pacote APK Nativo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Compatibility Ribbon */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-100 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Compatibilidade Garantida:</p>
              <p className="text-amber-200/80 mt-0.5 leading-relaxed">
                Suporta desde o <strong>Android 8.0 Oreo (API 26)</strong> até o{' '}
                <strong>Android 14 e Android 15 (API 34/35)</strong>.
                {isAndroid && androidVersion && (
                  <span className="block mt-1 text-emerald-300 font-semibold">
                    ✓ Seu dispositivo identificado: Android {androidVersion}
                  </span>
                )}
              </p>
            </div>
          </div>

          {activeTab === 'direct' ? (
            <div className="space-y-4">
              {/* Direct Install CTA */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 via-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/20">
                  <Smartphone className="h-7 w-7 text-black" />
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Instalar Miazoom como App Nativo
                  </h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                    Cria o aplicativo nativo na tela inicial do Android, com ícone próprio,
                    modo tela cheia e desempenho de alta velocidade sem barras do navegador.
                  </p>
                </div>

                {isInstalled ? (
                  <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 py-2.5 px-4 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Aplicativo já instalado no dispositivo!</span>
                  </div>
                ) : isInstallable ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 py-3 px-4 text-sm font-extrabold text-black shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-black" />
                    <span>Instalar no Celular Agora (1 Toque)</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-stone-950/70 border border-stone-800 p-3 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Info className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Como instalar manualmente no Chrome / Edge no Android:</span>
                    </div>
                    <ol className="text-xs text-stone-300 space-y-1.5 list-decimal pl-4">
                      <li>
                        Toque nos <strong>3 pontinhos (⋮)</strong> no canto superior do navegador.
                      </li>
                      <li>
                        Selecione <strong>"Instalar aplicativo"</strong> ou{' '}
                        <strong>"Adicionar à tela inicial"</strong>.
                      </li>
                      <li>
                        Confirme clicando em <strong>"Instalar"</strong>. O ícone do Miazoom aparecerá na sua gaveta de apps!
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Hardware & Features Grid for Android */}
              <div className="grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                    <span>Tela Cheia Imersiva</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-tight">
                    Aproveita a tela completa de ponta a ponta sem barra de URL.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Cpu className="h-3.5 w-3.5 text-red-400" />
                    <span>Câmera & Áudio HD</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-tight">
                    Microfone e câmera nativos de baixa latência em Android 8 a 15.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Capacitor / APK Build Guide */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-amber-400" />
                    <span>Compilação do APK Nativo com Capacitor</span>
                  </h4>
                  <button
                    onClick={copyCapacitorCommands}
                    className="text-[11px] font-bold text-amber-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? 'Copiado!' : 'Copiar Comandos'}
                  </button>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed">
                  O projeto já está configurado com <code>capacitor.config.json</code> pronto para compilar
                  o arquivo <strong>.apk</strong> no Android Studio ou via linha de comando Gradle:
                </p>

                <div className="rounded-xl bg-black/80 border border-stone-800 p-3 font-mono text-[11px] text-amber-300 space-y-1 overflow-x-auto">
                  <p className="text-stone-500"># 1. Gerar os arquivos estáticos de produção</p>
                  <p className="text-white">npm run build</p>
                  <p className="text-stone-500 mt-2"># 2. Adicionar a plataforma Android (minSdkVersion: 26, target: 35)</p>
                  <p className="text-white">npx cap add android</p>
                  <p className="text-stone-500 mt-2"># 3. Sincronizar e abrir no Android Studio</p>
                  <p className="text-white">npx cap sync</p>
                  <p className="text-white">npx cap open android</p>
                  <p className="text-stone-500 mt-2"># 4. Ou compilar o APK diretamente pelo terminal:</p>
                  <p className="text-amber-400">cd android &amp;&amp; ./gradlew assembleDebug</p>
                </div>

                <div className="text-[11px] text-stone-400 bg-stone-950 p-2.5 rounded-xl border border-stone-800">
                  <span className="font-bold text-amber-400">Localização do APK gerado:</span>
                  <p className="font-mono text-stone-300 mt-0.5 truncate">
                    android/app/build/outputs/apk/debug/app-debug.apk
                  </p>
                </div>
              </div>

              {/* Android Permissions Configured */}
              <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-3.5 space-y-2 text-xs">
                <h5 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Permissões Nativas do Android Configurações:</span>
                </h5>
                <ul className="text-stone-300 space-y-1 text-[11px] pl-2">
                  <li>• <code>android.permission.CAMERA</code> (Videochamadas e efeitos)</li>
                  <li>• <code>android.permission.RECORD_AUDIO</code> (Microfone em grupo)</li>
                  <li>• <code>android.permission.MODIFY_AUDIO_SETTINGS</code> (Controle de volume)</li>
                  <li>• <code>android.permission.INTERNET</code> (Transmissão P2P e WebSocket)</li>
                  <li>• <code>android.permission.VIBRATE</code> (Respostas táteis nas reações)</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-800 px-5 py-3.5 bg-[#140d0a]">
          <span className="text-[11px] text-stone-500">
            Miazoom v1.0 • Android APK Ready
          </span>

          <button
            onClick={onClose}
            className="rounded-xl border border-stone-700 bg-stone-800 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
