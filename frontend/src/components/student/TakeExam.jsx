// Varun
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const startExam = async () => {
    try {
      const response = await api.post(`/student/exams/${examId}/start`);
      const data = response.data.data;
      setExam(data.exam);
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setTimeLeft(data.exam.duration * 60);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to start exam');
      navigate('/student/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startExam();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);



  const handleAnswer = async (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });

    try {
      await api.post('/student/answers', {
        attemptId,
        questionId,
        selectedOption: option,
      });
    } catch (error) {
      console.error('Save answer error:', error);
    }
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Are you sure you want to submit the exam?')) {
      return;
    }

    try {
      const response = await api.post(`/student/attempts/${attemptId}/submit`);
      const result = response.data.data;
      setSubmitting(true);

      // Redirect to review page instead of dashboard
      navigate(`/student/attempts/${attemptId}/review`);
    } catch (error) {
      alert('Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className='loading'>Loading exam...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className='exam-container'>
      <div className='exam-header'>
        <div>
          <h2>{exam.title}</h2>
          <p>
            Question {currentQuestion + 1} of {exam.totalQuestions}
          </p>
        </div>
        <div className='timer'>Time Left: {formatTime(timeLeft)}</div>
      </div>

      <div className='question-container'>
        <h3>{question.question_text}</h3>

        <div className='options'>
          {['a', 'b', 'c', 'd'].map((opt, idx) => (
            <div
              key={opt}
              className={`option ${answers[question.id] === idx + 1 ? 'selected' : ''
                }`}
              onClick={() => handleAnswer(question.id, idx + 1)}
            >
              <span className='option-label'>{opt.toUpperCase()}</span>
              <span>{question[`option_${opt}`]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className='exam-navigation'>
        <button
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className='btn-secondary'
        >
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className='btn-primary'
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className='btn-primary'
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
