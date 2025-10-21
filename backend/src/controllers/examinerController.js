import { supabaseAdmin } from '../config/database.js';
import generateQuestions from '../services/questionGenerationService.js';

// Suvarna start
// Publish exam
const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const examinerId = req.user.userId;

    const { data: exam, error } = await supabaseAdmin
      .from('exams')
      .update({
        is_published: true,
        published_at: new Date(),
      })
      .eq('id', examId)
      .eq('examiner_id', examinerId)
      .select()
      .single();

    if (error || !exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Exam published successfully',
      data: exam,
    });
  } catch (error) {
    console.error('Publish exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to publish exam',
      error: error.message,
    });
  }
};
// Suvarna end

// Varun start
// Create exam and generate questions
const createExam = async (req, res) => {
  try {
    const { title, topic, difficulty, totalQuestions, duration } = req.body;
    const examinerId = req.user.userId;

    // Generate questions using AI
    const generatedQuestions = await generateQuestions(
      topic,
      difficulty,
      totalQuestions
    );

    // Create exam record
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .insert([
        {
          examiner_id: examinerId,
          title,
          topic,
          difficulty_level: difficulty,
          duration,
          total_questions: totalQuestions,
          is_published: false,
        },
      ])
      .select()
      .single();

    if (examError!=null) throw examError;

    // Insert questions
    const questionsToInsert = generatedQuestions.map((q, index) => ({
      exam_id: exam.id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer,
      question_order: index + 1,
    }));

    const { error: questionsError } = await supabaseAdmin
      .from('questions')
      .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      data: {
        examId: exam.id,
        title: exam.title,
        totalQuestions: exam.total_questions,
        questions: generatedQuestions,
      },
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: error.message,
    });
  }
};

// Get exam with questions for preview
const getExamPreview = async (req, res) => {
  try {
    const { examId } = req.params;
    const examinerId = req.user.userId;

    // Get exam details
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('examiner_id', examinerId)
      .single();

    if ((examError!=null) || (exam==null)) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Get questions
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('exam_id', examId)
      .order('question_order', { ascending: true });

    if (questionsError!=null) throw questionsError;

    res.status(200).json({
      success: true,
      data: {
        exam,
        questions,
      },
    });
  } catch (error) {
    console.error('Get exam preview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exam',
      error: error.message,
    });
  }
};
// Varun end

// Napa start
// Get all exams created by examiner
const getMyExams = async (req, res) => {
  try {
    const examinerId = req.user.userId;

    const { data: exams, error } = await supabaseAdmin
      .from('exams')
      .select('*')
      .eq('examiner_id', examinerId)
      .order('created_at', { ascending: false });

    if (error!=null) throw error;

    res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    console.error('Get my exams error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get exams',
      error: error.message,
    });
  }
};

// Get exam results and analytics
const getExamAnalytics = async (req, res) => {
  try {
    const { examId } = req.params;
    const examinerId = req.user.userId;

    // Verify exam belongs to examiner
    const { data: exam, error: examError } = await supabaseAdmin
      .from('exams')
      .select('*')
      .eq('id', examId)
      .eq('examiner_id', examinerId)
      .single();

    if ((examError!=null) || (exam==null)) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // Get all results for this exam with student info
    const { data: results, error: resultsError } = await supabaseAdmin
      .from('results')
      .select(
        `
        *,
        users:student_id (name, email)
      `
      )
      .eq('exam_id', examId)
      .order('evaluated_at', { ascending: false });

    if (resultsError!=null) throw resultsError;

    // Calculate statistics
    const totalAttempts = results.length;
    const avgScore =
      totalAttempts > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / totalAttempts
        : 0;
    const avgPercentage =
      totalAttempts > 0
        ? results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) /
        totalAttempts
        : 0;

    res.status(200).json({
      success: true,
      data: {
        exam,
        results,
        statistics: {
          totalAttempts,
          averageScore: avgScore.toFixed(2),
          averagePercentage: avgPercentage.toFixed(2),
        },
      },
    });
  } catch (error) {
    console.error('Get exam analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message,
    });
  }
};

// Get leaderboard for a specific exam
const getExamLeaderboard = async (req, res) => {
  try {
    const { examId } = req.params;

    const { data: leaderboard, error } = await supabaseAdmin
      .from('results')
      .select(`
        id,
        score,
        percentage,
        time_taken,
        evaluated_at,
        users:student_id (name, email)
      `)
      .eq('exam_id', examId)
      .order('percentage', { ascending: false })
      .order('time_taken', { ascending: true })
      .limit(10);

    if (error!=null) throw error;

    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
};
// Napa end

// Modules export
export {
  createExam,
  getExamPreview,
  publishExam,
  getMyExams,
  getExamAnalytics,
  getExamLeaderboard,
};
