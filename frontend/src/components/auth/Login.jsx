// Suvarna
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    const user = await login(email, password);
    if (user.role === 'examiner') {
      navigate('/examiner/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  } catch (err) {
    // More robust error handling
    console.error('Login error:', err);
    
    let errorMessage = 'Login failed';
    
    if (err.response) {
      // Server responded with error
      errorMessage = err.response.data?.message || err.response.data?.error || errorMessage;
    } else if (err.request) {
      // Request made but no response
      errorMessage = 'No response from server. Please check your connection.';
    } else {
      // Something else happened
      errorMessage = err.message || errorMessage;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='auth-container'>
      <div className='auth-card'>
        <h1>Login</h1>
        {error && <div className='error-message'>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='form-group'>
            <label>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type='submit' disabled={loading} className='btn-primary'>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className='auth-link'>
          Don't have an account? <Link to='/register'>Register</Link>
        </p>
      </div>
    </div>
  );
}
