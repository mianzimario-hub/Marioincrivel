import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Camera,
  Upload,
  Sparkles,
  Check,
  LogOut,
  Save,
  Smile,
  MessageCircle,
} from 'lucide-react';
import { useAuth, DEFAULT_AVATARS } from '../context/AuthContext';

const ADDITIONAL_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Shadow',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Cyber',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Aura',
];

const FUN_STATUSES = [
  { emoji: '🍿', text: 'Vendo filme' },
  { emoji: '💬', text: 'Bater papo' },
  { emoji: '🎮', text: 'Jogando conversa fora' },
  { emoji: '🎧', text: 'Ouvindo som' },
  { emoji: '🔥', text: 'Só na resenha' },
  { emoji: '😂', text: 'Boas risadas' },
];

export const ProfileModal: React.FC = () => {
  const { currentUser, updateProfile, isProfileModalOpen, closeProfileModal, logout } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('🍿');
  const [avatar, setAvatar] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form state when modal opens or currentUser changes
  useEffect(() => {
    if (currentUser && isProfileModalOpen) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
      setBio(currentUser.bio || '');
      setStatusEmoji(currentUser.statusEmoji || '🍿');
      setAvatar(currentUser.avatar || DEFAULT_AVATARS[0]);
      setIsSaved(false);
    }
  }, [currentUser, isProfileModalOpen]);

  if (!isProfileModalOpen || !currentUser) return null;

  // Handle image upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma foto menor que 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateRandomAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      statusEmoji,
      avatar,
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      closeProfileModal();
    }, 900);
  };

  const allPresetAvatars = [...DEFAULT_AVATARS, ...ADDITIONAL_AVATARS];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-amber-500/30 bg-[#120c0a]/95 shadow-2xl backdrop-blur-xl text-amber-50 overflow-hidden">
        {/* Top Header in Red & Yellow */}
        <div className="flex items-center justify-between border-b border-amber-500/20 px-5 sm:px-6 py-4 bg-[#1a0f0a]/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 text-black font-bold shadow-md shadow-amber-500/20">
              <User className="h-5 w-5 text-black" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-display">
                Editar Perfil de Resenha
              </h3>
              <p className="text-[11px] text-amber-200/70">
                Personalize sua foto, nome e status para as conversas
              </p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-amber-500/25 bg-stone-900/60 p-4">
            <div className="relative group shrink-0">
              <img
                src={avatar}
                alt="Foto de perfil"
                className="h-20 w-20 sm:h-22 sm:w-22 rounded-full object-cover ring-2 ring-amber-400 shadow-lg shadow-amber-500/20"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-[10px] font-semibold"
                title="Mudar foto do dispositivo"
              >
                <Camera className="h-5 w-5 mb-0.5 text-amber-400" />
                <span>Trocar</span>
              </button>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-black text-xs ring-2 ring-[#120c0a]">
                <span>{statusEmoji}</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Foto do Celular/PC</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateRandomAvatar}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-600/20 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-600/30 hover:text-white transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  <span>Gerar Avatar</span>
                </button>
              </div>

              <p className="text-[11px] text-amber-200/60">
                Suba sua imagem preferida ou clique nos avatares da galera abaixo:
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Preset Avatars Selector */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-2">
              Escolher Avatar Rápido
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {allPresetAvatars.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(preset)}
                  className={`relative shrink-0 rounded-full transition-all cursor-pointer p-0.5 ${
                    avatar === preset
                      ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/30'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={preset}
                    alt={`Avatar ${idx}`}
                    className="h-10 w-10 sm:h-11 sm:w-11 rounded-full object-cover"
                  />
                  {avatar === preset && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-white text-[9px]">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status & Humor Selector */}
          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1.5 flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5 text-amber-400" />
              <span>Como você está hoje na resenha?</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FUN_STATUSES.map((item) => (
                <button
                  key={item.text}
                  type="button"
                  onClick={() => setStatusEmoji(item.emoji)}
                  className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-medium border transition-all cursor-pointer ${
                    statusEmoji === item.emoji
                      ? 'border-amber-400 bg-amber-500/20 text-amber-200 shadow-sm'
                      : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span className="truncate">{item.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields: Only Entertainment/Chat Identity */}
          <div className="space-y-3">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/80 mb-1">
                Nome ou Apelido na Resenha *
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-amber-500/60" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como a galera te chama?"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/80 mb-1">
                E-mail de Contato
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-amber-500/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 pl-9 pr-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Bio / Frase */}
            <div>
              <label className="block text-xs font-semibold text-amber-200/80 mb-1 flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-amber-400" />
                <span>Frase do Perfil / Resumo</span>
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ex: Pronto pro cinema, músicas boas e papo furado!"
                className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 px-3 text-xs sm:text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Account Logout Action */}
          <div className="flex items-center justify-between rounded-xl border border-stone-800 bg-stone-900/40 p-3 text-xs text-stone-400">
            <span className="text-[11px] text-stone-400">Perfil salvo no dispositivo</span>
            <button
              type="button"
              onClick={() => {
                logout();
                closeProfileModal();
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair da conta</span>
            </button>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-amber-500/20 px-5 sm:px-6 py-3.5 bg-[#1a0f0a]/90">
          <button
            type="button"
            onClick={closeProfileModal}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 px-5 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all cursor-pointer disabled:opacity-40"
          >
            {isSaved ? (
              <>
                <Check className="h-4 w-4 text-emerald-900" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
