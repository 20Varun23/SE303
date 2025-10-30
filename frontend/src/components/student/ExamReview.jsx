// Napa
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ExamReview() {
  const { attemptId } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} min ${secs} sec`;
  };

  const fetchReview = async () => {
    try {
      const response = await api.get(`/student/attempts/${attemptId}/review`);
      setReviewData(response.data.data);
    } catch (error) {
      console.error('Fetch review error:', error);
      alert('Failed to load review');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, []);


  const getOptionLabel = (num) => {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[num - 1];
  };

  if (loading) {
    return <div className='loading'>Loading review...</div>;
  }

  if (!reviewData) return null;

  const { exam, result, review } = reviewData;
  const correctCount = review.filter((q) => q.is_correct).length;
  const incorrectCount = review.length - correctCount;

  return (
    <div className='review-page'>
      <nav className='navbar'>
        <h2>Exam Review</h2>
        <button
          onClick={() => navigate('/student/dashboard')}
          className='btn-secondary'
        >
          Back to Dashboard
        </button>
      </nav>

      <div className='review-container'>
        {/* Score Card */}
        <div className='score-card-large'>
          <div className='score-header'>
            <h1>{exam.title}</h1>
          </div>

          <div className='score-stats'>
            <div className='stat-box score-box'>
              <div className='stat-icon'>🎯</div>
              <div className='stat-content'>
                <h3>Your Score</h3>
                <p className='stat-value'>
                  {result.score}/{result.total_questions}
                </p>
              </div>
            </div>

            <div className='stat-box percentage-box'>
              <div className='stat-content'>
                <h3>Percentage</h3>
                <p
                  className={`stat-value ${result.percentage >= 60 ? 'pass-color' : 'fail-color'
                    }`}
                >
                  {result.percentage}%
                </p>
              </div>
            </div>

            <div className='stat-box time-box'>
              <div className='stat-icon'>⏱️</div>
              <div className='stat-content'>
                <h3>Time Taken</h3>
                <p className='stat-value'>{formatTime(result.time_taken)}</p>
              </div>
            </div>

            <div className='stat-box accuracy-box'>
              <div className='stat-icon'>✓</div>
              <div className='stat-content'>
                <h3>Correct</h3>
                <p className='stat-value correct-text'>{correctCount}</p>
              </div>
            </div>

            <div className='stat-box wrong-box'>
              <div className='stat-icon'>✗</div>
              <div className='stat-content'>
                <h3>Incorrect</h3>
                <p className='stat-value wrong-text'>{incorrectCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Review */}
        <div className='questions-review-section'>
          <h2 className='section-title'>Detailed Review</h2>

          {review.map((item, index) => (
            <div key={item.question_id} className='question-review-card'>
              <div className='question-number-badge'>
                <span>Question {index + 1}</span>
                {item.is_correct ? (
                  <span className='badge-correct'>✓ Correct</span>
                ) : (
                  <span className='badge-incorrect'>✗ Incorrect</span>
                )}
              </div>

              <p className='question-text-review'>{item.question_text}</p>

              <div className='options-grid'>
                {['a', 'b', 'c', 'd'].map((opt, idx) => {
                  const optNum = idx + 1;
                  const isCorrect = optNum === item.correct_answer;
                  const isSelected = optNum === item.selected_answer;

                  let className = 'option-box';

                  // Green for correct answer
                  if (isCorrect) {
                    className += ' option-correct';
                  }

                  // Red for wrong selected answer
                  if (isSelected && !isCorrect) {
                    className += ' option-wrong';
                  }

                  return (
                    <div key={opt} className={className}>
                      <div className='option-header'>
                        <span className='option-letter'>
                          {getOptionLabel(optNum)}
                        </span>
                        <span className='option-text'>
                          {item[`option_${opt}`]}
                        </span>
                      </div>
                      <div className='option-indicators'>
                        {isCorrect && (
                          <span className='indicator correct-indicator'>
                            ✓ Correct Answer
                          </span>
                        )}
                        {isSelected && isCorrect && (
                          <span className='indicator your-answer-correct'>
                            ✓ Your Answer
                          </span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className='indicator your-answer-wrong'>
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className='review-footer-actions'>
          <button
            onClick={() => navigate('/student/dashboard')}
            className='btn-primary-large'
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
