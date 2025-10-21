import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../services/api';

export default function ExaminerDashboard() {
  const [exams, setExams] = useState([]);
  const [examStats, setExamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchExams = async () => {
    try {
      const response = await api.get('/examiner/exams');
      const examsData = response.data.data;
      setExams(examsData);

      // Fetch statistics for each published exam
      const statsPromises = examsData
        .filter((exam) => exam.is_published)
        .map((exam) => fetchExamStats(exam.id));

      await Promise.all(statsPromises);
    } catch (error) {
      console.error('Fetch exams error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);


  const fetchExamStats = async (examId) => {
    try {
      const response = await api.get(`/examiner/exams/${examId}/analytics`);
      const data = response.data.data;

      setExamStats((prev) => ({
        ...prev,
        [examId]: {
          totalAttempts: data.statistics.totalAttempts,
          averageScore: data.statistics.averageScore,
          averagePercentage: data.statistics.averagePercentage,
        },
      }));
    } catch (error) {
      console.error(`Fetch stats error for exam ${examId}:`, error);
    }
  };

  const handlePublish = async (examId) => {
    try {
      await api.put(`/examiner/exams/${examId}/publish`);
      alert('Exam published successfully!');
      fetchExams();
    } catch (error) {
      alert('Failed to publish exam');
    }
  };

  return (
    <div className='dashboard'>
      <nav className='navbar'>
        <h2>Examiner Dashboard</h2>
        <div>
          <span>Welcome, {user.name}</span>
          <button onClick={logout} className='btn-secondary'>
            Logout
          </button>
        </div>
      </nav>

      <div className='content'>
        <div className='header'>
          <h1>My Exams</h1>
          <button
            onClick={() => navigate('/examiner/create-exam')}
            className='btn-primary'
          >
            Create New Exam
          </button>
        </div>

        {loading ? (
          <div className='loading'>Loading...</div>
        ) : exams.length === 0 ? (
          <div className='empty-state'>
            <p>No exams created yet. Create your first exam!</p>
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
                <p>
                  <strong>Status:</strong>{' '}
                  {exam.is_published ? '✅ Published' : '⏳ Draft'}
                </p>

                {/* Statistics Section */}
                {exam.is_published && examStats[exam.id] && (
                  <div className='exam-stats'>
                    <hr
                      style={{ margin: '15px 0', border: '1px solid #eee' }}
                    />
                    <p>
                      <strong>Statistics:</strong>
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      <strong>Total Attempts:</strong>{' '}
                      {examStats[exam.id].totalAttempts}
                    </p>
                    {examStats[exam.id].totalAttempts > 0 && (
                      <>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                          <strong>Avg Score:</strong>{' '}
                          {examStats[exam.id].averageScore} /{' '}
                          {exam.total_questions}
                        </p>
                        <p style={{ fontSize: '14px', color: '#666' }}>
                          <strong>Avg Percentage:</strong>{' '}
                          {examStats[exam.id].averagePercentage}%
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className='card-actions'>
                  {!exam.is_published && (
                    <button
                      onClick={() => handlePublish(exam.id)}
                      className='btn-primary'
                    >
                      Publish
                    </button>
                  )}
                  {exam.is_published && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/examiner/exam/${exam.id}/leaderboard`)
                        }
                        className='btn-secondary'
                      >
                        View Leaderboard
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/examiner/exams/${exam.id}/analytics`)
                        }
                        className='btn-secondary'
                        style={{ marginLeft: '10px' }}
                      >
                        Full Analytics
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
