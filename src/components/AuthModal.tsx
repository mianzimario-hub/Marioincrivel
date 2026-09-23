import React, { useState } from 'react';
import { X, Lock, Mail, User, Check, Sparkles, Smile } from 'lucide-react';
import { useAuth, DEFAULT_AVATARS } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [statusEmoji, setStatusEmoji] = useState('🍿');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (authMode === 'login') {
      if (!email) {
        setIsLoading(false);
        return;
      }
      await login(email);
    } else {
      if (!name || !email) {
        setIsLoading(false);
        return;
      }
      await signup({
        name,
        email,
        avatar: selectedAvatar,
        role: 'host',
        statusEmoji,
        bio: 'Pronto para resenha e conversas!',
      });
    }

    setIsLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setIsLoading(true);
    await login(userEmail);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-amber-500/30 bg-[#140d0a] p-6 shadow-2xl text-amber-50">
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header in Red & Yellow */}
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-yellow-400 shadow-lg shadow-amber-500/20 text-black">
            <Smile className="h-6 w-6 text-black" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">
            {authMode === 'login' ? 'Entrar no Miazoom' : 'Criar Perfil de Resenha'}
          </h2>
          <p className="mt-1 text-xs text-amber-200/70">
            {authMode === 'login'
              ? 'Conecte-se para bater papo e curtir vídeos com amigos'
              : 'Monte seu perfil e venha papear na sala'}
          </p>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mb-5 rounded-2xl border border-amber-500/20 bg-stone-900/60 p-3">
          <div className="flex items-center justify-between text-xs text-amber-200/80 mb-2">
            <span>Acesso rápido de teste</span>
            <span className="text-[10px] text-amber-400 font-bold">1 toque</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('helena@resenha.app')}
              className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/80 p-2 text-left hover:border-amber-400/50 hover:bg-stone-800 transition-all text-xs cursor-pointer"
            >
              <img
                src="/src/assets/images/avatar_ana_1790190833213.jpg"
                alt="Helena"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-amber-400"
              />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Helena M.</p>
                <p className="text-[10px] text-amber-400 truncate">🍿 Vendo filme</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('marcos@resenha.app')}
              className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/80 p-2 text-left hover:border-red-500/50 hover:bg-stone-800 transition-all text-xs cursor-pointer"
            >
              <img
                src="/src/assets/images/avatar_marcos_1790190844647.jpg"
                alt="Marcos"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-red-400"
              />
              <div className="truncate">
                <p className="font-semibold text-white truncate">Marcos Silva</p>
                <p className="text-[10px] text-red-400 truncate">🎮 Jogando papo</p>
              </div>
            </button>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="mb-4 flex rounded-xl bg-stone-900/90 p-1 border border-stone-800">
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-amber-500 text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Fazer Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('signup')}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              authMode === 'signup'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Criar Conta
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-amber-200/80 mb-1">
                  Seu Nome ou Apelido *
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-amber-500/60" />
                  <input
                    type="text"
                    required
                    placeholder="Ex: Pedrinho, Carol, DJ Leo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-semibold text-amber-200/80 mb-1.5">
                  Escolha um Avatar
                </label>
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                  {DEFAULT_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`relative rounded-full p-0.5 transition-all cursor-pointer shrink-0 ${
                        selectedAvatar === av
                          ? 'ring-2 ring-amber-400 scale-105 shadow-md shadow-amber-500/30'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={av}
                        alt="Avatar"
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      {selectedAvatar === av && (
                        <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[8px] text-white font-bold">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-amber-500/60" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-200/80 mb-1">
              Senha
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-amber-500/60" />
              <input
                type="password"
                required
                placeholder="••••••••"
                defaultValue="miazoom-divertido"
                className="w-full rounded-xl border border-stone-700 bg-stone-900/90 py-2.5 pl-9 pr-3 text-sm text-white placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {isLoading ? 'Conectando...' : authMode === 'login' ? 'Entrar e Bater Papo' : 'Criar Perfil e Começar'}
          </button>
        </form>
      </div>
    </div>
  );
};
