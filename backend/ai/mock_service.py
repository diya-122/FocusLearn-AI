# Mock AI service — returns realistic placeholder data
# Replace calls here with real Ollama API calls when models are downloaded.

import random


def generate_summary_mock(transcript: str) -> dict:
    """Returns a structured summary matching the SUMMARY_PROMPT format."""
    return {
        "sections": [
            {
                "title": "Key Concepts",
                "content": "This lesson introduces fundamental principles including core definitions, theoretical frameworks, and foundational terminology used throughout the course.",
                "isKey": True,
            },
            {
                "title": "Detailed Explanation",
                "content": "The content explores the subject in depth, walking through step-by-step processes and illustrating how each concept connects to real-world applications. Examples are drawn from current industry practices.",
                "isKey": False,
            },
            {
                "title": "Practical Applications",
                "content": "Students can apply these concepts in project work, assignments, and real-world scenarios. The skills learned here form the foundation for advanced topics in subsequent lessons.",
                "isKey": False,
            },
            {
                "title": "Key Takeaways",
                "content": "Remember the three core principles discussed: clarity, consistency, and application. These will be revisited in every module going forward.",
                "isKey": True,
            },
        ]
    }


def generate_quiz_mock(content: str) -> list:
    """Returns 7 MCQ + 3 True/False questions in the QUIZ_PROMPT format."""
    mcqs = [
        {
            "type": "mcq",
            "question": "Which of the following best describes the primary objective of this lesson?",
            "options": [
                "To memorise definitions without context",
                "To understand and apply core concepts practically",
                "To skip foundational topics",
                "To focus only on theoretical aspects",
            ],
            "correct": 1,
            "explanation": "The lesson emphasises understanding concepts deeply and applying them, not rote memorisation.",
        },
        {
            "type": "mcq",
            "question": "What is the recommended approach when encountering a new concept?",
            "options": [
                "Ignore it and move on",
                "Memorise it without understanding",
                "Connect it to prior knowledge and examples",
                "Only read about it once",
            ],
            "correct": 2,
            "explanation": "Connecting new concepts to prior knowledge improves retention and understanding.",
        },
        {
            "type": "mcq",
            "question": "Which strategy is most effective for ADHD-friendly learning?",
            "options": [
                "Long uninterrupted study sessions",
                "Short focused sessions with breaks",
                "Studying without any structure",
                "Avoiding visual aids",
            ],
            "correct": 1,
            "explanation": "Short, focused sessions with regular breaks are proven to improve focus for students with ADHD.",
        },
        {
            "type": "mcq",
            "question": "How does focus monitoring benefit learners?",
            "options": [
                "It has no effect on learning",
                "It increases anxiety",
                "It helps identify distraction patterns and improve study habits",
                "It only benefits instructors",
            ],
            "correct": 2,
            "explanation": "Focus monitoring provides data-driven insights that help students improve their study habits.",
        },
        {
            "type": "mcq",
            "question": "What does a high focus score indicate?",
            "options": [
                "The student was asleep",
                "The student was highly engaged and attentive",
                "The student completed the quiz quickly",
                "The student skipped many lessons",
            ],
            "correct": 1,
            "explanation": "A high focus score reflects sustained attention and active engagement during a lesson.",
        },
        {
            "type": "mcq",
            "question": "Which type of question tests comprehension most effectively?",
            "options": [
                "Yes/No questions",
                "Fill-in-the-blank",
                "Application-based questions requiring reasoning",
                "Questions with only one word answers",
            ],
            "correct": 2,
            "explanation": "Application-based questions require students to reason through concepts, testing deeper comprehension.",
        },
        {
            "type": "mcq",
            "question": "What is the purpose of the summary feature in FocusLearn?",
            "options": [
                "To replace watching lessons entirely",
                "To provide a quick review of key concepts after a lesson",
                "To generate random content",
                "To track instructor performance only",
            ],
            "correct": 1,
            "explanation": "Summaries help students review and retain key concepts from lessons without rewatching.",
        },
    ]

    true_false = [
        {
            "type": "true_false",
            "question": "Regular quizzes improve long-term retention of course material.",
            "options": ["True", "False"],
            "correct": 0,
            "explanation": "Research consistently shows that frequent testing (retrieval practice) significantly improves memory retention.",
        },
        {
            "type": "true_false",
            "question": "Focus score data is only useful at the end of a course.",
            "options": ["True", "False"],
            "correct": 1,
            "explanation": "Focus data is most useful in real-time and across sessions to identify trends and adjust study habits.",
        },
        {
            "type": "true_false",
            "question": "Personalised feedback helps students identify and work on weak areas.",
            "options": ["True", "False"],
            "correct": 0,
            "explanation": "Personalised feedback targets individual weak areas, making study time more efficient.",
        },
    ]

    return mcqs + true_false


def generate_feedback_mock(student_data: dict) -> str:
    """Returns personalised feedback text matching the FEEDBACK_PROMPT format."""
    focus_avg = student_data.get('focus_avg', 75)
    quiz_avg = student_data.get('quiz_avg', 70)
    weak_areas = student_data.get('weak_areas', ['review topics'])

    return f"""
## Your Personalised Learning Report 🎯

### ✅ Strengths
You're maintaining a solid study routine with an average focus score of {focus_avg}%.
Your quiz performance of {quiz_avg}% shows good understanding of core concepts.
Keep up the consistent effort — your streak shows real dedication!

### 📈 Areas for Improvement
Focus on strengthening: {', '.join(weak_areas)}.
Try revisiting lesson summaries before taking quizzes on challenging topics.

### 🧠 ADHD-Friendly Study Strategies
- **Pomodoro technique**: Study for 25 minutes, then take a 5-minute break
- **Active recall**: After each lesson, write down 3 things you learned without looking
- **Visual mapping**: Draw concept maps to connect ideas visually
- **Reward system**: Celebrate completing each lesson with a small reward

### 📚 Recommended Topics to Review
- Revisit any lessons where your focus score dropped below 60%
- Re-attempt quizzes where you scored below 70%
- Use the summary feature to do quick reviews before bed

### 💪 Motivational Message
Every expert was once a beginner. Your consistency is building momentum — keep going!
The data shows you're improving steadily. Trust the process and stay curious. 🚀
""".strip()
