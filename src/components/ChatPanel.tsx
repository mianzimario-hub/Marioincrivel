import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Smile, Shield, Sparkles } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_EMOJIS = ['👍', '👏', '❤️', '🔥', '🚀', '😂'];

export const ChatPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const { chatMessages, sendChatMessage, reactToChatMessage, permissions, isHost } = useMeeting();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText('');
  };

  const handleQuickReaction = (emoji: string) => {
    setInputText((prev) => prev + ' ' + emoji);
    setShowEmojiPicker(false);
  };

  const canChat = isHost || permissions.participantsCanChat;

  return (
    <div className="flex h-full w-80 md:w-96 flex-col border-l border-slate-800 bg-[#0b0f19] shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
        <div>
          <h3 className="text-sm font-bold text-white font-display">Bate-papo da Reunião</h3>
          <p className="text-[11px] text-slate-400">Mensagens instantâneas criptografadas</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-2 text-center text-xs text-blue-300"
              >
                <p className="leading-relaxed">{msg.text}</p>
                <span className="text-[10px] text-blue-400/70 block mt-1 font-mono">
                  {msg.timestamp}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className="group flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-200">{msg.senderName}</span>
                  {msg.isHost && (
                    <span className="flex items-center gap-0.5 rounded-md bg-blue-600/10 px-1.5 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/20">
                      <Shield className="h-2.5 w-2.5" /> Host
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
              </div>

              <div className="relative rounded-xl border border-slate-800/80 bg-slate-900/60 p-2.5 text-xs text-slate-200">
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Reactions on this message */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(msg.reactions).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300 border border-slate-700"
                      >
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}

                {/* Hover Quick Reaction Buttons */}
                <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-0.5 rounded-lg bg-slate-800 p-0.5 shadow-md">
                  {QUICK_EMOJIS.slice(0, 3).map((e) => (
                    <button
                      key={e}
                      onClick={() => reactToChatMessage(msg.id, e)}
                      className="h-5 w-5 text-xs hover:scale-120 transition-transform cursor-pointer"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Mention Suggestions */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 border-t border-slate-800/60 text-[11px] text-slate-400 bg-slate-950/40">
        <span className="text-slate-500">Mencionar:</span>
        <button
          onClick={() => setInputText((prev) => prev + '@todos ')}
          className="hover:text-blue-400 transition-colors cursor-pointer"
        >
          @todos
        </button>
        <span>·</span>
        <button
          onClick={() => setInputText((prev) => prev + '@anfitriao ')}
          className="hover:text-red-400 transition-colors cursor-pointer"
        >
          @anfitriao
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-3 bg-slate-950">
        {!canChat ? (
          <p className="text-center text-xs text-red-400 py-2">
            O envio de mensagens foi desativado pelo anfitrião.
          </p>
        ) : (
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-slate-400 hover:text-blue-400 transition-colors p-1 cursor-pointer"
            >
              <Smile className="h-5 w-5" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 flex gap-1.5 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-xl z-20">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => handleQuickReaction(em)}
                    className="text-lg hover:scale-125 transition-transform cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}

            <input
              type="text"
              placeholder="Digite uma mensagem..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md shadow-red-600/20 hover:from-red-500 hover:to-blue-500 transition-all disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
