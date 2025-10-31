// Napa
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ExamResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      const response = await api.get('/student/results');
      setResults(response.data.data);
    } catch (error) {
      console.error('Fetch results error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>My Results</h2>
        <button
          onClick={() => navigate('/student/dashboard')}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </nav>

      <div className='content'>
        <h1>Exam Results</h1>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : results.length === 0 ? (
          <div className='empty-state'>
            <p>No results yet. Take an exam to see your scores!</p>
          </div>
        ) : (
          <div className='results-table'>
            <table>
              <thead>
                <tr>
                  <th>Exam Title</th>
                  <th>Topic</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.exams.title}</td>
                    <td>{result.exams.topic}</td>
                    <td>
                      {result.score}/{result.total_questions}
                    </td>
                    <td className={result.percentage >= 60 ? 'pass' : 'fail'}>
                      {result.percentage}%
                    </td>
                    <td>{result.time_taken} min</td>
                    <td>
                      {new Date(result.evaluated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
