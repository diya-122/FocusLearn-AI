import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Login failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className={styles.authForm}>
      <div className={styles.formHeader}>
        <h2>Welcome Back</h2>
        <p>Don&apos;t have an account? <Link to="/register">Sign up</Link></p>
      </div>

      <div className={styles.socialBtns}>
        <button className={styles.socialBtn}>
          <FaGoogle style={{ color: '#DB4437' }} /> Google
        </button>
        <button className={styles.socialBtn}>
          <FaGithub /> GitHub
        </button>
      </div>

      <div className={styles.divider}><span>or continue with email</span></div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <FaEnvelope className={styles.inputIcon} />
            <input
              type="email"
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <span className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={styles.formOptions}>
          <label className={styles.remember}>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#" className={styles.forgotLink}>Forgot Password?</a>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
