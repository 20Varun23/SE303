// Varun
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CreateExam() {
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    difficulty: 'easy',
    totalQuestions: 5,
    duration: 15,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/examiner/exams', formData);
      alert('Exam created successfully!');
      navigate('/examiner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>Create Exam</h2>
        <button
          onClick={() => navigate('/examiner/dashboard')}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </nav>

      <div className='content'>
        <div className='form-container'>
          <h1>Create New Exam</h1>
          {error && <div className='error-message'>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label>Exam Title</label>
              <input
                type='text'
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className='form-group'>
              <label>Topic</label>
              <input
                type='text'
                name='topic'
                value={formData.topic}
                onChange={handleChange}
                placeholder='e.g., JavaScript fundamentals'
                required
              />
            </div>

            <div className='form-group'>
              <label>Difficulty Level</label>
              <select
                name='difficulty'
                value={formData.difficulty}
                onChange={handleChange}
              >
                <option value='easy'>Easy</option>
                <option value='medium'>Medium</option>
                <option value='hard'>Hard</option>
              </select>
            </div>

            <div className='form-group'>
              <label>Number of Questions</label>
              <input
                type='number'
                name='totalQuestions'
                value={formData.totalQuestions}
                onChange={handleChange}
                min='5'
                max='50'
                required
              />
            </div>

            <div className='form-group'>
              <label>Duration (minutes)</label>
              <input
                type='number'
                name='duration'
                value={formData.duration}
                onChange={handleChange}
                min='10'
                max='180'
                required
              />
            </div>

            <button type='submit' disabled={loading} className='btn-primary'>
              {loading ? 'Generating Questions with AI...' : 'Create Exam'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
