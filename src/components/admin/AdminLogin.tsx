import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';
import { authService } from '../../lib/api';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => boolean;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [usedDemo, setUsedDemo] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setFormError(null);
    setUsedDemo(false);
    setIsLoading(true);

    try {
      const { data: resultData, error: resultError } =
        await authService.signIn(credentials.username.trim(), credentials.password);

      if (resultError) {
        setFormError(resultError.message);
        return;
      }
      if (!resultData) {
        setFormError('Réponse inattendue du service d’authentification.');
        return;
      }

      // Détection du mode démo (token factice structure header.{payload}.signature)
      if (/^header\.[^.]+\.signature$/.test(resultData.token)) {
        setUsedDemo(true);
      }

      localStorage.setItem('auth_token', resultData.token);
      // IMPORTANT: on passe les credentials (username + password) pour correspondre à App.tsx
      const loginSuccess = onLogin({ username: credentials.username.trim(), password: credentials.password });
      
      if (!loginSuccess) {
        setFormError('Identifiants incorrects');
        return;
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = credentials.username.trim() !== '' && credentials.password !== '' && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 dark:from-gray-900 dark:via-gray-950 dark:to-black flex items-center justify-center p-6 transition-colors">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center">
              <Sparkles className="text-white" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Administration</h1>
          <p className="text-white/80">FOULON Maxence - Portfolio</p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/30 transition-colors">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 transition-colors">Connexion</h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors">Accédez à votre espace d'administration</p>
          </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {formError}
                {/Serveur injoignable|Impossible de se connecter/i.test(formError) && (
                  <div className="mt-2 text-xs text-red-600 bg-red-100 border border-red-300 rounded p-2">
                    <strong>Diagnostic de connexion :</strong>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      <li>Vérifiez que le serveur backend est démarré sur le port 3001</li>
                      <li>Commande : <code className="bg-red-200 px-1 rounded">npm run server</code> dans un autre terminal</li>
                      <li>URL du backend : <code className="bg-red-200 px-1 rounded">{(import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001/api'}</code></li>
                      <li>En mode hors-ligne, utilisez <code className="bg-red-200 px-1 rounded">admin</code> / <code className="bg-red-200 px-1 rounded">password</code></li>
                    </ul>
                  </div>
                )}
              </div>
            )}

            {usedDemo && !formError && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-xl text-xs">
                Mode démo activé (auth locale). Lance un backend réel et utilise d’autres identifiants pour tester la vraie API.
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100"
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-gray-100"
                  placeholder="password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1 transition-colors"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition ${canSubmit ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/30' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isLoading && <Loader2 className="animate-spin" size={18} />}
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 transition-colors">
              Identifiants démo: <code className="font-semibold">admin</code> / <code className="font-semibold">password</code>
            </p>
          </form>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2024 FOULON Maxence. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;