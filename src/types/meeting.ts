export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'host' | 'participant' | 'guest';
  statusEmoji?: string;
  bio?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isCoHost?: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  joinedAt: string;
  waiting?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  isHost?: boolean;
  isSystem?: boolean;
  reactions?: Record<string, number>;
}

export interface WaitingRoomConfig {
  welcomeMessage: string;
  ambientSound: boolean;
  brandName: string;
  requirePasscode: boolean;
}

export interface CinemaState {
  videoUrl: string;
  title: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  controllerName: string;
  mediaType?: 'video' | 'audio';
  fileName?: string;
  fileSize?: string;
  isLocalFile?: boolean;
}

export interface CloudRecording {
  id: string;
  roomId: string;
  title: string;
  date: string;
  durationSeconds: number;
  sizeBytes: number;
  encryptionAlgorithm: string;
  encryptionKeyFingerprint: string;
  sha256Hash: string;
  recordedBy: string;
  videoBlobUrl?: string;
  isLocalSession?: boolean;
}

export interface RoomPermissions {
  participantsCanShareScreen: boolean;
  participantsCanChat: boolean;
  participantsCanUnmute: boolean;
  lockRoom: boolean;
}

export interface CinemaReaction {
  id: string;
  emoji: string;
  userName: string;
  xPercent: number;
}
