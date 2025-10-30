// Napa
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function Analytics() {
  const { examId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAnalytics = async () => {
    try {
      const response = await api.get(`/examiner/exams/${examId}/analytics`);
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      alert('Failed to load analytics');
      navigate('/examiner/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return <div className='loading'>Loading analytics...</div>;
  }

  if (analytics==null) return null;

  const { exam, results, statistics } = analytics;
  const hasResults = results.length > 0;

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>Exam Analytics</h2>
        <button
          onClick={() => navigate('/examiner/dashboard')}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </nav>

      <div className='content'>
        {/* Exam Info Card */}
        <div className='analytics-header'>
          <h1>{exam.title}</h1>
          <div className='exam-details'>
            <span>
              <strong>Topic:</strong> {exam.topic}
            </span>
            <span>
              <strong>Difficulty:</strong> {exam.difficulty_level}
            </span>
            <span>
              <strong>Total Questions:</strong> {exam.total_questions}
            </span>
            <span>
              <strong>Duration:</strong> {exam.duration} minutes
            </span>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className='analytics-stats-grid'>
          <div className='stat-card'>
            <div className='stat-icon'>👥</div>
            <div className='stat-info'>
              <h3>Total Attempts</h3>
              <p className='stat-number'>{statistics.totalAttempts}</p>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-icon'>📈</div>
            <div className='stat-info'>
              <h3>Average Score</h3>
              <p className='stat-number'>
                {hasResults
                  ? `${statistics.averageScore}/${exam.total_questions}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-info'>
              <h3>Average Percentage</h3>
              <p className='stat-number'>
                {hasResults ? `${statistics.averagePercentage}%` : 'N/A'}
              </p>
            </div>
          </div>

          <div className='stat-card'>
            <div className='stat-info'>
              <h3>Pass Rate</h3>
              <p className='stat-number'>
                {hasResults
                  ? `${results.filter((r) => parseFloat(r.percentage) >= 60)
                    .length
                  }/${results.length}`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className='analytics-results'>
          <h2>Student Performance</h2>

          {!hasResults ? (
            <div className='empty-state'>
              <p>No students have attempted this exam yet.</p>
            </div>
          ) : (
            <div className='results-table'>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>Email</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Status</th>
                    <th>Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id}>
                      <td>{index + 1}</td>
                      <td>{result.users.name}</td>
                      <td>{result.users.email}</td>
                      <td>
                        {result.score}/{exam.total_questions}
                      </td>
                      <td
                        className={
                          parseFloat(result.percentage) >= 60 ? 'pass' : 'fail'
                        }
                      >
                        {result.percentage}%
                      </td>
                      <td>{formatTime(result.time_taken)}</td>
                      <td>
                        <span
                          className={`status-badge ${parseFloat(result.percentage) >= 60
                              ? 'pass-badge'
                              : 'fail-badge'
                            }`}
                        >
                          {parseFloat(result.percentage) >= 60
                            ? 'Pass'
                            : 'Fail'}
                        </span>
                      </td>
                      <td>{new Date(result.evaluated_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Score Distribution Chart (Visual representation) */}
        {hasResults && (
          <div className='score-distribution'>
            <h2>Score Distribution</h2>
            <div className='distribution-bars'>
              {[
                { range: '0-20%', min: 0, max: 20, color: '#e74c3c' },
                { range: '21-40%', min: 21, max: 40, color: '#e67e22' },
                { range: '41-60%', min: 41, max: 60, color: '#f39c12' },
                { range: '61-80%', min: 61, max: 80, color: '#3498db' },
                { range: '81-100%', min: 81, max: 100, color: '#27ae60' },
              ].map((bucket) => {
                const count = results.filter((r) => {
                  const pct = parseFloat(r.percentage);
                  return pct >= bucket.min && pct <= bucket.max;
                }).length;
                const percentage = (count / results.length) * 100;

                return (
                  <div key={bucket.range} className='distribution-item'>
                    <div className='distribution-label'>{bucket.range}</div>
                    <div className='distribution-bar-container'>
                      <div
                        className='distribution-bar'
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: bucket.color,
                        }}
                      >
                        <span className='bar-count'>{count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
