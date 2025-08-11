import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (credentials: { username: string; password: string }) => boolean;
}

const SimpleAdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setFormError(null);

    try {
      const loginSuccess = onLogin({ 
        username: credentials.username.trim(), 
        password: credentials.password 
      });
      
      if (!loginSuccess) {
        setFormError('Identifiants incorrects. Utilisez admin/password par défaut.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const canSubmit = credentials.username.trim() !== '' && credentials.password !== '' && !isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Lock className="text-blue-600" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Administration</h1>
            <p className="text-gray-600">Connectez-vous à votre panel admin</p>
          </div>

          {formError && (
            <div 
              className="bg-red-50 border-2 border-red-200 text-red-900 px-4 py-3 rounded-xl mb-6"
              role="alert"
              aria-live="assertive"
            >
              <p className="font-medium text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-800 mb-2">
                Nom d'utilisateur
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Identifiants par défaut: admin/password
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminLogin;