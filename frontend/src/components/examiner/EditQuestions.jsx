import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function EditQuestions() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExamPreview();
  }, []);

  const fetchExamPreview = async () => {
    try {
      const response = await api.get(`/examiner/exams/${examId}/preview`);
      setExam(response.data.data.exam);
      setQuestions(response.data.data.questions);
    } catch (error) {
      console.error("Fetch exam error:", error);
      alert("Failed to load exam");
      navigate("/examiner/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (question) => {
    setEditingId(question.id);
    setEditForm({
      question_text: question.question_text,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_answer: question.correct_answer,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveQuestion = async (questionId) => {
    setSaving(true);
    try {
      await api.put(`/examiner/questions/${questionId}`, editForm);

      setQuestions(
        questions.map((q) => (q.id === questionId ? { ...q, ...editForm } : q))
      );

      setEditingId(null);
      alert("Question updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update question");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="dashboard">
        <nav className="navbar">
          <h2>✏️ Edit Questions</h2>
          <button
            onClick={() => navigate("/examiner/dashboard")}
            className="btn-secondary"
          >
            Back to Dashboard
          </button>
        </nav>
        <div className="content">
          <div
            className="empty-state"
            style={{
              minHeight: "60vh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <h2>No Questions Found</h2>
            <button
              onClick={() => navigate("/examiner/dashboard")}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h2>✏️ Edit Questions</h2>
        <button
          onClick={() => navigate("/examiner/dashboard")}
          className="btn-secondary"
        >
          Back to Dashboard
        </button>
      </nav>

      <div className="content">
        <div className="edit-header">
          <h1>{exam.title}</h1>
          <p>
            <strong>Topic:</strong> {exam.topic} |<strong>Difficulty:</strong>{" "}
            {exam.difficulty_level} |<strong>Questions:</strong>{" "}
            {questions.length}
          </p>
          {exam.is_published && (
            <div className="warning-banner">
              ⚠️ This exam is published. Changes will affect students taking
              this exam.
            </div>
          )}
        </div>

        <div className="questions-edit-section">
          {questions.map((question, index) => (
            <div key={question.id} className="edit-question-card">
              {editingId === question.id ? (
                // Edit Mode
                <div className="edit-form">
                  <div className="form-header">
                    <h3>Editing Question {index + 1}</h3>
                    <div className="form-actions">
                      <button
                        onClick={() => saveQuestion(question.id)}
                        disabled={saving}
                        className="btn-save"
                      >
                        {saving ? "Saving..." : "💾 Save"}
                      </button>
                      <button onClick={cancelEditing} className="btn-cancel">
                        ❌ Cancel
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Question Text:</label>
                    <textarea
                      value={editForm.question_text}
                      onChange={(e) =>
                        handleFormChange("question_text", e.target.value)
                      }
                      rows="3"
                    />
                  </div>

                  <div className="options-grid-edit">
                    {["a", "b", "c", "d"].map((opt, idx) => (
                      <div key={opt} className="option-edit">
                        <label>Option {opt.toUpperCase()}:</label>
                        <input
                          type="text"
                          value={editForm[`option_${opt}`]}
                          onChange={(e) =>
                            handleFormChange(`option_${opt}`, e.target.value)
                          }
                        />
                        <label className="radio-label">
                          <input
                            type="radio"
                            name={`correct_${question.id}`}
                            checked={editForm.correct_answer === idx + 1}
                            onChange={() =>
                              handleFormChange("correct_answer", idx + 1)
                            }
                          />
                          Correct Answer
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="view-mode">
                  <div className="question-header-edit">
                    <h3>Question {index + 1}</h3>
                    <div className="question-actions">
                      <button
                        onClick={() => startEditing(question)}
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>
                    </div>
                  </div>

                  <p className="question-text-view">{question.question_text}</p>

                  <div className="options-view">
                    {["a", "b", "c", "d"].map((opt, idx) => (
                      <div
                        key={opt}
                        className={`option-view ${
                          question.correct_answer === idx + 1
                            ? "correct-option-view"
                            : ""
                        }`}
                      >
                        <span className="option-letter-view">
                          {opt.toUpperCase()}
                        </span>
                        <span>{question[`option_${opt}`]}</span>
                        {question.correct_answer === idx + 1 && (
                          <span className="correct-badge">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="edit-footer">
          <button
            onClick={() => navigate("/examiner/dashboard")}
            className="btn-primary"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
}
