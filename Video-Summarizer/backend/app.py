from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import time
import threading
import uuid
import os
import yt_dlp
import subprocess
from groq import Groq
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
AUDIO_FOLDER = os.path.join(BASE_DIR, "audio_chunks")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(AUDIO_FOLDER, exist_ok=True)

jobs = {}

# -------------------------------
# AUDIO EXTRACTION
# -------------------------------
def extract_audio(video_path):
    video_path = os.path.abspath(video_path)

    audio_path = os.path.splitext(video_path)[0] + ".wav"

    result = subprocess.run([
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        audio_path
    ], capture_output=True, text=True)

    if result.returncode != 0:
        raise Exception(f"FFmpeg error: {result.stderr}")

    return audio_path


# -------------------------------
# AUDIO CHUNKING (IMPORTANT)
# -------------------------------
def chunk_audio(audio_path, job_id, base_chunk_dir=AUDIO_FOLDER):
    chunk_dir = os.path.join(base_chunk_dir, job_id)
    os.makedirs(chunk_dir, exist_ok=True)

    output_pattern = os.path.join(chunk_dir, "chunk_%03d.wav")

    subprocess.run([
        "ffmpeg", "-y",
        "-i", audio_path,
        "-f", "segment",
        "-segment_time", "60",
        output_pattern
    ], check=True)

    return sorted([
        os.path.join(chunk_dir, f)
        for f in os.listdir(chunk_dir)
        if f.endswith(".wav")
    ])


# -------------------------------
# TRANSCRIBE CHUNKS (GROQ)
# -------------------------------
def transcribe_chunks(chunk_files):
    full_text = []

    for chunk in chunk_files:
        print(f"Transcribing {chunk}...")
        with open(chunk, "rb") as file:
            res = client.audio.transcriptions.create(
                file=(os.path.basename(chunk), file.read()),
                model="whisper-large-v3"
            )
            full_text.append(res.text)

    return " ".join(full_text)


# -------------------------------
# TEXT CHUNKING
# -------------------------------
def split_text(text, word_limit=500):
    words = text.split()

    chunks = []
    for i in range(0, len(words), word_limit):
        chunks.append(" ".join(words[i:i + word_limit]))

    return chunks

# -------------------------------
# SUMMARIZATION (GROQ LLM)
# -------------------------------
def summarize(text_chunks):
    summaries = []

    for chunk in text_chunks:
        res = client.chat.completions.create(
            # model="llama3-70b-8192",
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a specialized AI summarizer. Your task is to output a concise, bulleted summary of the provided video transcript. DO NOT converse with the user, DO NOT answer questions, and DO NOT output conversational filler like 'Here is a summary'. If the transcript is extremely short, nonsensical, or appears to be just background noise/silence (e.g., 'Thank you.', 'Thanks for watching'), simply output absolutely nothing (an empty string). Otherwise, ONLY output the bullet points."
                },
                {
                    "role": "user",
                    "content": f"Transcript:\n{chunk}"
                }
            ]
        )
        summaries.append(res.choices[0].message.content)

    return "\n\n".join(summaries)


# -------------------------------
# MAIN PIPELINE
# -------------------------------
def process_video(job_id):
    try:
        file_path = jobs[job_id]["file_path"]

        jobs[job_id]["status"] = "extracting_audio"
        audio_path = extract_audio(file_path)

        jobs[job_id]["status"] = "chunking_audio"
        audio_chunks = chunk_audio(audio_path, job_id)

        jobs[job_id]["status"] = "transcribing"
        transcript = transcribe_chunks(audio_chunks)

        jobs[job_id]["status"] = "chunking_text"
        text_chunks = split_text(transcript, 500)

        jobs[job_id]["status"] = "summarizing"
        summary = summarize(text_chunks)
    
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["result"] = {
            "title": f"Processed File: {file_path}",
            "video_url": f"http://127.0.0.1:5000/uploads/{os.path.basename(file_path)}",
            "transcript": transcript,
            "summary": summary
        }

    except Exception as e:
        jobs[job_id]["status"] = "error"
        jobs[job_id]["error"] = str(e)


# -------------------------------
# DOWNLOAD VIDEO
# -------------------------------
def download_video(url, job_id):
    file_path = os.path.join(UPLOAD_FOLDER, f"{job_id}.mp4")

    ydl_opts = {
        'outtmpl': file_path,
        'quiet': True,
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        'merge_output_format': 'mp4'
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return file_path


# -------------------------------
# URL ROUTE
# -------------------------------
@app.route('/api/process_url', methods=['POST'])
def process_url():
    data = request.json
    url = data.get('url')

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "downloading"}

    def task():
        try:
            file_path = download_video(url, job_id)
            jobs[job_id]["file_path"] = file_path
            
            process_video(job_id)

        except Exception as e:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(e)

    threading.Thread(target=task).start()

    return jsonify({"job_id": job_id})


# -------------------------------
# UPLOAD ROUTE
# -------------------------------
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    job_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = ".mp4"
    file_path = os.path.join(UPLOAD_FOLDER, f"{job_id}{ext}")
    file.save(file_path)
    
    jobs[job_id] = {
        "status": "downloading",
        "file_path": file_path
    }

    def task():
        try:
            process_video(job_id)
        except Exception as e:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(e)

    threading.Thread(target=task).start()

    return jsonify({"job_id": job_id})


# -------------------------------
# STATUS
# -------------------------------
@app.route('/api/status/<job_id>')
def status(job_id):
    return jsonify(jobs.get(job_id, {"error": "not found"}))

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


# -------------------------------
# RESULT
# -------------------------------
@app.route('/api/result/<job_id>')
def result(job_id):
    job = jobs.get(job_id)

    if not job:
        return jsonify({"error": "not found"}), 404

    if job["status"] != "completed":
        return jsonify({"error": "not ready"}), 400

    return jsonify(job["result"])


# -------------------------------
# RUN
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)