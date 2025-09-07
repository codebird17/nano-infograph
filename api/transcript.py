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
    TRANSCRIPT_API_AVAILABLE = True
except ImportError:
    YouTubeTranscriptApi = None
    TRANSCRIPT_API_AVAILABLE = False

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
            if not TRANSCRIPT_API_AVAILABLE:
                # For testing - return a mock response when API is not available
                response = {
                    "success": True,
                    "transcript": "This is a test transcript response. YouTube transcript API is not available in this deployment, but the Python serverless function is working correctly.",
                    "length": 150,
                    "video_id": video_id,
                    "note": "Mock response - install youtube-transcript-api for real functionality"
                }
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
                
            try:
                # Robust transcript fetching with multiple strategies
                
                # Strategy 1: Try direct fetch first
                try:
                    transcript_data = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'en-US'])
                    text = ' '.join([item['text'] for item in transcript_data])
                    text = self.clean_transcript(text)
                    
                    if len(text) > max_length:
                        text = text[:max_length] + "..."
                    
                    response = {
                        "success": True,
                        "transcript": text,
                        "length": len(text),
                        "video_id": video_id
                    }
                    
                except Exception as direct_error:
                    # Strategy 2: Try listing transcripts and finding best available
                    try:
                        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                        
                        # Try manually created transcripts first
                        transcript = None
                        try:
                            transcript = transcript_list.find_manually_created_transcript(['en', 'en-US'])
                        except:
                            try:
                                # Try auto-generated transcripts
                                transcript = transcript_list.find_generated_transcript(['en', 'en-US'])
                            except:
                                # Try any available transcript
                                for t in transcript_list:
                                    transcript = t
                                    break
                        
                        if transcript:
                            transcript_data = transcript.fetch()
                            text = ' '.join([item['text'] for item in transcript_data])
                            text = self.clean_transcript(text)
                            
                            if len(text) > max_length:
                                text = text[:max_length] + "..."
                            
                            response = {
                                "success": True,
                                "transcript": text,
                                "length": len(text),
                                "video_id": video_id,
                                "detected_language": transcript.language_code
                            }
                        else:
                            raise Exception("No transcripts available")
                            
                    except Exception as list_error:
                        # Strategy 3: Return helpful error message
                        self.write_error(f"No transcript available for this video. Tried multiple methods: {str(direct_error)[:100]}... {str(list_error)[:100]}...")
                        return
                        
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
