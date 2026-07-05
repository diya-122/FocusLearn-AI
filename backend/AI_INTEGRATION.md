# FocusLearn AI — AI Integration Architecture

## Overview

FocusLearn AI uses **Ollama** with **Llama 3** and **Gemma** models for three core AI pipelines:
1. Summary Generation
2. Quiz Generation
3. Personalized Feedback

---

## 1. Summary Generation Pipeline

```
┌─────────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│ Video Lesson │───>│Transcript│───>│   Ollama     │───>│ Database │
│   (Upload)   │    │Extraction│    │  (Llama 3)   │    │(Summary) │
└─────────────┘    └──────────┘    └─────────────┘    └──────────┘
                        │                │
                   Speech-to-Text   Prompt Template
                   (Whisper API)    + Context Window
```

### Flow
1. Instructor uploads video → stored in `media/videos/`
2. **Transcript extraction** via OpenAI Whisper or Google Speech-to-Text
3. Transcript chunked into context-window-sized segments
4. Each chunk sent to **Ollama (Llama 3)** with summary prompt
5. Responses aggregated, sectioned, and stored in `summaries` table
6. Key concepts auto-tagged using NLP extraction

### Prompt Template
```python
SUMMARY_PROMPT = """
You are an educational content summarizer. Given the following lecture transcript,
generate a structured summary with these sections:

1. Key Concepts (mark as important)
2. Detailed Explanation
3. Practical Applications
4. Key Takeaways

Transcript:
{transcript}

Output in JSON format:
{{"sections": [{{"title": "...", "content": "...", "isKey": true/false}}]}}
"""
```

### Ollama API Call
```python
import requests

def generate_summary(transcript):
    response = requests.post('http://localhost:11434/api/generate', json={
        'model': 'llama3',
        'prompt': SUMMARY_PROMPT.format(transcript=transcript),
        'stream': False,
        'options': {'temperature': 0.3, 'num_predict': 2048}
    })
    return response.json()['response']
```

---

## 2. Quiz Generation Pipeline

```
┌─────────────┐    ┌──────────┐    ┌─────────────┐    ┌──────────┐
│  Transcript  │───>│  Ollama  │───>│    Quiz      │───>│ Database │
│  + Summary   │    │(Llama 3) │    │  Generator   │    │ (Quiz)   │
└─────────────┘    └──────────┘    └─────────────┘    └──────────┘
                                         │
                                   Validates format
                                   Shuffles options
                                   Assigns difficulty
```

### Flow
1. Summary + transcript passed to Ollama with quiz generation prompt
2. AI generates MCQ and True/False questions with explanations
3. **Quiz Generator** validates JSON format, ensures answer correctness
4. Questions stored in `quiz_questions` table with correct answers

### Prompt Template
```python
QUIZ_PROMPT = """
Based on the following lesson content, generate a quiz with:
- 7 Multiple Choice Questions (4 options each)
- 3 True/False Questions

Each question must include:
- The question text
- Options (for MCQ)
- Correct answer index
- Brief explanation

Content:
{content}

Output as JSON array:
[{{"type": "mcq", "question": "...", "options": [...], "correct": 0, "explanation": "..."}}]
"""
```

---

## 3. Personalized Feedback Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────┐    ┌───────────┐
│ Quiz Results │───>│ Focus Data   │───>│  Ollama  │───>│ Dashboard │
│ + Weak Areas │    │ + Analytics  │    │ (Gemma)  │    │ (Feedback)│
└──────────────┘    └──────────────┘    └──────────┘    └───────────┘
```

### Flow
1. Collect quiz results, focus scores, study patterns, weak areas
2. Aggregate into a learner profile context
3. Send to **Ollama (Gemma)** with feedback prompt
4. AI generates personalized recommendations
5. Displayed on student dashboard and profile

### Prompt Template
```python
FEEDBACK_PROMPT = """
You are a personalized learning advisor for a student with ADHD.
Based on their learning data, provide actionable feedback.

Student Data:
- Focus Score Average: {focus_avg}%
- Quiz Performance: {quiz_avg}%
- Weak Areas: {weak_areas}
- Study Pattern: Most productive at {peak_hours}
- Distraction Count: {distraction_count} per session

Provide:
1. Strengths (what they're doing well)
2. Areas for Improvement
3. Specific Study Strategies (ADHD-friendly)
4. Recommended Topics to Review
5. Motivational Message

Keep it encouraging and ADHD-aware.
"""
```

---

## Ollama Setup

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models
ollama pull llama3
ollama pull gemma

# Start server (default port 11434)
ollama serve
```

### API Configuration
```python
OLLAMA_CONFIG = {
    'base_url': 'http://localhost:11434',
    'summary_model': 'llama3',
    'quiz_model': 'llama3',
    'feedback_model': 'gemma',
    'timeout': 120,
    'options': {
        'temperature': 0.3,       # Lower for factual accuracy
        'num_predict': 4096,      # Max tokens
        'top_p': 0.9,
        'repeat_penalty': 1.1,
    }
}
```

---

## Model Selection Guide

| Task | Model | Reason |
|------|-------|--------|
| Summary Generation | Llama 3 (8B) | Strong instruction following, good at structured output |
| Quiz Generation | Llama 3 (8B) | Accurate factual questions, reliable JSON output |
| Personalized Feedback | Gemma (7B) | More conversational, empathetic tone for student feedback |

---

## Error Handling

```python
class AIServiceError(Exception):
    pass

def safe_generate(prompt, model='llama3', retries=3):
    for attempt in range(retries):
        try:
            response = requests.post(f'{OLLAMA_BASE}/api/generate', json={
                'model': model, 'prompt': prompt, 'stream': False
            }, timeout=120)
            response.raise_for_status()
            return response.json()['response']
        except (requests.Timeout, requests.ConnectionError) as e:
            if attempt == retries - 1:
                raise AIServiceError(f"Ollama service unavailable: {e}")
            time.sleep(2 ** attempt)  # Exponential backoff
```
