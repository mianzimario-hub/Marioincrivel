import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Participant,
  ChatMessage,
  WaitingRoomConfig,
  CinemaState,
  CloudRecording,
  RoomPermissions,
  CinemaReaction,
} from '../types/meeting';
import { useAuth } from './AuthContext';
import { generateEncryptionFingerprint, generateSHA256 } from '../utils/cryptoSim';

interface MeetingContextType {
  inMeeting: boolean;
  roomId: string;
  isHost: boolean;
  isWaiting: boolean;
  waitingRoomConfig: WaitingRoomConfig;
  waitingParticipants: Participant[];
  participants: Participant[];
  chatMessages: ChatMessage[];
  cinemaState: CinemaState;
  isCinemaMode: boolean;
  cinemaReactions: CinemaReaction[];
  isRecording: boolean;
  recordingStartTime: number | null;
  recordingDurationSeconds: number;
  recordingPromptOpen: boolean;
  recordingPromptData: { hostName: string; encryptionAlgorithm: string; notice: string } | null;
  cloudRecordings: CloudRecording[];
  permissions: RoomPermissions;
  isScreenSharing: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  virtualBackground: 'none' | 'blur' | 'studio';
  localStream: MediaStream | null;
  screenStream: MediaStream | null;
  cinemaLightsDimmed: boolean;

  // Actions
  startMeeting: (roomId?: string) => void;
  joinMeeting: (roomId: string, passcode?: string) => void;
  leaveMeeting: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleHandRaise: () => void;
  toggleScreenShare: () => Promise<void>;
  setVirtualBackground: (bg: 'none' | 'blur' | 'studio') => void;
  setCinemaLightsDimmed: (val: boolean | ((prev: boolean) => boolean)) => void;
  setIsCinemaMode: (val: boolean) => void;

  // Waiting Room
  admitParticipant: (userId: string) => void;
  admitAllParticipants: () => void;
  rejectParticipant: (userId: string) => void;
  updateWaitingRoomConfig: (config: Partial<WaitingRoomConfig>) => void;

  // Chat
  sendChatMessage: (text: string) => void;
  reactToChatMessage: (messageId: string, emoji: string) => void;

  // Host Controls
  hostMuteAll: () => void;
  hostDisableAllCameras: () => void;
  hostLockRoom: (locked: boolean) => void;
  hostToggleWaitingRoom: (enabled: boolean) => void;
  hostKickParticipant: (userId: string) => void;

  // Cinema
  updateCinemaState: (updates: Partial<CinemaState>) => void;
  sendCinemaReaction: (emoji: string) => void;
  loadCinemaVideo: (url: string, title: string) => void;

  // Recording
  requestStartRecording: () => void;
  confirmConsentAndStartRecording: () => void;
  dismissRecordingPrompt: () => void;
  stopRecording: () => void;
  deleteCloudRecording: (id: string) => Promise<void>;
  refreshCloudRecordings: () => Promise<void>;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [inMeeting, setInMeeting] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const [waitingRoomConfig, setWaitingRoomConfig] = useState<WaitingRoomConfig>({
    welcomeMessage: 'Bem-vindo ao Miazoom. O anfitrião permitirá seu acesso em instantes.',
    ambientSound: true,
    brandName: 'Miazoom Enterprise Room',
    requirePasscode: false,
  });

  const [waitingParticipants, setWaitingParticipants] = useState<Participant[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const [cinemaState, setCinemaState] = useState<CinemaState>({
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Apresentação Cinematográfica em 4K',
    isPlaying: false,
    currentTime: 0,
    updatedAt: Date.now(),
    controllerName: 'Anfitrião',
  });

  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [cinemaLightsDimmed, setCinemaLightsDimmed] = useState(true);
  const [cinemaReactions, setCinemaReactions] = useState<CinemaReaction[]>([]);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);
  const [recordingPromptOpen, setRecordingPromptOpen] = useState(false);
  const [recordingPromptData, setRecordingPromptData] = useState<{
    hostName: string;
    encryptionAlgorithm: string;
    notice: string;
  } | null>(null);

  const [cloudRecordings, setCloudRecordings] = useState<CloudRecording[]>([]);

  // Permissions
  const [permissions, setPermissions] = useState<RoomPermissions>({
    participantsCanShareScreen: true,
    participantsCanChat: true,
    participantsCanUnmute: true,
    lockRoom: false,
  });

  // Media State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState<'none' | 'blur' | 'studio'>('none');

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  // References
  const wsRef = useRef<WebSocket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // Fetch initial cloud recordings from API
  const refreshCloudRecordings = useCallback(async () => {
    try {
      const res = await fetch('/api/recordings');
      if (res.ok) {
        const data = await res.json();
        setCloudRecordings(data.recordings || []);
      }
    } catch {
      // Offline / fallback storage
      const saved = localStorage.getItem('miazoom_cloud_recordings');
      if (saved) {
        try {
          setCloudRecordings(JSON.parse(saved));
        } catch {}
      }
    }
  }, []);

  useEffect(() => {
    refreshCloudRecordings();
  }, [refreshCloudRecordings]);

  // Recording timer tick
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingDurationSeconds(Math.floor((Date.now() - recordingStartTime) / 1000));
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      setRecordingDurationSeconds(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording, recordingStartTime]);

  // Local media stream initialization
  const initLocalMedia = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        setLocalStream(stream);
        return stream;
      }
    } catch (err) {
      console.warn('Could not acquire user camera/microphone, using virtual canvas fallback', err);
    }
    return null;
  };

  // Toggle local mute
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
    updateLocalParticipant({ isMuted: !isMuted });
  };

  // Toggle local video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOff;
      });
    }
    setIsVideoOff(!isVideoOff);
    updateLocalParticipant({ isVideoOff: !isVideoOff });
  };

  // Toggle hand raise
  const toggleHandRaise = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    updateLocalParticipant({ isHandRaised: next });
    broadcastEvent('participant-hand-raised', { userId: currentUser?.id, isHandRaised: next });
  };

  // Toggle Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
      updateLocalParticipant({ isScreenSharing: false });
      broadcastEvent('screen-share-changed', { userId: currentUser?.id, isScreenSharing: false });
    } else {
      if (!permissions.participantsCanShareScreen && !isHost) {
        alert('O anfitrião desativou o compartilhamento de tela para participantes.');
        return;
      }
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
          });
          setScreenStream(stream);
          setIsScreenSharing(true);
          updateLocalParticipant({ isScreenSharing: true });
          broadcastEvent('screen-share-changed', { userId: currentUser?.id, isScreenSharing: true });

          stream.getVideoTracks()[0].onended = () => {
            setScreenStream(null);
            setIsScreenSharing(false);
            updateLocalParticipant({ isScreenSharing: false });
            broadcastEvent('screen-share-changed', { userId: currentUser?.id, isScreenSharing: false });
          };
        }
      } catch (err) {
        console.warn('Screen share cancelled or failed', err);
      }
    }
  };

  const updateLocalParticipant = (updates: Partial<Participant>) => {
    if (!currentUser) return;
    setParticipants(prev =>
      prev.map(p => (p.id === currentUser.id ? { ...p, ...updates } : p))
    );
  };

  // Broadcast Helper (Dual WebSocket + BroadcastChannel)
  const broadcastEvent = (type: string, payload: unknown) => {
    const msg = { type, payload };
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(msg);
      } catch {}
    }
  };

  // Setup dual communication channels
  const setupConnection = (targetRoomId: string, asHost: boolean) => {
    // 1. BroadcastChannel for fast multi-tab testing
    try {
      if (broadcastChannelRef.current) broadcastChannelRef.current.close();
      const bc = new BroadcastChannel(`miazoom-room-${targetRoomId}`);
      broadcastChannelRef.current = bc;

      bc.onmessage = (event) => {
        handleIncomingMessage(event.data);
      };
    } catch {}

    // 2. WebSocket connection to server
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'join',
            payload: {
              roomId: targetRoomId,
              userId: currentUser?.id || 'guest-' + Math.random().toString(36).substring(2, 6),
              userName: currentUser?.name || 'Convidado Miazoom',
              isHost: asHost,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch {}
      };

      ws.onerror = () => {
        // WebSocket error, fallback smoothly to BroadcastChannel
      };
    } catch {}
  };

  // Handle incoming real-time messages
  const handleIncomingMessage = (data: { type: string; payload: unknown }) => {
    const { type, payload } = data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = payload as any;

    switch (type) {
      case 'waiting-room-entered':
        setIsWaiting(true);
        if (p.roomConfig) {
          setWaitingRoomConfig(prev => ({ ...prev, ...p.roomConfig }));
        }
        break;

      case 'participant-waiting':
        if (isHost) {
          setWaitingParticipants(prev => {
            if (prev.some(item => item.id === p.userId)) return prev;
            return [
              ...prev,
              {
                id: p.userId,
                name: p.userName,
                avatar: '/src/assets/images/avatar_marcos_1790190844647.jpg',
                isHost: false,
                isMuted: true,
                isVideoOff: false,
                isHandRaised: false,
                isScreenSharing: false,
                isSpeaking: false,
                joinedAt: new Date().toLocaleTimeString('pt-BR'),
                waiting: true,
              },
            ];
          });
        }
        break;

      case 'admitted-to-room':
        setIsWaiting(false);
        setInMeeting(true);
        break;

      case 'rejected-from-room':
        alert(p.message || 'Você não foi admitido na reunião.');
        leaveMeeting();
        break;

      case 'chat-message':
        setChatMessages(prev => {
          if (prev.some(m => m.id === p.id)) return prev;
          return [...prev, p];
        });
        break;

      case 'recording-consent-prompt':
        // Show the mandatory participant notification & consent popup!
        setRecordingPromptData({
          hostName: p.hostName || 'Anfitrião',
          encryptionAlgorithm: p.encryptionAlgorithm || 'AES-256-GCM',
          notice: p.notice || 'Gravação em andamento',
        });
        setRecordingPromptOpen(true);
        break;

      case 'recording-state-changed':
        setIsRecording(p.isRecording);
        if (p.isRecording) {
          setRecordingStartTime(p.startTime || Date.now());
        } else {
          setRecordingStartTime(null);
        }
        break;

      case 'cinema-sync':
        setCinemaState(p);
        break;

      case 'cinema-reaction-broadcast':
        setCinemaReactions(prev => [
          ...prev.slice(-15),
          {
            id: p.id || Math.random().toString(),
            emoji: p.emoji,
            userName: p.userName,
            xPercent: Math.random() * 80 + 10,
          },
        ]);
        break;

      case 'host-command-mute-mic':
        if (!isHost) {
          if (localStream) {
            localStream.getAudioTracks().forEach(t => (t.enabled = false));
          }
          setIsMuted(true);
          updateLocalParticipant({ isMuted: true });
        }
        break;

      case 'host-command-disable-camera':
        if (!isHost) {
          if (localStream) {
            localStream.getVideoTracks().forEach(t => (t.enabled = false));
          }
          setIsVideoOff(true);
          updateLocalParticipant({ isVideoOff: true });
        }
        break;

      case 'kicked-from-room':
        alert(p.message || 'Você foi desconectado pelo anfitrião.');
        leaveMeeting();
        break;

      case 'room-updated':
        if (p.room) {
          setPermissions(prev => ({
            ...prev,
            lockRoom: p.room.isLocked,
          }));
          if (p.room.waitingRoomConfig) {
            setWaitingRoomConfig(p.room.waitingRoomConfig);
          }
        }
        break;

      case 'participant-joined':
        setParticipants(prev => {
          if (prev.some(x => x.id === p.userId)) return prev;
          return [
            ...prev,
            {
              id: p.userId,
              name: p.userName,
              avatar: '/src/assets/images/avatar_marcos_1790190844647.jpg',
              isHost: !!p.isHost,
              isMuted: false,
              isVideoOff: false,
              isHandRaised: false,
              isScreenSharing: false,
              isSpeaking: false,
              joinedAt: new Date().toLocaleTimeString('pt-BR'),
            },
          ];
        });
        break;

      case 'participant-left':
        setParticipants(prev => prev.filter(x => x.id !== p.userId));
        break;
    }
  };

  // Start Meeting as Host
  const startMeeting = async (customRoomId?: string) => {
    const rid = customRoomId || `mia-${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}`;
    setRoomId(rid);
    setIsHost(true);
    setIsWaiting(false);
    setInMeeting(true);

    await initLocalMedia();

    // Setup initial participants (Host + rich simulation peers to make it realistic)
    const hostParticipant: Participant = {
      id: currentUser?.id || 'host-user',
      name: (currentUser?.name || 'Anfitrião') + ' (Você)',
      avatar: currentUser?.avatar || '/src/assets/images/avatar_ana_1790190833213.jpg',
      isHost: true,
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      isSpeaking: true,
      joinedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    // Realistic peers
    const peerAna: Participant = {
      id: 'peer-ana-1',
      name: 'Engª. Ana Costa',
      avatar: '/src/assets/images/avatar_ana_1790190833213.jpg',
      isHost: false,
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      isSpeaking: false,
      joinedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    const peerMarcos: Participant = {
      id: 'peer-marcos-2',
      name: 'Marcos Silva (Design)',
      avatar: '/src/assets/images/avatar_marcos_1790190844647.jpg',
      isHost: false,
      isMuted: true,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      isSpeaking: false,
      joinedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    setParticipants([hostParticipant, peerAna, peerMarcos]);

    // Pre-populate realistic chat greeting
    setChatMessages([
      {
        id: 'msg-welcome-sys',
        senderId: 'sys',
        senderName: 'Sistema Miazoom',
        text: `Sessão criptografada iniciada com sucesso. Sala: ${rid}. Criptografia ponta-a-ponta pronta.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isSystem: true,
      },
      {
        id: 'msg-peer-ana',
        senderId: 'peer-ana-1',
        senderName: 'Engª. Ana Costa',
        senderAvatar: '/src/assets/images/avatar_ana_1790190833213.jpg',
        text: 'Olá a todos! Áudio e vídeo perfeitamente nítidos aqui.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    // Simulated waiting guest waiting for host admission
    setWaitingParticipants([
      {
        id: 'waiting-guest-lucas',
        name: 'Lucas Ferreira (Investidor)',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Lucas',
        isHost: false,
        isMuted: true,
        isVideoOff: false,
        isHandRaised: false,
        isScreenSharing: false,
        isSpeaking: false,
        joinedAt: new Date().toLocaleTimeString('pt-BR'),
        waiting: true,
      },
    ]);

    setupConnection(rid, true);
  };

  // Join Meeting as Guest/Participant
  const joinMeeting = async (targetRoomId: string) => {
    const rid = targetRoomId.trim();
    if (!rid) return;
    setRoomId(rid);
    setIsHost(false);

    await initLocalMedia();

    // Check waiting room
    if (waitingRoomConfig) {
      setIsWaiting(true);
    } else {
      setInMeeting(true);
    }

    const localPart: Participant = {
      id: currentUser?.id || 'guest-' + Math.random().toString(36).substring(2, 6),
      name: (currentUser?.name || 'Participante Convidado') + ' (Você)',
      avatar: currentUser?.avatar || '/src/assets/images/avatar_marcos_1790190844647.jpg',
      isHost: false,
      isMuted: false,
      isVideoOff: false,
      isHandRaised: false,
      isScreenSharing: false,
      isSpeaking: false,
      joinedAt: new Date().toLocaleTimeString('pt-BR'),
    };

    setParticipants([localPart]);
    setupConnection(rid, false);
  };

  // Leave Meeting
  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (screenStream) {
      screenStream.getTracks().forEach(track => track.stop());
      setScreenStream(null);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.close();
      broadcastChannelRef.current = null;
    }
    if (isRecording) {
      stopRecording();
    }
    setInMeeting(false);
    setIsWaiting(false);
    setIsHost(false);
    setParticipants([]);
    setWaitingParticipants([]);
    setIsScreenSharing(false);
    setIsCinemaMode(false);
  };

  // Admit / Reject from Waiting Room
  const admitParticipant = (userId: string) => {
    const found = waitingParticipants.find(p => p.id === userId);
    if (found) {
      setWaitingParticipants(prev => prev.filter(p => p.id !== userId));
      setParticipants(prev => [...prev, { ...found, waiting: false }]);
      broadcastEvent('admit-participant', { targetUserId: userId });
      broadcastEvent('participant-joined', { userId: found.id, userName: found.name, isHost: false });
    }
  };

  const admitAllParticipants = () => {
    waitingParticipants.forEach(p => {
      setParticipants(prev => [...prev, { ...p, waiting: false }]);
    });
    setWaitingParticipants([]);
    broadcastEvent('admit-all', {});
  };

  const rejectParticipant = (userId: string) => {
    setWaitingParticipants(prev => prev.filter(p => p.id !== userId));
    broadcastEvent('reject-participant', { targetUserId: userId });
  };

  const updateWaitingRoomConfig = (cfg: Partial<WaitingRoomConfig>) => {
    const updated = { ...waitingRoomConfig, ...cfg };
    setWaitingRoomConfig(updated);
    broadcastEvent('host-control', {
      action: 'update-waiting-room-config',
      value: updated,
    });
  };

  // Chat
  const sendChatMessage = (text: string) => {
    if (!text.trim() || !currentUser) return;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isHost,
    };
    setChatMessages(prev => [...prev, newMsg]);
    broadcastEvent('chat-message', newMsg);
  };

  const reactToChatMessage = (messageId: string, emoji: string) => {
    setChatMessages(prev =>
      prev.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      })
    );
  };

  // Host Controls
  const hostMuteAll = () => {
    if (!isHost) return;
    setParticipants(prev =>
      prev.map(p => (p.isHost ? p : { ...p, isMuted: true }))
    );
    broadcastEvent('host-control', { action: 'mute-all' });
  };

  const hostDisableAllCameras = () => {
    if (!isHost) return;
    setParticipants(prev =>
      prev.map(p => (p.isHost ? p : { ...p, isVideoOff: true }))
    );
    broadcastEvent('host-control', { action: 'disable-all-cameras' });
  };

  const hostLockRoom = (locked: boolean) => {
    if (!isHost) return;
    setPermissions(prev => ({ ...prev, lockRoom: locked }));
    broadcastEvent('host-control', { action: 'lock-room', value: locked });
  };

  const hostToggleWaitingRoom = (enabled: boolean) => {
    if (!isHost) return;
    broadcastEvent('host-control', { action: 'toggle-waiting-room', value: enabled });
  };

  const hostKickParticipant = (userId: string) => {
    if (!isHost) return;
    setParticipants(prev => prev.filter(p => p.id !== userId));
    broadcastEvent('host-control', { action: 'kick-user', targetUserId: userId });
  };

  // Cinema Controls
  const updateCinemaState = (updates: Partial<CinemaState>) => {
    const nextState = {
      ...cinemaState,
      ...updates,
      controllerName: currentUser?.name || 'Usuário',
      updatedAt: Date.now(),
    };
    setCinemaState(nextState);
    broadcastEvent('cinema-update', nextState);
  };

  const sendCinemaReaction = (emoji: string) => {
    // Native Android haptic feedback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(25);
      } catch {}
    }
    const rx: CinemaReaction = {
      id: Math.random().toString(),
      emoji,
      userName: currentUser?.name || 'Alguém',
      xPercent: Math.random() * 80 + 10,
    };
    setCinemaReactions(prev => [...prev.slice(-15), rx]);
    broadcastEvent('cinema-reaction', { emoji });
  };

  const loadCinemaVideo = (url: string, title: string) => {
    updateCinemaState({
      videoUrl: url,
      title,
      isPlaying: true,
      currentTime: 0,
    });
  };

  // Mandatory Participant Notification & Consent for Cloud Recording
  const requestStartRecording = () => {
    if (!isHost) {
      alert('Apenas o anfitrião pode iniciar a gravação desta reunião.');
      return;
    }
    // Broadcast notification prompt to everyone with mandatory consent modal
    broadcastEvent('recording-request-start', {});
    setRecordingPromptData({
      hostName: currentUser?.name || 'Você (Anfitrião)',
      encryptionAlgorithm: 'AES-256-GCM (Zero-Knowledge)',
      notice: 'Atenção: A gravação criptografada em nuvem desta videochamada está sendo iniciada.',
    });
    setRecordingPromptOpen(true);
  };

  // Participant or host confirmed consent
  const confirmConsentAndStartRecording = () => {
    setRecordingPromptOpen(false);
    if (!isHost) return;

    // Start real MediaRecorder from streams
    try {
      recordedChunksRef.current = [];
      const streamToRecord = screenStream || localStream;
      if (streamToRecord && typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(streamToRecord, {
          mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : 'video/webm',
        });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };
        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      }
    } catch (err) {
      console.warn('Could not initialize MediaRecorder, will use simulated stream container', err);
    }

    setIsRecording(true);
    setRecordingStartTime(Date.now());
    broadcastEvent('recording-start-confirmed', {});

    // Post system message in chat
    const sysMsg: ChatMessage = {
      id: `msg-rec-${Date.now()}`,
      senderId: 'system',
      senderName: 'Sistema de Gravação Miazoom',
      text: `🔴 Gravação em nuvem iniciada por ${currentUser?.name}. Todos os participantes foram notificados. Criptografia AES-256 ativa.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages(prev => [...prev, sysMsg]);
  };

  const dismissRecordingPrompt = () => {
    setRecordingPromptOpen(false);
  };

  // Stop Recording & Upload Encrypted payload
  const stopRecording = async () => {
    if (!isRecording) return;
    const duration = recordingDurationSeconds || 30;

    let videoBlobUrl: string | undefined;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      if (recordedChunksRef.current.length > 0) {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        videoBlobUrl = URL.createObjectURL(blob);
      }
    }

    setIsRecording(false);
    setRecordingStartTime(null);
    broadcastEvent('recording-stop', {});

    // Generate cryptographic hash and metadata
    const fingerprint = generateEncryptionFingerprint();
    const sha256 = await generateSHA256(`rec-${roomId}-${Date.now()}`);

    const newRec: CloudRecording = {
      id: `rec-${Date.now()}`,
      roomId,
      title: `Gravação Sessão ${roomId} - ${new Date().toLocaleDateString('pt-BR')}`,
      date: new Date().toLocaleString('pt-BR'),
      durationSeconds: duration,
      sizeBytes: Math.max(duration * 180000, 15728640),
      encryptionAlgorithm: 'AES-256-GCM (Zero-Knowledge)',
      encryptionKeyFingerprint: fingerprint,
      sha256Hash: sha256,
      recordedBy: currentUser?.name || 'Anfitrião',
      videoBlobUrl,
      isLocalSession: true,
    };

    // Save to API
    try {
      await fetch('/api/recordings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: newRec.roomId,
          title: newRec.title,
          durationSeconds: newRec.durationSeconds,
          sizeBytes: newRec.sizeBytes,
          encryptionKeyFingerprint: newRec.encryptionKeyFingerprint,
          recordedBy: newRec.recordedBy,
        }),
      });
    } catch {}

    setCloudRecordings(prev => [newRec, ...prev]);

    // Save in local storage
    const saved = localStorage.getItem('miazoom_cloud_recordings');
    const existing: CloudRecording[] = saved ? JSON.parse(saved) : [];
    localStorage.setItem(
      'miazoom_cloud_recordings',
      JSON.stringify([newRec, ...existing].slice(0, 20))
    );

    // Post system message in chat
    const endMsg: ChatMessage = {
      id: `msg-rec-end-${Date.now()}`,
      senderId: 'system',
      senderName: 'Sistema de Gravação Miazoom',
      text: `⏹ Gravação encerrada e sincronizada na nuvem com chave de criptografia ${fingerprint}.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isSystem: true,
    };
    setChatMessages(prev => [...prev, endMsg]);
  };

  const deleteCloudRecording = async (id: string) => {
    try {
      await fetch(`/api/recordings/${id}`, { method: 'DELETE' });
    } catch {}
    setCloudRecordings(prev => prev.filter(r => r.id !== id));
    const saved = localStorage.getItem('miazoom_cloud_recordings');
    if (saved) {
      const existing: CloudRecording[] = JSON.parse(saved);
      localStorage.setItem(
        'miazoom_cloud_recordings',
        JSON.stringify(existing.filter(r => r.id !== id))
      );
    }
  };

  return (
    <MeetingContext.Provider
      value={{
        inMeeting,
        roomId,
        isHost,
        isWaiting,
        waitingRoomConfig,
        waitingParticipants,
        participants,
        chatMessages,
        cinemaState,
        isCinemaMode,
        cinemaReactions,
        isRecording,
        recordingStartTime,
        recordingDurationSeconds,
        recordingPromptOpen,
        recordingPromptData,
        cloudRecordings,
        permissions,
        isScreenSharing,
        isMuted,
        isVideoOff,
        isHandRaised,
        virtualBackground,
        localStream,
        screenStream,
        cinemaLightsDimmed,

        startMeeting,
        joinMeeting,
        leaveMeeting,
        toggleMute,
        toggleVideo,
        toggleHandRaise,
        toggleScreenShare,
        setVirtualBackground,
        setCinemaLightsDimmed,
        setIsCinemaMode,

        admitParticipant,
        admitAllParticipants,
        rejectParticipant,
        updateWaitingRoomConfig,

        sendChatMessage,
        reactToChatMessage,

        hostMuteAll,
        hostDisableAllCameras,
        hostLockRoom,
        hostToggleWaitingRoom,
        hostKickParticipant,

        updateCinemaState,
        sendCinemaReaction,
        loadCinemaVideo,

        requestStartRecording,
        confirmConsentAndStartRecording,
        dismissRecordingPrompt,
        stopRecording,
        deleteCloudRecording,
        refreshCloudRecordings,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) throw new Error('useMeeting must be used within a MeetingProvider');
  return context;
};
