import React from 'react';
import { X, Shield, UserCheck, UserX, Mic, MicOff, Video, VideoOff, Hand, UserPlus } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenInvite: () => void;
}

export const ParticipantsPanel: React.FC<Props> = ({ isOpen, onClose, onOpenInvite }) => {
  const {
    participants,
    waitingParticipants,
    admitParticipant,
    admitAllParticipants,
    rejectParticipant,
    isHost,
    hostMuteAll,
  } = useMeeting();

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-80 md:w-96 flex-col border-l border-slate-800 bg-[#0b0f19] shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
        <div>
          <h3 className="text-sm font-bold text-white font-display">
            Participantes ({participants.length})
          </h3>
          <p className="text-[11px] text-slate-400">Controle de acesso e presença</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Waiting Room Section (for Host) */}
        {isHost && waitingParticipants.length > 0 && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-950/30 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                Sala de Espera ({waitingParticipants.length})
              </span>
              <button
                onClick={admitAllParticipants}
                className="text-[11px] font-bold text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Admitir Todos
              </button>
            </div>

            <div className="space-y-2">
              {waitingParticipants.map((wp) => (
                <div
                  key={wp.id}
                  className="flex items-center justify-between rounded-xl bg-slate-900/80 p-2 border border-slate-800"
                >
                  <div className="flex items-center gap-2 truncate">
                    <img
                      src={wp.avatar}
                      alt={wp.name}
                      className="h-7 w-7 rounded-full object-cover ring-1 ring-blue-500/40"
                    />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-200 truncate">{wp.name}</p>
                      <p className="text-[10px] text-slate-400">Aguardando aprovação</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => admitParticipant(wp.id)}
                      title="Admitir na Reunião"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => rejectParticipant(wp.id)}
                      title="Recusar Entrada"
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <UserX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admitted Participants List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Conectados na Sessão</span>
            {isHost && (
              <button
                onClick={hostMuteAll}
                className="text-[11px] text-red-400 hover:underline cursor-pointer font-bold"
              >
                Silenciar Todos
              </button>
            )}
          </div>

          {participants.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-2.5"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-blue-500/30"
                />
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">{p.name}</span>
                    {p.isHost && (
                      <span className="flex items-center gap-0.5 rounded-md bg-blue-600/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/20">
                        <Shield className="h-2.5 w-2.5" /> Host
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">Desde {p.joinedAt}</p>
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                {p.isHandRaised && (
                  <span className="text-amber-400" title="Mão Levantada">
                    <Hand className="h-4 w-4" />
                  </span>
                )}
                {p.isMuted ? (
                  <MicOff className="h-4 w-4 text-red-400" />
                ) : (
                  <Mic className="h-4 w-4 text-slate-400" />
                )}
                {p.isVideoOff ? (
                  <VideoOff className="h-4 w-4 text-slate-500" />
                ) : (
                  <Video className="h-4 w-4 text-blue-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Button Footer */}
      <div className="border-t border-slate-800 p-3 bg-slate-950">
        <button
          onClick={onOpenInvite}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-blue-600 py-3 text-xs font-bold text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-blue-500 transition-all cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          <span>Convidar com Link Dinâmico</span>
        </button>
      </div>
    </div>
  );
};
