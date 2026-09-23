import React from 'react';
import {
  X,
  Shield,
  MicOff,
  VideoOff,
  Lock,
  Unlock,
  Sliders,
  UserX,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenWaitingRoomConfig: () => void;
}

export const HostControlsModal: React.FC<Props> = ({ isOpen, onClose, onOpenWaitingRoomConfig }) => {
  const {
    hostMuteAll,
    hostDisableAllCameras,
    hostLockRoom,
    hostToggleWaitingRoom,
    hostKickParticipant,
    permissions,
    participants,
    waitingRoomConfig,
  } = useMeeting();

  if (!isOpen) return null;

  const guests = participants.filter((p) => !p.isHost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display">Controles do Anfitrião</h3>
            <p className="text-[11px] sm:text-xs text-slate-400">Gerenciamento central de permissões e segurança</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          {/* Quick Universal Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={hostMuteAll}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-red-300 hover:bg-red-900/40 transition-all font-semibold cursor-pointer"
            >
              <MicOff className="h-4 w-4 text-red-400" />
              <span>Silenciar Todos</span>
            </button>

            <button
              onClick={hostDisableAllCameras}
              className="flex items-center justify-center gap-2 rounded-xl border border-red-900/40 bg-red-950/20 p-3 text-red-300 hover:bg-red-900/40 transition-all font-semibold cursor-pointer"
            >
              <VideoOff className="h-4 w-4 text-red-400" />
              <span>Desativar Câmeras</span>
            </button>
          </div>

          {/* Security & Access Controls */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
            <h4 className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              Segurança da Sessão
            </h4>

            {/* Lock room */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {permissions.lockRoom ? (
                  <Lock className="h-4 w-4 text-red-400" />
                ) : (
                  <Unlock className="h-4 w-4 text-slate-400" />
                )}
                <div>
                  <p className="font-semibold text-slate-200">Trancar Reunião</p>
                  <p className="text-[11px] text-slate-400">
                    Impede novos participantes de ingressarem
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={permissions.lockRoom}
                onChange={(e) => hostLockRoom(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 text-red-600 focus:ring-red-500"
              />
            </div>

            {/* Waiting Room Toggle */}
            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4 w-4 text-blue-400" />
                <div>
                  <p className="font-semibold text-slate-200">Sala de Espera Ativa</p>
                  <p className="text-[11px] text-slate-400">
                    Novos convidados precisam de aprovação prévia
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenWaitingRoomConfig();
                  }}
                  className="text-[11px] font-semibold text-blue-400 hover:underline cursor-pointer"
                >
                  Personalizar
                </button>
                <input
                  type="checkbox"
                  checked={!!waitingRoomConfig}
                  onChange={(e) => hostToggleWaitingRoom(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Participant Permissions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-3">
            <h4 className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              Permissões dos Participantes
            </h4>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-slate-400" />
                <span>Compartilhar Tela</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.participantsCanShareScreen}
                onChange={() => {}}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                <span>Enviar Mensagens no Chat</span>
              </div>
              <input
                type="checkbox"
                checked={permissions.participantsCanChat}
                onChange={() => {}}
                className="h-4 w-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Participant Kick / Manage List */}
          {guests.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
              <h4 className="text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
                Gerenciar Participantes Conectados ({guests.length})
              </h4>
              <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl bg-slate-800/50 p-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={g.avatar}
                        alt={g.name}
                        className="h-6 w-6 rounded-full object-cover ring-1 ring-blue-500/30"
                      />
                      <span className="truncate text-slate-200">{g.name}</span>
                    </div>
                    <button
                      onClick={() => hostKickParticipant(g.id)}
                      className="flex items-center gap-1 rounded-lg bg-red-600/10 px-2 py-1 text-[11px] font-semibold text-red-400 hover:bg-red-600/20 transition-colors cursor-pointer"
                    >
                      <UserX className="h-3 w-3" />
                      <span>Expulsar</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
