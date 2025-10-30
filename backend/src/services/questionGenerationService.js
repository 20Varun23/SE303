// Varun 
import { model } from '../config/gemini.js';

// Generate MCQ questions using Gemini API
const generateQuestions = async (topic, difficulty, numberOfQuestions) => {
  try {
    const prompt = `Generate exactly ${numberOfQuestions} multiple choice questions about '${topic}' at ${difficulty} difficulty level.

Requirements:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option should be correct
- Questions should be clear and unambiguous
- Difficulty should match the ${difficulty} level
- Return ONLY valid JSON, no markdown or additional text

Return the response in this EXACT JSON format:
{
  'questions': [
    {
      'question': 'Question text here?',
      'options': {
        'A': 'First option',
        'B': 'Second option',
        'C': 'Third option',
        'D': 'Fourth option'
      },
      'correctAnswer': 'A'
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/g, '');
    }

    // Parse JSON
    const parsedResponse = JSON.parse(cleanedText);

    // Validate response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid response format from AI');
    }

    // Validate each question
    const validatedQuestions = parsedResponse.questions.map((q, index) => {
      if (!q.question || !q.options || !q.correctAnswer) {
        throw new Error(`Invalid question format at index ${index}`);
      }

      const correctAnswerMap = { A: 1, B: 2, C: 3, D: 4 };
      const correctAnswerNum = correctAnswerMap[q.correctAnswer.toUpperCase()];

      if (!correctAnswerNum) {
        throw new Error(`Invalid correct answer at index ${index}`);
      }

      return {
        question_text: q.question,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_answer: correctAnswerNum,
      };
    });

    return validatedQuestions;
  } catch (error) {
    console.error('Question generation error:', error);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

export default generateQuestions;
