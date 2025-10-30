// Varun
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

/**
 * Helper function to shuffle an array in place (Fisher-Yates shuffle)
 * @param {Array} array The array to shuffle
 * @returns {Array} The shuffled array
 */
const shuffleArray = (array) => {
  let currentIndex = array.length;
  let randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
};

export default function TakeExam() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [shuffledOptions, setShuffledOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const handleSubmit = useCallback(
    async (auto = false) => {
      if (!auto && !window.confirm('Are you sure you want to submit the exam?')) {
        return;
      }

      try {
        await api.post(`/student/attempts/${attemptId}/submit`);
        // The original line was commented out, keeping the submission logic clean
        setSubmitting(true);

        // Redirect to review page instead of dashboard
        navigate(`/student/attempts/${attemptId}/review`);
      } catch (error) {
        alert('Failed to submit exam');
        setSubmitting(false);
      }
    },
    [attemptId, navigate],
  );

  const startExam = async () => {
    try {
      const response = await api.post(`/student/exams/${examId}/start`);
      const { data } = response.data;
      const fetchedQuestions = data.questions;

      const optionsMap = {};
      fetchedQuestions.forEach((q) => {
        const options = [
          { text: q.option_a, value: 1 },
          { text: q.option_b, value: 2 },
          { text: q.option_c, value: 3 },
          { text: q.option_d, value: 4 },
        ];
        optionsMap[q.id] = shuffleArray(options);
      });
      setShuffledOptions(optionsMap);

      setExam(data.exam);
      setQuestions(fetchedQuestions);
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
  }, [examId, navigate]); // Added dependencies for startExam's use of examId and navigate

  useEffect(() => {
    if (timeLeft <= 0 || loading) {
      return () => {};
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, handleSubmit]); // Kept dependencies as per original fix

  const handleAnswer = async (questionId, optionValue) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: optionValue,
    }));

    try {
      await api.post('/student/answers', {
        attemptId,
        questionId,
        selectedOption: optionValue,
      });
    } catch (error) {
      console.error('Save answer error:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="loading">Loading exam...</div>;
  }

  const question = questions[currentQuestion];
  const currentShuffledOptions = question ? shuffledOptions[question.id] : [];

  return (
    <div className="exam-container">
      <div className="exam-header">
        <div>
          <h2>{exam.title}</h2>
          <p>
            Question {currentQuestion + 1} of {exam.totalQuestions}
          </p>
        </div>
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
      </div>

      {question ? (
        <div className="question-container">
          <h3>{question.question_text}</h3>

          <div className="options">
            {currentShuffledOptions &&
              currentShuffledOptions.map((option, idx) => (
                <div
                  key={option.value}
                  className={`option ${
                    answers[question.id] === option.value ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswer(question.id, option.value)}
                >
                  <span className="option-label">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{option.text}</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="loading">Loading question...</div>
      )}

      <div className="exam-navigation">
        <button
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className="btn-secondary"
        >
          Previous
        </button>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            className="btn-primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmit(false)}
            disabled={submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting...' : 'Submit Exam'}
          </button>
        )}
      </div>
    </div>
  );
}
