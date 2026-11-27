import React, { FormEvent, useState } from 'react';
import RegistrationPopup from '../components/auth/RegistrationPopup';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { clearAuthError, loginUser } from '../store/auth/authSlice';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const dispatch = useAppDispatch();
  const { error, isLoggingIn } = useAppSelector((state) => state.auth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistrationOpen, setRegistrationOpen] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void dispatch(loginUser({ username, password })).then((result) => {
      if (loginUser.fulfilled.match(result)) onLoginSuccess();
    });
  };

  const openRegistration = () => {
    dispatch(clearAuthError());
    setRegistrationMessage('');
    setRegistrationOpen(true);
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-brand">
          <span className="brand__mark"><span /><span /><span /><span /></span>
          <span className="brand__name">orbit<span>crm</span></span>
        </div>
        <div className="auth-heading">
          <span className="eyebrow"><span className="eyebrow__dot" /> YOUR BUSINESS NETWORK</span>
          <h1 id="login-title">Welcome back</h1>
          <p>Sign in to continue to your workspace.</p>
        </div>
        {error && <div className="api-error auth-message" role="alert">{error}</div>}
        {registrationMessage && <div className="auth-success" role="status">{registrationMessage}</div>}
        <form className="auth-form" onSubmit={handleLogin}>
          <label className="form-field">
            <span>Username</span>
            <input
              autoComplete="username"
              autoFocus
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Password</span>
            <input
              autoComplete="current-password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="button button--primary auth-submit" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-register-prompt">
          New to Orbit CRM?{' '}
          <button className="auth-link" type="button" onClick={openRegistration}>
            Create an account
          </button>
        </p>
      </section>

      {isRegistrationOpen && (
        <RegistrationPopup
          onClose={() => setRegistrationOpen(false)}
          onRegistered={(registeredUsername) => {
            setUsername(registeredUsername);
            setRegistrationOpen(false);
            setRegistrationMessage('Account created. Sign in with your new credentials.');
          }}
        />
      )}
    </main>
  );
}

export default LoginPage;
