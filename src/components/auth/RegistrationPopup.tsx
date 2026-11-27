import React, { FormEvent } from 'react';
import Icon from '../ui/Icon';
import Popup from '../ui/Popup';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { RegistrationDetails } from '../../services/authApi';
import { registerUser } from '../../store/auth/authSlice';

interface RegistrationPopupProps {
  onClose: () => void;
  onRegistered: (username: string) => void;
}

function RegistrationPopup({ onClose, onRegistered }: RegistrationPopupProps) {
  const dispatch = useAppDispatch();
  const { error, isRegistering } = useAppSelector((state) => state.auth);

  const handleRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const details: RegistrationDetails = {
      username: String(formData.get('username')),
      email: String(formData.get('email')),
      password: String(formData.get('password')),
    };

    void dispatch(registerUser(details)).then((result) => {
      if (registerUser.fulfilled.match(result)) {
        onRegistered(details.username);
      }
    });
  };

  return (
    <Popup labelledBy="register-title" onClose={onClose}>
      <div className="auth-register">
        <div className="record-form__top">
          <span className="record-form__icon"><Icon name="users" size={21} /></span>
          <button
            className="icon-button"
            type="button"
            aria-label="Close registration"
            onClick={onClose}
          >
            <Icon name="close" size={19} />
          </button>
        </div>
        <h2 id="register-title">Create your account</h2>
        <p className="record-form__description">Set up an account to access your CRM workspace.</p>
        {error && <div className="api-error auth-message" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleRegistration}>
          <label className="form-field">
            <span>Username</span>
            <input
              autoComplete="username"
              name="username"
              pattern="[A-Za-z0-9._-]{3,32}"
              required
              title="Use 3–32 letters, numbers, periods, underscores, or hyphens."
            />
          </label>
          <label className="form-field">
            <span>Email address</span>
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label className="form-field">
            <span>Password (12–72 characters)</span>
            <input
              autoComplete="new-password"
              maxLength={72}
              minLength={12}
              name="password"
              required
              type="password"
            />
          </label>
          <div className="record-form__footer">
            <button className="button button--secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="button button--primary" type="submit" disabled={isRegistering}>
              {isRegistering ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </Popup>
  );
}

export default RegistrationPopup;
