# FocusLearn AI — Attention Monitoring Module

## Overview

The Attention Monitoring Module uses **OpenCV** and **MediaPipe Face Mesh** to track student attention in real-time during video lessons through:
- Face Detection
- Eye Gaze Tracking
- Head Pose Estimation
- Distraction Detection

---

## Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐
│   Webcam     │───>│  MediaPipe   │───>│   Attention   │───>│ Backend  │
│   Stream     │    │  Face Mesh   │    │  Calculator   │    │   API    │
└──────────────┘    └──────────────┘    └──────────────┘    └──────────┘
                          │                     │
                    468 Face Landmarks    Focus Score 0-100
                    Eye Aspect Ratio     is_distracted flag
                    Head Pose Angles     Engagement level
```

---

## Core Components

### 1. Face Detection
```python
import cv2
import mediapipe as mp

class FaceDetector:
    def __init__(self):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )

    def detect(self, frame):
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb)
        if results.multi_face_landmarks:
            return results.multi_face_landmarks[0]
        return None
```

### 2. Eye Gaze Tracking
```python
import numpy as np

class EyeGazeTracker:
    # MediaPipe eye landmark indices
    LEFT_EYE = [362, 385, 387, 263, 373, 380]
    RIGHT_EYE = [33, 160, 158, 133, 153, 144]
    LEFT_IRIS = [474, 475, 476, 477]
    RIGHT_IRIS = [469, 470, 471, 472]

    def calculate_ear(self, landmarks, eye_indices):
        """Eye Aspect Ratio — detects eye closure/blink"""
        points = [landmarks[i] for i in eye_indices]
        vertical_1 = np.linalg.norm(np.array([points[1].x, points[1].y]) -
                                      np.array([points[5].x, points[5].y]))
        vertical_2 = np.linalg.norm(np.array([points[2].x, points[2].y]) -
                                      np.array([points[4].x, points[4].y]))
        horizontal = np.linalg.norm(np.array([points[0].x, points[0].y]) -
                                     np.array([points[3].x, points[3].y]))
        return (vertical_1 + vertical_2) / (2.0 * horizontal)

    def get_gaze_direction(self, landmarks):
        """Determine if user is looking at screen"""
        left_iris = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.LEFT_IRIS], axis=0)
        right_iris = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.RIGHT_IRIS], axis=0)
        left_center = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.LEFT_EYE], axis=0)
        right_center = np.mean([[landmarks[i].x, landmarks[i].y] for i in self.RIGHT_EYE], axis=0)

        left_offset = left_iris - left_center
        right_offset = right_iris - right_center
        avg_offset = (left_offset + right_offset) / 2

        looking_at_screen = abs(avg_offset[0]) < 0.015 and abs(avg_offset[1]) < 0.015
        return looking_at_screen, avg_offset
```

### 3. Head Pose Estimation
```python
class HeadPoseEstimator:
    # 3D model points for head pose
    MODEL_POINTS = np.array([
        (0.0, 0.0, 0.0),        # Nose tip
        (0.0, -330.0, -65.0),    # Chin
        (-225.0, 170.0, -135.0), # Left eye corner
        (225.0, 170.0, -135.0),  # Right eye corner
        (-150.0, -150.0, -125.0),# Left mouth corner
        (150.0, -150.0, -125.0), # Right mouth corner
    ], dtype=np.float64)

    FACE_INDICES = [1, 152, 33, 263, 61, 291]  # MediaPipe indices

    def estimate_pose(self, landmarks, frame_shape):
        h, w = frame_shape[:2]
        image_points = np.array([
            (landmarks[i].x * w, landmarks[i].y * h) for i in self.FACE_INDICES
        ], dtype=np.float64)

        focal_length = w
        camera_matrix = np.array([
            [focal_length, 0, w / 2],
            [0, focal_length, h / 2],
            [0, 0, 1]
        ], dtype=np.float64)

        _, rvec, tvec = cv2.solvePnP(
            self.MODEL_POINTS, image_points, camera_matrix,
            np.zeros((4, 1)), flags=cv2.SOLVEPNP_ITERATIVE
        )

        rmat, _ = cv2.Rodrigues(rvec)
        angles, _, _, _, _, _ = cv2.RQDecomp3x3(rmat)

        pitch, yaw, roll = angles
        facing_screen = abs(yaw) < 20 and abs(pitch) < 15
        return facing_screen, {'pitch': pitch, 'yaw': yaw, 'roll': roll}
```

### 4. Attention Calculator
```python
class AttentionCalculator:
    def __init__(self):
        self.history = []
        self.distraction_threshold = 50
        self.window_size = 30  # frames

    def calculate_score(self, face_detected, looking_at_screen, head_facing, ear_value):
        score = 0

        if not face_detected:
            score = 20  # Face not visible — likely distracted
        else:
            if head_facing:
                score += 40
            if looking_at_screen:
                score += 40
            if ear_value > 0.2:  # Eyes open
                score += 20

        self.history.append(score)
        if len(self.history) > self.window_size:
            self.history.pop(0)

        avg_score = sum(self.history) / len(self.history)
        is_distracted = avg_score < self.distraction_threshold

        status = 'focused' if avg_score >= 80 else 'reengaging' if avg_score >= 50 else 'distracted'

        return {
            'focus_score': round(avg_score),
            'is_distracted': is_distracted,
            'status': status,
            'raw_score': score,
        }
```

---

## API Contract

### POST `/api/attention/log/`
```json
{
  "user_id": 1,
  "lesson_id": 5,
  "focus_score": 87,
  "is_distracted": false,
  "status": "focused",
  "head_pose": {"pitch": 2.3, "yaw": -1.5, "roll": 0.8},
  "eye_gaze": {"x": 0.003, "y": -0.002},
  "ear_value": 0.28,
  "timestamp": "2026-01-01T10:00:00Z"
}
```

### GET `/api/attention/current/?user_id=1`
```json
{
  "user_id": 1,
  "focus_score": 87,
  "is_distracted": false,
  "status": "focused",
  "timestamp": "2026-01-01T10:00:00Z"
}
```

### WebSocket `/ws/attention/{user_id}/`
```json
// Sent every 2 seconds from client
{"focus_score": 85, "is_distracted": false, "status": "focused"}

// Server acknowledgment
{"received": true, "alert": null}

// Server alert (when distracted for >30s)
{"received": true, "alert": "distraction_detected", "duration": 35}
```

---

## Backend Integration Flow

```
1. Frontend captures webcam frames via getUserMedia()
2. MediaPipe processes frames in-browser (WebAssembly)
3. Calculated focus data sent to backend every 2-5 seconds
4. Backend stores in attention_logs table
5. If distraction detected for >30s:
   a. Backend sends WebSocket alert
   b. Frontend shows EngagementPopup
6. Session data aggregated for analytics
7. Focus trends available via /api/analytics/focus-trends/
```

---

## Dependencies

```
opencv-python==4.10.0
mediapipe==0.10.18
numpy==2.1.0
```

---

## Privacy & Ethics

- Camera feed is processed **locally in the browser** (MediaPipe WASM)
- Only numerical focus scores are sent to the server — **no images/video stored**
- Students can opt-out of attention monitoring at any time
- Data is anonymized for instructor-facing analytics
- GDPR-compliant data retention policies
