import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { GradientBackground } from '../../common/ui';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalSessionTime, setTotalSessionTime] = useState<number | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const auth = getAuth();

  // Güvenlik sabitleri
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 dakika

  // Şifre güvenlik kontrolü
  const validatePassword = useCallback((password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Şifre en az 6 karakter olmalıdır');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Otomatik giriş kontrolü
  useEffect(() => {
    const checkAutoLogin = async () => {
      const currentUser = auth.currentUser;
      if (currentUser && user) {
        const lastLogin = new Date().toLocaleDateString('tr-TR');
        setWelcomeMessage(`Hoş geldin, ${user.displayName}! Son giriş: ${lastLogin}`);
        
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    };
    
    checkAutoLogin();
  }, [auth, user, navigate]);

  // Memoized values
  const buttonText = useMemo(() => ({
    submit: isLoading 
      ? (registerMode ? 'Kayıt olunuyor...' : 'Giriş yapılıyor...') 
      : (registerMode ? 'Kayıt Ol' : 'Giriş Yap'),
    toggle: registerMode ? 'Zaten hesabın var mı? Giriş Yap' : 'Hesabın yok mu? Kayıt Ol'
  }), [isLoading, registerMode]);

  const sessionTimeDisplay = useMemo(() => {
    if (totalSessionTime === null) return null;
    return `Tüm zamanlarda uygulamada geçirilen süre: ${Math.floor(totalSessionTime / 60)} dk`;
  }, [totalSessionTime]);

  // Event handlers
  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    handleError('');
    handleLoading(true);
    
    // Lockout kontrolü
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingTime = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
      handleError(`Çok fazla başarısız deneme. ${remainingTime} dakika bekleyin.`);
      handleLoading(false);
      return;
    }
    
    // Şifre güvenlik kontrolü (sadece kayıt modunda)
    if (registerMode) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        handleError(passwordValidation.errors.join(', '));
        handleLoading(false);
        return;
      }
    }
    
    try {
      const success = registerMode 
        ? await register(email, password, name)
        : await login(email, password, rememberMe);
        
      if (success) {
        setLoginAttempts(0);
        setLockoutUntil(null);
        navigate('/');
      } else {
        setLoginAttempts(prev => prev + 1);
        
        if (loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
          setLockoutUntil(Date.now() + LOCKOUT_DURATION);
          handleError('Çok fazla başarısız deneme. 15 dakika bekleyin.');
        } else {
          const errorMessage = registerMode 
            ? 'Kayıt başarısız. Bilgileri kontrol edin.' 
            : 'Giriş başarısız. Bilgileri kontrol edin.';
          handleError(errorMessage);
        }
      }
    } catch (err) {
      handleError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      handleLoading(false);
    }
  }, [registerMode, email, password, name, rememberMe, register, login, navigate, handleError, handleLoading, lockoutUntil, loginAttempts, validatePassword, LOCKOUT_DURATION]);

  const handleEmailChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setTotalSessionTime(null);
    handleError('');

    if (value && value.includes('@')) {
      handleLoading(true);
      try {
        const db = getFirestore();
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', value));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc?.data();
          const sessionTime = userData?.['totalSessionTime'] || userData?.['stats']?.totalSessionTime || 0;
          setTotalSessionTime(sessionTime);
        } else {
          setTotalSessionTime(null);
          handleError('Kullanıcı bulunamadı.');
        }
      } catch (err) {
        handleError('Bir hata oluştu.');
        setTotalSessionTime(null);
      }
      handleLoading(false);
    } else {
      setTotalSessionTime(null);
      handleError('');
    }
  }, [handleError, handleLoading]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }, []);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleToggleMode = useCallback(() => {
    setRegisterMode(!registerMode);
    handleError('');
  }, [registerMode, handleError]);

  const handleForgotPassword = useCallback(() => {
    alert('Şifremi unuttum fonksiyonu henüz geliştirilmedi.');
  }, []);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  return (
    <GradientBackground variant="auth" showParticles={true} particleCount={8}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <span>🎓</span>
            </div>
            <h1>YKS Quiz</h1>
            <p className="auth-title">Giriş Yap veya Kayıt Ol</p>
          </div>

          {welcomeMessage && (
            <div className="welcome-message">
              <span className="user-name">{welcomeMessage}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} autoComplete="on">
            {registerMode && (
              <div className="auth-form-group">
                <label htmlFor="name">Ad Soyad</label>
                <svg className="auth-form-icon name" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="Adınızı girin"
                  required
                />
              </div>
            )}
            
            <div className="auth-form-group">
              <label htmlFor="email">E-posta</label>
              <svg className="auth-form-icon email" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="ornek@email.com"
                required
                aria-describedby="email-help"
                aria-label="E-posta adresinizi girin"
              />
            </div>
            
            <div className="auth-form-group password-field">
              <label htmlFor="password">Şifre</label>
              <svg className="auth-form-icon password" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Şifrenizi girin"
                required
                aria-describedby="password-help"
                aria-label="Şifrenizi girin"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={handlePasswordToggle}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                )}
              </button>
            </div>
            
            {!registerMode && (
              <div className="remember-me-container">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="remember-me-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="remember-me-label">
                  Beni hatırla (30 gün)
                </label>
              </div>
            )}
            
            {!registerMode && (
              <div className="forgot-password-container">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => handleForgotPassword()}
                >
                  Şifremi unuttum
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="auth-btn-primary"
              disabled={isLoading}
            >
              {buttonText.submit}
            </button>
          </form>



          <div className="auth-toggle-container">
            <button
              type="button"
              className="auth-btn-link"
              onClick={handleToggleMode}
              disabled={isLoading}
            >
              {buttonText.toggle}
            </button>
          </div>

          <div className="auth-info">
            E-posta ile giriş/kayıt olabilirsiniz.
          </div>

          {isLoading && <div className="auth-loading">Süre yükleniyor...</div>}
          {sessionTimeDisplay && (
            <div className="auth-session-time">
              {sessionTimeDisplay}
            </div>
          )}
        </div>
      </div>
    </GradientBackground>
  );
};

export default Login; 