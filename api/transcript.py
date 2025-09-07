"""
Vercel Serverless Function for YouTube Transcript Fetching
Replaces the FastAPI server for Vercel deployment
"""

from http.server import BaseHTTPRequestHandler
import json
import urllib.parse
import re
from typing import Optional

# Lightweight transcript fetching (Vercel-optimized)
try:
    from youtube_transcript_api import YouTubeTranscriptApi
except ImportError:
    YouTubeTranscriptApi = None

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Handle CORS
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        
        try:
            # Parse request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            url = data.get('url', '')
            max_length = data.get('max_length', 50000)
            
            # Extract video ID
            video_id = self.extract_video_id(url)
            if not video_id:
                self.write_error("Invalid YouTube URL")
                return
            
            # Fetch transcript
            if not YouTubeTranscriptApi:
                self.write_error("YouTube transcript API not available")
                return
                
            try:
                # Try to get transcript
                transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                transcript = transcript_list.find_transcript(['en', 'en-US'])
                transcript_data = transcript.fetch()
                
                # Process transcript
                text = ' '.join([item['text'] for item in transcript_data])
                text = self.clean_transcript(text)
                
                # Truncate if too long
                if len(text) > max_length:
                    text = text[:max_length] + "..."
                
                response = {
                    "success": True,
                    "transcript": text,
                    "length": len(text),
                    "video_id": video_id
                }
                
            except Exception as e:
                self.write_error(f"Failed to fetch transcript: {str(e)}")
                return
                
        except Exception as e:
            self.write_error(f"Request processing error: {str(e)}")
            return
        
        # Send successful response
        self.wfile.write(json.dumps(response).encode('utf-8'))
    
    def do_OPTIONS(self):
        # Handle preflight CORS request
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)',
            r'youtube\.com\/watch\?.*v=([^&\n?#]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None
    
    def clean_transcript(self, text: str) -> str:
        """Clean and format transcript text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove common transcript artifacts
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'\(.*?\)', '', text)
        return text.strip()
    
    def write_error(self, message: str):
        """Write error response"""
        response = {
            "success": False,
            "error": message
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))
