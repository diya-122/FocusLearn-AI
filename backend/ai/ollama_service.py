import json
import requests
from .mock_service import generate_quiz_mock, generate_summary_mock, generate_feedback_mock

OLLAMA_URL = "http://127.0.0.1:11434/api/generate"

def call_ollama(prompt: str, model: str = "llama3", format: str = None) -> str:
    """Wrapper to call local Ollama instance."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
    }
    if format:
        payload["format"] = format

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=300)
        response.raise_for_status()
        return response.json().get("response", "")
    except Exception as e:
        print(f"Ollama API Error: {e}")
        return None

def generate_quiz(content: str) -> list:
    """Generates a quiz using llama3. Falls back to mock if Ollama fails."""
    prompt = f"""
You are an expert educator. Based on the following content, generate exactly 7 Multiple Choice Questions (MCQs) and exactly 3 True/False questions.
Output ONLY a valid JSON object with a single key "questions" containing a list of exactly 10 question objects. Do not include markdown formatting.
Use this exact JSON structure:
{{
  "questions": [
    {{"type": "mcq", "question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correct": 0, "explanation": "Why this is correct"}},
    {{"type": "true_false", "question": "Question text", "options": ["True", "False"], "correct": 0, "explanation": "Why this is correct"}}
  ]
}}
Note: 'correct' is the 0-based index of the correct option.

Content to base the quiz on:
{content}
"""
    result = call_ollama(prompt, model="llama3", format="json")
    if not result:
        return generate_quiz_mock(content)

    try:
        # LLMs might occasionally wrap json in markdown even if instructed otherwise
        clean_result = result.strip()
        if clean_result.startswith("```json"):
            clean_result = clean_result[7:]
        if clean_result.endswith("```"):
            clean_result = clean_result[:-3]
            
        data = json.loads(clean_result)
        if isinstance(data, dict) and 'questions' in data:
            return data['questions']
        if isinstance(data, list):
            return data
            
        print(f"Ollama returned unexpected JSON structure: {data}")
        return generate_quiz_mock(content)
    except Exception as e:
        print(f"JSON Parse Error from Ollama: {e}")
        return generate_quiz_mock(content)

def generate_summary(content: str) -> dict:
    """Generates a structured summary using llama3. Falls back to mock if Ollama fails."""
    prompt = f"""
You are an expert educator summarizing a lesson.
Output ONLY a valid JSON object. Do not include markdown formatting like ```json or any other text.
The JSON must have this exact structure:
{{
  "sections": [
    {{
      "title": "Section Title (e.g. Key Concepts)",
      "content": "Paragraph of summary text...",
      "isKey": true
    }}
  ]
}}
Provide exactly 4 sections: "Key Concepts" (isKey: true), "Detailed Explanation" (isKey: false), "Practical Applications" (isKey: false), and "Key Takeaways" (isKey: true).

Content to summarize:
{content}
"""
    result = call_ollama(prompt, model="llama3", format="json")
    if not result:
        return generate_summary_mock(content)

    try:
        clean_result = result.strip()
        if clean_result.startswith("```json"):
            clean_result = clean_result[7:]
        if clean_result.endswith("```"):
            clean_result = clean_result[:-3]
            
        return json.loads(clean_result)
    except Exception as e:
        print(f"JSON Parse Error from Ollama: {e}")
        return generate_summary_mock(content)

def generate_feedback(student_data: dict) -> str:
    """Generates personalized feedback using gemma (markdown). Falls back to mock."""
    focus_avg = student_data.get('focus_avg', 75)
    quiz_avg = student_data.get('quiz_avg', 70)
    weak_areas = ", ".join(student_data.get('weak_areas', ['reviewing core concepts']))
    
    prompt = f"""
You are an AI learning coach writing a personalized feedback report for a student.
The student has an average focus score of {focus_avg}% and an average quiz score of {quiz_avg}%.
Their weak areas include: {weak_areas}.

Write a highly encouraging, personalized markdown report.
Include the following sections with markdown headings (###):
- ✅ Strengths
- 📈 Areas for Improvement
- 🧠 ADHD-Friendly Study Strategies
- 💪 Motivational Message

Keep the tone supportive and conversational.
"""
    result = call_ollama(prompt, model="gemma")
    if not result:
        return generate_feedback_mock(student_data)
    
    return f"## Your Personalised Learning Report 🎯\n\n{result.strip()}"
