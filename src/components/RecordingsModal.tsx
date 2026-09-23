import React, { useState } from 'react';
import { X, HardDrive, Download, Trash2, Play, Check, Share2, Home, Film, Sparkles } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { CloudRecording } from '../types/meeting';
import { formatBytes, formatDuration } from '../utils/cryptoSim';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RecordingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { cloudRecordings, deleteCloudRecording } = useMeeting();
  const [selectedRecording, setSelectedRecording] = useState<CloudRecording | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = (rec: CloudRecording) => {
    const url = `${window.location.origin}?recording=${rec.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(rec.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex h-[85vh] w-full max-w-4xl flex-col rounded-3xl border border-amber-500/30 bg-[#120c0a] shadow-2xl text-amber-50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 px-4 sm:px-6 py-3.5 sm:py-4 bg-[#1a0f0a]/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-black">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">Momentos & Clipes Gravados</h3>
              <p className="text-[11px] sm:text-xs text-amber-200/70">
                Gravações de risadas, conversas e sessões com a galera
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1 text-xs font-semibold text-stone-300 hover:text-white px-2.5 py-1.5 rounded-xl border border-amber-500/30 bg-stone-900/80 hover:border-amber-400 transition-colors cursor-pointer"
              title="Fechar e voltar à tela inicial"
            >
              <Home className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Voltar ao Início</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Recordings List */}
          <div className="w-full md:w-1/2 overflow-y-auto border-b md:border-b-0 md:border-r border-amber-500/20 p-3 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-amber-200/80 px-1">
              <span>{cloudRecordings.length} Gravações de Resenha</span>
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Sparkles className="h-3.5 w-3.5" /> Clipes Salvos
              </span>
            </div>

            {cloudRecordings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-stone-500">
                <HardDrive className="h-10 w-10 mb-2 opacity-40 text-amber-400" />
                <p className="text-sm font-semibold text-stone-300">Nenhum momento gravado ainda</p>
                <p className="text-xs mt-1 text-stone-400">Abra uma sala com amigos e clique em Gravar</p>
              </div>
            ) : (
              cloudRecordings.map((rec) => {
                const isSelected = selectedRecording?.id === rec.id;
                return (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedRecording(rec)}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/10'
                        : 'border-stone-800 bg-stone-900/60 hover:border-amber-500/40 hover:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-1">{rec.title}</h4>
                      <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-300 border border-amber-500/30 shrink-0">
                        HD Clipes
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-amber-200/70">
                      <span>{rec.date}</span>
                      <span>·</span>
                      <span className="font-mono text-amber-400 font-semibold">{formatDuration(rec.durationSeconds)}</span>
                      <span>·</span>
                      <span>{formatBytes(rec.sizeBytes)}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-stone-800 pt-1.5 text-[10px] text-stone-400">
                      <span className="truncate">Por: {rec.recordedBy}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(rec);
                          }}
                          title="Copiar Link"
                          className="hover:text-amber-400 transition-colors p-1 cursor-pointer"
                        >
                          {copiedId === rec.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCloudRecording(rec.id);
                            if (selectedRecording?.id === rec.id) setSelectedRecording(null);
                          }}
                          title="Excluir gravação"
                          className="hover:text-red-400 transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details & Playback Preview */}
          <div className="w-full md:w-1/2 flex flex-col overflow-y-auto p-4 sm:p-6 bg-stone-950/50">
            {selectedRecording ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                    Sala: {selectedRecording.roomId}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{selectedRecording.title}</h3>
                </div>

                {/* Video Player Preview */}
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-stone-800 bg-black flex items-center justify-center shadow-lg">
                  {selectedRecording.videoBlobUrl ? (
                    <video
                      src={selectedRecording.videoBlobUrl}
                      controls
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-500 p-4 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                        <Play className="h-6 w-6 ml-0.5 fill-current" />
                      </div>
                      <p className="text-xs text-white font-bold">
                        Player Pronto para Reprodução
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Assista aos melhores momentos gravados
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions in Red & Yellow */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleCopyLink(selectedRecording)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 px-4 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    {copiedId === selectedRecording.id ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-900" />
                        <span>Link Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        <span>Compartilhar com Amigos</span>
                      </>
                    )}
                  </button>

                  {selectedRecording.videoBlobUrl && (
                    <a
                      href={selectedRecording.videoBlobUrl}
                      download={`miazoom-${selectedRecording.id}.webm`}
                      className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-800 px-4 py-2.5 text-xs font-semibold text-stone-200 hover:bg-stone-700 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Baixar</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-stone-500">
                <Film className="h-10 w-10 mb-2 opacity-30 text-amber-400" />
                <p className="text-sm font-semibold text-stone-300">Selecione uma gravação</p>
                <p className="text-xs mt-1 text-stone-400">Assista e compartilhe com os amigos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
