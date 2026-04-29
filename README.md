🎬 Video Summarizer using Generative AI
Transform long videos into concise insights using AI
-An end-to-end AI-powered system that converts video/audio into text and generates concise summaries, bullet points, and key insights using OpenAI Whisper and Large Language Models (GPT/Gemini). The project includes a React (Vite) frontend and a Python-based backend, making it a full-stack AI application.

🚀 Features
🎤 Speech-to-text using OpenAI Whisper
🧠 AI-based summarization using LLMs (GPT/Gemini)
📄 Generates:
Concise summaries
Bullet points
Key insights
🌐 Interactive frontend built with React
⚡ Efficient processing of long video content

🛠️ Tech Stack
Frontend: React (Vite), JavaScript
Backend: Python
AI Models: OpenAI Whisper, GPT / Google Gemini
Concepts: Natural Language Processing (NLP)

⚙️ How It Works
Upload or provide video/audio input
Extract audio from the video
Convert speech to text using Whisper
Process and clean the transcript
Generate structured summaries using LLMs
Display results via the frontend interface

🚀 Getting Started
Installation:
git clone https://github.com/anushkasingh20/Video-Summarizer.git
cd Video-Summarizer
npm install
pip install -r requirements.txt

Run:
npm run dev   # Run frontend
python main.py   # Run backend

📌 Use Cases
Summarizing lectures
Extracting key points from podcasts
Quick understanding of long videos
Educational content compression

🔮 Future Improvements
Multi-language support
Real-time summarization
Timestamp-based summaries
Deployment (web app)

📁 Project Structure
Video-Summarizer/
│── backend/        # Python backend (Whisper + LLM processing)
│── src/            # React frontend source code
│── public/         # Static assets
│── dist/           # Production build files
│── index.html      # Entry point
│── package.json    # Dependencies and scripts
│── package-lock.json
│── vite.config.ts  # Vite configuration
│── tsconfig.json
│── eslint.config.js
│── README.md

🙌 Author
Anushka Singh
