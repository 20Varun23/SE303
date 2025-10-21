import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Leaderboard() {
  const { examId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/examiner/exams/${examId}/leaderboard`);
      setLeaderboard(response.data.data);
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>Exam Leaderboard</h2>
        <button
          onClick={() => navigate('/examiner/dashboard')}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </nav>

      <div className='content'>
        <h1>Top Performers</h1>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : leaderboard.length === 0 ? (
          <div className='empty-state'>
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div className='leaderboard-table'>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student Name</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Time Taken</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? 'top-rank' : ''}>
                    <td className='rank'>
                      {index === 0}
                      {index === 1}
                      {index === 2}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td>{entry.users.name}</td>
                    <td>{entry.score}</td>
                    <td className={entry.percentage >= 60 ? 'pass' : 'fail'}>
                      {entry.percentage}%
                    </td>
                    <td>{entry.time_taken} min</td>
                    <td>{new Date(entry.evaluated_at).toLocaleDateString()}</td>
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
