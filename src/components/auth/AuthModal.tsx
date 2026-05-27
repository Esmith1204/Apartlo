import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import Modal from '../ui/Modal';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const reset = () => { setName(''); setEmail(''); setPassword(''); setError(''); setLoading(false); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (tab === 'register' && !name) { setError('Please enter your name.'); return; }
    setLoading(true);
    try {
      if (tab === 'login') await login(email, password);
      else await register(name, email, password);
      handleClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="440px">
      <div className="auth-modal">
        {/* Header */}
        <div className="auth-logo">
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16 3L2 14h4v15h8v-9h4v9h8V14h4L16 3z" fill="url(#authLogoGrad)" />
            <circle cx="24" cy="24" r="6" fill="var(--bg)" />
            <path d="M24 20.5c-1.5-1.5-4 .5-4 2.5 0 1.5 1.5 2.5 4 4 2.5-1.5 4-2.5 4-4 0-2-2.5-4-4-2.5z" fill="#ff6b6b" />
            <defs>
              <linearGradient id="authLogoGrad" x1="2" y1="3" x2="30" y2="29" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c6ff7" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="auth-title">{tab === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-subtitle">{tab === 'login' ? 'Sign in to access your bookmarks and saved searches.' : 'Start your student housing search today.'}</p>

        {/* Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            id="auth-tab-login"
            role="tab"
            aria-selected={tab === 'login'}
            className={`auth-tab ${tab === 'login' ? 'auth-tab-active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            id="auth-tab-register"
            role="tab"
            aria-selected={tab === 'register'}
            className={`auth-tab ${tab === 'register' ? 'auth-tab-active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>


        {/* Form */}
        <form id="auth-form" onSubmit={handleSubmit} className="auth-form" noValidate>
          {tab === 'register' && (
            <div className="form-field">
              <label htmlFor="auth-name" className="form-label">Full Name</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  id="auth-name"
                  type="text"
                  className="form-input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="auth-email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="auth-password" className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                id="auth-password"
                type={showPass ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass(s => !s)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </Modal>
  );
}
