import React, { useState } from 'react';
import './AuthScreen.css';

interface AuthScreenProps {
  onAuthenticated: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const CORRECT_PASSWORD = 'fV5KTuPVw@aF6wa!Td+k';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for security
    await new Promise(resolve => setTimeout(resolve, 800));

    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('kitt-auth', 'authenticated');
      localStorage.setItem('kitt-auth-time', Date.now().toString());
      onAuthenticated();
    } else {
      setError('Invalid password');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-container">
        <div className="kitt-logo">
          <div className="scanner-animation">
            <div className="scanner-line"></div>
            <div className="scanner-line"></div>
            <div className="scanner-line"></div>
          </div>
        </div>
        
        <h1>KITT VOICE SYSTEM</h1>
        <p>RESTRICTED ACCESS</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter security code"
              required
              disabled={isLoading}
              autoFocus
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button 
            type="submit" 
            disabled={isLoading || !password}
            className={`auth-button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? 'VALIDATING...' : 'AUTHENTICATE'}
          </button>
        </form>
        
        <div className="auth-footer">
          <div className="status-indicator"></div>
          <span>SYSTEM SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;