import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaGithub } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch {
      setErrors({ general: 'Registration failed. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className={styles.authForm}>
      <div className={styles.formHeader}>
        <h2>Create Account</h2>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>

      <div className={styles.socialBtns}>
        <button className={styles.socialBtn}><FaGoogle style={{ color: '#DB4437' }} /> Google</button>
        <button className={styles.socialBtn}><FaGithub /> GitHub</button>
      </div>

      <div className={styles.divider}><span>or register with email</span></div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Full Name</label>
          <div className={styles.inputWrapper}>
            <FaUser className={styles.inputIcon} />
            <input type="text" className={`${styles.input} ${errors.name ? styles.error : ''}`}
              placeholder="John Doe" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Email Address</label>
          <div className={styles.inputWrapper}>
            <FaEnvelope className={styles.inputIcon} />
            <input type="email" className={`${styles.input} ${errors.email ? styles.error : ''}`}
              placeholder="you@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          {errors.email && <span className={styles.errorText}>{errors.email}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.inputIcon} />
            <input type={showPassword ? 'text' : 'password'}
              className={`${styles.input} ${errors.password ? styles.error : ''}`}
              placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
            <span className={styles.passwordToggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errors.password && <span className={styles.errorText}>{errors.password}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>Confirm Password</label>
          <div className={styles.inputWrapper}>
            <FaLock className={styles.inputIcon} />
            <input type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
              placeholder="••••••••" value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading} style={{ marginTop: 'var(--space-4)' }}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
