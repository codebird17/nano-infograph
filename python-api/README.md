# YouTube Transcript API

A robust Python-based API for fetching YouTube video transcripts, extracted from the reliable YouTube-to-Doc implementation.

## Features

- **Multiple Libraries**: Uses `youtube-transcript-api`, `yt-dlp`, and `pytube` for maximum reliability
- **Proxy Support**: Built-in support for proxy configurations (useful for cloud deployments)
- **Fallback Mechanisms**: Multiple strategies for transcript extraction
- **Error Handling**: Comprehensive error handling with specific error messages
- **Auto-detection**: Automatically finds the best available transcript language
- **Fast API**: RESTful API built with FastAPI

## Quick Start

### 1. Install Dependencies

```bash
cd python-api
pip install -r requirements.txt
```

### 2. Start the API Server

```bash
python start.py
```

Or directly:

```bash
python main.py
```

The API will be available at `http://localhost:8001`

### 3. Test the API

You can test the API using curl:

```bash
curl -X POST "http://localhost:8001/transcript" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "max_length": 50000,
    "language": "en"
  }'
```

## API Endpoints

### POST `/transcript`

Fetch transcript for a YouTube video.

**Request Body:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "max_length": 50000,
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "Video transcript text...",
  "video_id": "VIDEO_ID",
  "detected_language": "en",
  "title": "Video Title",
  "duration": 120
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Environment Variables (Optional)

For enhanced functionality, you can set these environment variables:

```bash
# Proxy Configuration (for cloud deployments)
YTA_WEBSHARE_USERNAME=your_username
YTA_WEBSHARE_PASSWORD=your_password
YTA_WEBSHARE_LOCATIONS=jp,kr,tw

# Or generic HTTP/HTTPS proxies
YTA_HTTP_PROXY=http://user:pass@proxy:port
YTA_HTTPS_PROXY=https://user:pass@proxy:port
```

## Integration with Next.js

The Next.js app is configured to call this Python API. Make sure both servers are running:

1. **Python API**: `http://localhost:8001`
2. **Next.js App**: `http://localhost:3000`

The Next.js app will automatically detect and use the Python API for transcript fetching.

## Troubleshooting

### Common Issues

1. **"Could not connect to Python API"**
   - Make sure the Python server is running on port 8001
   - Check if the port is blocked by firewall

2. **"No transcript available"**
   - Verify the video has captions enabled
   - Try a different video with known captions
   - Check if the video is public and not region-restricted

3. **Dependency Issues**
   - Run `pip install -r requirements.txt` again
   - Try using a Python virtual environment

### Testing with Known Working Videos

Try these videos that typically have reliable transcripts:

- `https://www.youtube.com/watch?v=9bZkp7q19f0` (TED Talk)
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Rick Roll - has auto-generated captions)

## Development

The API is built with FastAPI and includes:

- CORS middleware for Next.js integration
- Comprehensive error handling
- Multiple transcript extraction strategies
- Proxy support for cloud deployments
- Detailed logging for debugging
