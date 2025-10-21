// Napa
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [examsRes, resultsRes] = await Promise.all([
        api.get('/student/exams'),
        api.get('/student/results'),
      ]);
      setExams(examsRes.data.data);
      setResults(resultsRes.data.data);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const hasAttempted = (examId) => {
    return results.some((r) => r.exam_id === examId);
  };

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>Student Dashboard</h2>
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={logout} className='btn-secondary'>
            Logout
          </button>
        </div>
      </nav>

      <div className='content'>
        <h1>Available Exams</h1>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : exams.length === 0 ? (
          <div className='empty-state'>
            <p>No exams available at the moment.</p>
          </div>
        ) : (
          <div className='exam-grid'>
            {exams.map((exam) => (
              <div key={exam.id} className='exam-card'>
                <h3>{exam.title}</h3>
                <p>
                  <strong>Topic:</strong> {exam.topic}
                </p>
                <p>
                  <strong>Difficulty:</strong> {exam.difficulty_level}
                </p>
                <p>
                  <strong>Questions:</strong> {exam.total_questions}
                </p>
                <p>
                  <strong>Duration:</strong> {exam.duration} minutes
                </p>

                <div className='card-actions'>
                  {hasAttempted(exam.id) ? (
                    <button className='btn-secondary' disabled>
                      ✓ Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(`/student/exam/${exam.id}`)}
                      className='btn-primary'
                    >
                      Start Exam
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{ marginTop: '40px' }}>My Results</h2>
        {results.length === 0 ? (
          <p>No results yet. Take an exam to see your scores!</p>
        ) : (
          <div className='results-table'>
            <table>
              <thead>
                <tr>
                  <th>Exam</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id}>
                    <td>{result.exams.title}</td>
                    <td>
                      {result.score}/{result.total_questions}
                    </td>
                    <td className={result.percentage >= 60 ? 'pass' : 'fail'}>
                      {result.percentage}%
                    </td>
                    <td>
                      {new Date(result.evaluated_at).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          navigate(
                            `/student/attempts/${result.attempt_id}/review`
                          )
                        }
                        className='btn-secondary'
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        View Review
                      </button>
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
