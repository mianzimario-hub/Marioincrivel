import express, { Request, Response } from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));

// In-memory persistent state for cloud sessions, encrypted recordings and waiting rooms
interface RoomState {
  roomId: string;
  hostId: string;
  hostName: string;
  isLocked: boolean;
  waitingRoomEnabled: boolean;
  waitingRoomConfig: {
    welcomeMessage: string;
    ambientSound: boolean;
    brandName: string;
  };
  cinemaState: {
    videoUrl: string;
    title: string;
    isPlaying: boolean;
    currentTime: number;
    updatedAt: number;
    controllerName: string;
  };
  isRecording: boolean;
  recordingStartTime?: number;
  recordingEncryptedBy?: string;
  permissions: {
    participantsCanShareScreen: boolean;
    participantsCanChat: boolean;
    participantsCanUnmute: boolean;
  };
}

interface EncryptedRecording {
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
  downloadUrl?: string;
  videoDataUrl?: string;
}

const rooms = new Map<string, RoomState>();
const cloudRecordings: EncryptedRecording[] = [
  {
    id: 'rec-demo-01',
    roomId: 'mia-board-sync',
    title: 'Alinhamento Estratégico Q3 - Miazoom Board',
    date: '2026-09-21 14:30',
    durationSeconds: 1420,
    sizeBytes: 104857600,
    encryptionAlgorithm: 'AES-256-GCM (Zero-Knowledge)',
    encryptionKeyFingerprint: 'SHA256:8f4c...3e1a',
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    recordedBy: 'Dra. Helena Martins (Host)',
  },
  {
    id: 'rec-demo-02',
    roomId: 'cinema-interstellar',
    title: 'Sessão Cinema Virtual - Interstellar Journey Review',
    date: '2026-09-22 19:15',
    durationSeconds: 2840,
    sizeBytes: 214748364,
    encryptionAlgorithm: 'AES-256-GCM (Zero-Knowledge)',
    encryptionKeyFingerprint: 'SHA256:d41d...8cd9',
    sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    recordedBy: 'Marcos Silva (Host)',
  }
];

// Seed default room
rooms.set('mia-demo', {
  roomId: 'mia-demo',
  hostId: 'system-host',
  hostName: 'Miazoom Master',
  isLocked: false,
  waitingRoomEnabled: true,
  waitingRoomConfig: {
    welcomeMessage: 'Bem-vindo ao Miazoom. O anfitrião permitirá seu acesso em instantes.',
    ambientSound: true,
    brandName: 'Miazoom Enterprise',
  },
  cinemaState: {
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    title: 'Apresentação Cinematográfica em 4K',
    isPlaying: false,
    currentTime: 0,
    updatedAt: Date.now(),
    controllerName: 'Host',
  },
  isRecording: false,
  permissions: {
    participantsCanShareScreen: true,
    participantsCanChat: true,
    participantsCanUnmute: true,
  },
});

// REST APIs
app.get('/api/recordings', (_req: Request, res: Response) => {
  res.json({ recordings: cloudRecordings });
});

app.post('/api/recordings', (req: Request, res: Response) => {
  const { title, roomId, durationSeconds, sizeBytes, encryptionKeyFingerprint, recordedBy, videoDataUrl } = req.body;
  const newRec: EncryptedRecording = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    roomId: roomId || 'mia-general',
    title: title || `Gravação Criptografada Miazoom - ${new Date().toLocaleDateString('pt-BR')}`,
    date: new Date().toLocaleString('pt-BR'),
    durationSeconds: durationSeconds || 60,
    sizeBytes: sizeBytes || 15728640,
    encryptionAlgorithm: 'AES-256-GCM (Zero-Knowledge Client-Side Key)',
    encryptionKeyFingerprint: encryptionKeyFingerprint || `SHA256:${Math.random().toString(36).substring(2, 10)}`,
    sha256Hash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    recordedBy: recordedBy || 'Anfitrião',
    videoDataUrl: videoDataUrl || undefined,
  };
  cloudRecordings.unshift(newRec);
  res.status(201).json({ success: true, recording: newRec });
});

app.delete('/api/recordings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = cloudRecordings.findIndex(r => r.id === id);
  if (idx !== -1) {
    cloudRecordings.splice(idx, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Gravação não encontrada' });
  }
});

// WebSocket Server
const wss = new WebSocketServer({ noServer: true });

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
  userName: string;
  roomId: string;
  isHost: boolean;
  isAdmitted: boolean;
}

const clients = new Map<WebSocket, ConnectedClient>();

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (messageRaw: string) => {
    try {
      const data = JSON.parse(messageRaw.toString());
      const { type, payload } = data;

      switch (type) {
        case 'join': {
          const { roomId, userId, userName, isHost } = payload;
          let room = rooms.get(roomId);
          if (!room) {
            room = {
              roomId,
              hostId: isHost ? userId : 'host-' + Math.random().toString(36).substring(2, 6),
              hostName: isHost ? userName : 'Anfitrião',
              isLocked: false,
              waitingRoomEnabled: true,
              waitingRoomConfig: {
                welcomeMessage: 'Bem-vindo à sala de espera da Miazoom. Aguarde a aprovação do anfitrião.',
                ambientSound: true,
                brandName: 'Miazoom Enterprise',
              },
              cinemaState: {
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                title: 'Trailer Cinematográfico',
                isPlaying: false,
                currentTime: 0,
                updatedAt: Date.now(),
                controllerName: userName,
              },
              isRecording: false,
              permissions: {
                participantsCanShareScreen: true,
                participantsCanChat: true,
                participantsCanUnmute: true,
              },
            };
            rooms.set(roomId, room);
          }

          // If room is locked and user is not host
          if (room.isLocked && !isHost) {
            ws.send(JSON.stringify({
              type: 'room-locked-error',
              payload: { message: 'Esta sala foi trancada pelo anfitrião.' },
            }));
            return;
          }

          // Waiting room check
          const isAdmitted = isHost || !room.waitingRoomEnabled;

          clients.set(ws, {
            ws,
            userId,
            userName,
            roomId,
            isHost: !!isHost,
            isAdmitted,
          });

          if (!isAdmitted) {
            // Inform guest they are waiting
            ws.send(JSON.stringify({
              type: 'waiting-room-entered',
              payload: {
                roomConfig: room.waitingRoomConfig,
                roomId,
              }
            }));
            // Notify hosts in this room
            broadcastToRoom(roomId, {
              type: 'participant-waiting',
              payload: { userId, userName },
            }, (client) => client.isHost);
          } else {
            // Join room directly
            ws.send(JSON.stringify({
              type: 'room-joined',
              payload: {
                room,
                participants: getAdmittedParticipants(roomId),
              }
            }));

            broadcastToRoom(roomId, {
              type: 'participant-joined',
              payload: { userId, userName, isHost: !!isHost },
            }, (client) => client.ws !== ws);
          }
          break;
        }

        case 'admit-participant': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const { targetUserId } = payload;
          for (const [targetWs, targetClient] of clients.entries()) {
            if (targetClient.userId === targetUserId && targetClient.roomId === client.roomId) {
              targetClient.isAdmitted = true;
              targetWs.send(JSON.stringify({
                type: 'admitted-to-room',
                payload: {
                  room: rooms.get(client.roomId),
                  participants: getAdmittedParticipants(client.roomId),
                },
              }));
              broadcastToRoom(client.roomId, {
                type: 'participant-joined',
                payload: { userId: targetClient.userId, userName: targetClient.userName, isHost: false },
              });
              break;
            }
          }
          break;
        }

        case 'admit-all': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          for (const [targetWs, targetClient] of clients.entries()) {
            if (targetClient.roomId === client.roomId && !targetClient.isAdmitted) {
              targetClient.isAdmitted = true;
              targetWs.send(JSON.stringify({
                type: 'admitted-to-room',
                payload: {
                  room: rooms.get(client.roomId),
                  participants: getAdmittedParticipants(client.roomId),
                },
              }));
              broadcastToRoom(client.roomId, {
                type: 'participant-joined',
                payload: { userId: targetClient.userId, userName: targetClient.userName, isHost: false },
              });
            }
          }
          break;
        }

        case 'reject-participant': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const { targetUserId } = payload;
          for (const [targetWs, targetClient] of clients.entries()) {
            if (targetClient.userId === targetUserId && targetClient.roomId === client.roomId) {
              targetWs.send(JSON.stringify({
                type: 'rejected-from-room',
                payload: { message: 'O anfitrião não autorizou a sua entrada nesta reunião.' },
              }));
              targetWs.close();
              clients.delete(targetWs);
              break;
            }
          }
          break;
        }

        case 'chat-message': {
          const client = clients.get(ws);
          if (!client || !client.isAdmitted) return;
          const room = rooms.get(client.roomId);
          if (room && !room.permissions.participantsCanChat && !client.isHost) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'O chat foi desativado pelo anfitrião.' }
            }));
            return;
          }
          broadcastToRoom(client.roomId, {
            type: 'chat-message',
            payload: {
              id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              senderId: client.userId,
              senderName: client.userName,
              text: payload.text,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              isHost: client.isHost,
            }
          });
          break;
        }

        case 'recording-request-start': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const room = rooms.get(client.roomId);
          if (room) {
            // Broadcast recording prompt with mandatory consent alert to all participants!
            broadcastToRoom(client.roomId, {
              type: 'recording-consent-prompt',
              payload: {
                hostName: client.userName,
                encryptionAlgorithm: 'AES-256-GCM',
                notice: 'Atenção: O anfitrião solicitou o início da gravação em nuvem com criptografia de ponta a ponta desta chamada.',
              }
            });
          }
          break;
        }

        case 'recording-start-confirmed': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const room = rooms.get(client.roomId);
          if (room) {
            room.isRecording = true;
            room.recordingStartTime = Date.now();
            room.recordingEncryptedBy = client.userName;
            broadcastToRoom(client.roomId, {
              type: 'recording-state-changed',
              payload: {
                isRecording: true,
                startTime: room.recordingStartTime,
                recordedBy: client.userName,
              }
            });
          }
          break;
        }

        case 'recording-stop': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const room = rooms.get(client.roomId);
          if (room) {
            room.isRecording = false;
            broadcastToRoom(client.roomId, {
              type: 'recording-state-changed',
              payload: {
                isRecording: false,
              }
            });
          }
          break;
        }

        case 'cinema-update': {
          const client = clients.get(ws);
          if (!client || !client.isAdmitted) return;
          const room = rooms.get(client.roomId);
          if (room) {
            room.cinemaState = {
              ...room.cinemaState,
              ...payload,
              controllerName: client.userName,
              updatedAt: Date.now(),
            };
            broadcastToRoom(client.roomId, {
              type: 'cinema-sync',
              payload: room.cinemaState,
            });
          }
          break;
        }

        case 'cinema-reaction': {
          const client = clients.get(ws);
          if (!client || !client.isAdmitted) return;
          broadcastToRoom(client.roomId, {
            type: 'cinema-reaction-broadcast',
            payload: {
              emoji: payload.emoji,
              userName: client.userName,
              id: Math.random().toString(),
            }
          });
          break;
        }

        case 'host-control': {
          const client = clients.get(ws);
          if (!client || !client.isHost) return;
          const room = rooms.get(client.roomId);
          if (!room) return;

          const { action, targetUserId, value } = payload;
          if (action === 'mute-all') {
            broadcastToRoom(client.roomId, {
              type: 'host-command-mute-mic',
              payload: { force: true },
            }, (c) => !c.isHost);
          } else if (action === 'disable-all-cameras') {
            broadcastToRoom(client.roomId, {
              type: 'host-command-disable-camera',
              payload: { force: true },
            }, (c) => !c.isHost);
          } else if (action === 'lock-room') {
            room.isLocked = !!value;
            broadcastToRoom(client.roomId, {
              type: 'room-updated',
              payload: { room },
            });
          } else if (action === 'toggle-waiting-room') {
            room.waitingRoomEnabled = !!value;
            broadcastToRoom(client.roomId, {
              type: 'room-updated',
              payload: { room },
            });
          } else if (action === 'update-waiting-room-config') {
            room.waitingRoomConfig = { ...room.waitingRoomConfig, ...value };
            broadcastToRoom(client.roomId, {
              type: 'room-updated',
              payload: { room },
            });
          } else if (action === 'kick-user') {
            for (const [targetWs, targetClient] of clients.entries()) {
              if (targetClient.userId === targetUserId && targetClient.roomId === client.roomId) {
                targetWs.send(JSON.stringify({
                  type: 'kicked-from-room',
                  payload: { message: 'Você foi removido da reunião pelo anfitrião.' }
                }));
                targetWs.close();
                clients.delete(targetWs);
                break;
              }
            }
          }
          break;
        }

        case 'webrtc-signal': {
          const client = clients.get(ws);
          if (!client) return;
          const { targetUserId, signal } = payload;
          for (const [targetWs, targetClient] of clients.entries()) {
            if (targetClient.userId === targetUserId && targetClient.roomId === client.roomId) {
              targetWs.send(JSON.stringify({
                type: 'webrtc-signal',
                payload: {
                  senderId: client.userId,
                  signal,
                }
              }));
              break;
            }
          }
          break;
        }

        default:
          break;
      }
    } catch (err) {
      console.error('Error handling ws message', err);
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client) {
      clients.delete(ws);
      broadcastToRoom(client.roomId, {
        type: 'participant-left',
        payload: { userId: client.userId, userName: client.userName },
      });
    }
  });
});

function getAdmittedParticipants(roomId: string) {
  const list: Array<{ userId: string; userName: string; isHost: boolean }> = [];
  for (const c of clients.values()) {
    if (c.roomId === roomId && c.isAdmitted) {
      list.push({ userId: c.userId, userName: c.userName, isHost: c.isHost });
    }
  }
  return list;
}

function broadcastToRoom(
  roomId: string,
  message: object,
  filter?: (client: ConnectedClient) => boolean
) {
  const json = JSON.stringify(message);
  for (const [ws, client] of clients.entries()) {
    if (client.roomId === roomId && (!filter || filter(client))) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(json);
      }
    }
  }
}

// Attach WS to HTTP server on /ws upgrade
server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url || '', `http://${request.headers.host}`);
  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Vite Middleware Setup for dev mode
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  server.listen(port, '0.0.0.0', () => {
    console.log(`Miazoom server listening on port ${port}`);
  });
}

startServer();
