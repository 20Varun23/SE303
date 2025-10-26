// Varun
import { supabaseAdmin } from "../config/database.js";

// Update a single question
const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const {
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
    } = req.body;
    const examinerId = req.user.userId;

    // Verify the question belongs to an exam created by this examiner
    const { data: question, error: questionError } = await supabaseAdmin
      .from("questions")
      .select("exam_id, exams!inner(examiner_id)")
      .eq("id", questionId)
      .single();

    if (questionError || !question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    if (question.exams.examiner_id !== examinerId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to edit this question",
      });
    }

    // Update the question
    const { data: updatedQuestion, error: updateError } = await supabaseAdmin
      .from("questions")
      .update({
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_answer,
      })
      .eq("id", questionId)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Update question error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
};

export { updateQuestion };
