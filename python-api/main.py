"""
YouTube Transcript API - Minimal FastAPI server for reliable transcript fetching
Extracted from the robust YouTube-to-Doc implementation
"""

import asyncio
import os
import re
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Core transcript fetching libraries
try:
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api.formatters import TextFormatter
except ImportError:
    YouTubeTranscriptApi = None
    TextFormatter = None

try:
    import yt_dlp
except ImportError:
    yt_dlp = None

try:
    from pytube import YouTube
except ImportError:
    YouTube = None

# Optional proxy support
try:
    from youtube_transcript_api.proxies import WebshareProxyConfig, GenericProxyConfig
except Exception:
    WebshareProxyConfig = None
    GenericProxyConfig = None


app = FastAPI(title="YouTube Transcript API", version="1.0.0")

# Add CORS middleware to allow Next.js app to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000"
    ],
    allow_origin_regex=r"https://.*\.(railway\.app|onrender\.com|vercel\.app|netlify\.app)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TranscriptRequest(BaseModel):
    url: str
    max_length: int = 50000
    language: str = "en"


class TranscriptResponse(BaseModel):
    success: bool
    transcript: Optional[str] = None
    error: Optional[str] = None
    video_id: Optional[str] = None
    detected_language: Optional[str] = None
    title: Optional[str] = None
    duration: Optional[int] = None


class YouTubeProcessor:
    """YouTube video processor for extracting transcript data."""
    
    def __init__(self):
        self.text_formatter = TextFormatter() if TextFormatter else None
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Check if required dependencies are available."""
        print("Checking YouTube processor dependencies...")
        
        if YouTubeTranscriptApi is None:
            print("ERROR: youtube-transcript-api not available")
        else:
            print("SUCCESS: youtube-transcript-api available")
        
        if yt_dlp is None:
            print("WARNING: yt-dlp not available - will fallback to pytube")
        else:
            print("SUCCESS: yt-dlp available")
        
        if YouTube is None:
            print("WARNING: pytube not available")
        else:
            print("SUCCESS: pytube available")

    def _get_proxy_config(self):
        """Build optional ProxyConfig from environment variables."""
        # Webshare rotating residential proxies
        ws_username = os.getenv("YTA_WEBSHARE_USERNAME")
        ws_password = os.getenv("YTA_WEBSHARE_PASSWORD")
        ws_locations_raw = os.getenv("YTA_WEBSHARE_LOCATIONS")
        ws_locations = (
            [loc.strip() for loc in ws_locations_raw.split(",") if loc.strip()]
            if ws_locations_raw
            else None
        )

        if WebshareProxyConfig and ws_username and ws_password:
            try:
                print("Initializing WebshareProxyConfig for youtube-transcript-api")
                return WebshareProxyConfig(
                    proxy_username=ws_username,
                    proxy_password=ws_password,
                    filter_ip_locations=ws_locations,
                )
            except Exception as e:
                print(f"Failed to create WebshareProxyConfig: {e}")

        # Generic proxy URLs
        http_proxy = os.getenv("YTA_HTTP_PROXY") or os.getenv("HTTP_PROXY")
        https_proxy = os.getenv("YTA_HTTPS_PROXY") or os.getenv("HTTPS_PROXY")
        if GenericProxyConfig and (http_proxy or https_proxy):
            try:
                print("Initializing GenericProxyConfig for youtube-transcript-api")
                return GenericProxyConfig(
                    http_url=http_proxy,
                    https_url=https_proxy,
                )
            except Exception as e:
                print(f"Failed to create GenericProxyConfig: {e}")

        return None

    def _build_ytt_api(self):
        """Create YouTubeTranscriptApi instance with optional proxy support."""
        proxy_config = self._get_proxy_config()
        if proxy_config is not None:
            return YouTubeTranscriptApi(proxy_config=proxy_config)
        return YouTubeTranscriptApi()

    def extract_video_id(self, url: str) -> Optional[str]:
        """Extract video ID from various YouTube URL formats."""
        patterns = [
            r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
            r'(?:https?://)?(?:www\.)?youtu\.be/([a-zA-Z0-9_-]{11})',
            r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]{11})',
            r'(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]{11})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None

    def is_valid_youtube_url(self, url: str) -> bool:
        """Check if URL is a valid YouTube URL."""
        return self.extract_video_id(url) is not None

    def clean_transcript_text(self, text: str) -> str:
        """Clean and format transcript text."""
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might cause issues
        text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]', '', text)
        
        # Strip leading/trailing whitespace
        return text.strip()

    async def get_video_info(self, video_id: str, url: str) -> Dict[str, Any]:
        """Get basic video information."""
        if yt_dlp:
            try:
                return await self._get_video_info_yt_dlp(video_id, url)
            except Exception as e:
                print(f"yt-dlp failed: {e}")
        
        if YouTube:
            try:
                return await self._get_video_info_pytube(url)
            except Exception as e:
                print(f"pytube failed: {e}")
        
        # Fallback
        return {
            "title": f"Video {video_id}",
            "duration": 0,
            "video_id": video_id,
        }

    async def _get_video_info_yt_dlp(self, video_id: str, url: str) -> Dict[str, Any]:
        """Extract video info using yt-dlp."""
        def extract_info():
            http_proxy = os.getenv("YTA_HTTPS_PROXY") or os.getenv("HTTPS_PROXY") or \
                         os.getenv("YTA_HTTP_PROXY") or os.getenv("HTTP_PROXY")
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': False,
                **({'proxy': http_proxy} if http_proxy else {}),
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                return {
                    "title": info.get('title', 'Unknown Title'),
                    "duration": info.get('duration', 0),
                    "video_id": video_id,
                }
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, extract_info)

    async def _get_video_info_pytube(self, url: str) -> Dict[str, Any]:
        """Extract video info using pytube."""
        def extract_info():
            proxies = None
            http_proxy = os.getenv("YTA_HTTP_PROXY") or os.getenv("HTTP_PROXY")
            https_proxy = os.getenv("YTA_HTTPS_PROXY") or os.getenv("HTTPS_PROXY")
            if http_proxy or https_proxy:
                proxies = {}
                if http_proxy:
                    proxies['http'] = http_proxy
                if https_proxy:
                    proxies['https'] = https_proxy
            
            yt = YouTube(url, proxies=proxies) if proxies else YouTube(url)
            return {
                "title": yt.title,
                "duration": yt.length,
                "video_id": yt.video_id,
            }
        
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, extract_info)

    async def get_transcript(
        self, 
        video_id: str, 
        language: str = "en", 
        max_length: int = 50000
    ) -> Tuple[Optional[str], Optional[str]]:
        """Extract video transcript."""
        print(f"Attempting transcript extraction for video_id: {video_id}")
        
        if not YouTubeTranscriptApi or not self.text_formatter:
            print("ERROR: Required transcript libraries not available")
            return None, None
        
        def extract_transcript():
            try:
                ytt_api = self._build_ytt_api()
                
                # Try direct fetch first
                try:
                    print(f"Attempting direct fetch for video {video_id} with language {language}")
                    fetched_transcript = ytt_api.fetch(video_id, languages=[language])
                    
                    formatted_text = self.text_formatter.format_transcript(fetched_transcript)
                    
                    if max_length and len(formatted_text) > max_length:
                        formatted_text = formatted_text[:max_length] + "\n[Transcript truncated...]"
                    
                    print("Direct fetch successful")
                    return formatted_text, language
                    
                except Exception as e:
                    print(f"Direct fetch failed: {e}")
                    
                    # Try listing and finding best transcript
                    try:
                        transcript_list = ytt_api.list(video_id)
                        print(f"Available transcripts: {[t.language_code for t in transcript_list]}")
                        
                        # Try manual captions first, then auto-generated
                        transcript = None
                        detected_language = language
                        
                        try:
                            transcript = transcript_list.find_manually_created_transcript([language])
                            print(f"Found manually created transcript in {language}")
                        except Exception:
                            try:
                                transcript = transcript_list.find_generated_transcript([language])
                                print(f"Found auto-generated transcript in {language}")
                            except Exception:
                                # Find best available
                                transcript, detected_language = self._find_best_available_transcript(transcript_list)
                        
                        if not transcript:
                            print("No transcript found")
                            return None, None
                        
                        fetched_transcript = transcript.fetch()
                        formatted_text = self.text_formatter.format_transcript(fetched_transcript)
                        
                        if max_length and len(formatted_text) > max_length:
                            formatted_text = formatted_text[:max_length] + "\n[Transcript truncated...]"
                        
                        print("Transcript extraction successful via listing")
                        return formatted_text, detected_language
                        
                    except Exception as e2:
                        print(f"Listing method also failed: {e2}")
                        raise e2
                
            except Exception as e:
                print(f"Transcript extraction failed: {e}")
                return None, None
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, extract_transcript)
        return result

    def _find_best_available_transcript(self, transcript_list):
        """Find the best available transcript from transcript list."""
        try:
            # First try manually created transcripts
            for transcript in transcript_list:
                if not transcript.is_generated:
                    print(f"Using manually created transcript: {transcript.language_code}")
                    return transcript, transcript.language_code
            
            # Then try auto-generated
            for transcript in transcript_list:
                if transcript.is_generated:
                    print(f"Using auto-generated transcript: {transcript.language_code}")
                    return transcript, transcript.language_code
            
            # Last resort - any transcript
            for transcript in transcript_list:
                print(f"Using any available transcript: {transcript.language_code}")
                return transcript, transcript.language_code
                
            return None, None
            
        except Exception as e:
            print(f"Failed to find best transcript: {e}")
            return None, None


# Initialize processor
processor = YouTubeProcessor()


@app.get("/")
async def root():
    return {"message": "YouTube Transcript API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/transcript", response_model=TranscriptResponse)
async def fetch_transcript(request: TranscriptRequest):
    """Fetch YouTube video transcript."""
    try:
        print(f"Processing transcript request for URL: {request.url}")
        
        # Validate URL
        if not processor.is_valid_youtube_url(request.url):
            return TranscriptResponse(
                success=False,
                error="Invalid YouTube URL format. Please provide a valid YouTube video URL."
            )
        
        # Extract video ID
        video_id = processor.extract_video_id(request.url)
        if not video_id:
            return TranscriptResponse(
                success=False,
                error="Could not extract video ID from URL."
            )
        
        print(f"Extracted video ID: {video_id}")
        
        # Get video info (optional, for title)
        video_info = {}
        try:
            video_info = await processor.get_video_info(video_id, request.url)
        except Exception as e:
            print(f"Could not get video info: {e}")
        
        # Get transcript
        transcript, detected_language = await processor.get_transcript(
            video_id, request.language, request.max_length
        )
        
        if transcript is None:
            return TranscriptResponse(
                success=False,
                error="No transcript available for this video. The video might not have captions enabled.",
                video_id=video_id
            )
        
        # Clean transcript
        transcript = processor.clean_transcript_text(transcript)
        
        print(f"Successfully processed transcript: {len(transcript)} characters")
        
        return TranscriptResponse(
            success=True,
            transcript=transcript,
            video_id=video_id,
            detected_language=detected_language,
            title=video_info.get("title"),
            duration=video_info.get("duration")
        )
        
    except Exception as e:
        print(f"Error processing transcript request: {e}")
        
        # Handle specific error types
        error_message = "Failed to fetch transcript"
        if "Video unavailable" in str(e) or "private" in str(e):
            error_message = "Video is unavailable, private, or region-restricted."
        elif "Transcript" in str(e) or "captions" in str(e):
            error_message = "No transcript available for this video. The video might not have captions enabled."
        elif "network" in str(e) or "timeout" in str(e):
            error_message = "Network error. Please check your connection and try again."
        else:
            error_message = f"Failed to fetch transcript: {str(e)}"
        
        return TranscriptResponse(
            success=False,
            error=error_message
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
