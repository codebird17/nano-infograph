# Infograph Generator Setup Guide

A modern YouTube transcript-to-infograph generator with robust Python-powered transcript fetching and minimal black and white aesthetic.

## Architecture

- **Frontend**: Next.js 14 with React 19, Tailwind CSS, shadcn/ui
- **Backend**: Python FastAPI for reliable YouTube transcript fetching
- **AI**: Google Gemini for infograph generation
- **Design**: Clean, minimal black and white aesthetic

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd infograph

# Install Node.js dependencies
bun install  # or npm install
```

### 2. Set up Python API

```bash
cd python-api
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment

```bash
# Copy the example environment file
cp env.example .env.local

# Edit .env.local with your Gemini API key
# GEMINI_API_KEY=your_actual_api_key_here
```

### 4. Start Development Servers

**Option A: Automatic (Recommended)**
```bash
./dev-start.sh
```

**Option B: Manual**
```bash
# Terminal 1: Start Python API
cd python-api
python main.py

# Terminal 2: Start Next.js app
bun dev  # or npm run dev
```

### 5. Open the App

- **Next.js App**: http://localhost:3000
- **Python API**: http://localhost:8001

## Features

### 🎨 **Clean Design**
- Minimal black and white aesthetic
- Clean, functional interface
- Consistent typography and spacing
- Responsive design for all devices

### 📺 **Robust YouTube Integration**
- Multiple transcript extraction libraries (`youtube-transcript-api`, `yt-dlp`, `pytube`)
- Automatic language detection
- Fallback mechanisms for maximum reliability
- Proxy support for cloud deployments

### 🤖 **AI-Powered Generation**
- Google Gemini integration for infograph creation
- Smart content summarization
- Visual infograph generation

### ⚡ **Developer Experience**
- TypeScript throughout
- Server actions for seamless data flow
- Real-time error handling
- Comprehensive logging

## Usage

1. **Fetch from YouTube**: Enter any YouTube URL to automatically extract transcript
2. **Manual Input**: Or paste transcript text directly
3. **Generate**: Click "Generate Infograph" to create visual content
4. **Export**: View and download your generated infograph

## Troubleshooting

### Python API Issues

**"Could not connect to Python API"**
- Ensure Python server is running on port 8001
- Check `python-api/main.py` is executing without errors
- Verify no firewall blocking port 8001

**"No transcript available"**
- Try a different video with known captions
- Check if video is public and not region-restricted
- Some videos may not have transcripts enabled

### Common Solutions

1. **Restart both servers** using `./dev-start.sh`
2. **Check console logs** in both browser and terminal
3. **Verify API key** in `.env.local`
4. **Test with known working videos**:
   - `https://www.youtube.com/watch?v=9bZkp7q19f0` (TED Talk)
   - `https://www.youtube.com/watch?v=dQw4w9WgXcQ` (Has auto-captions)

## Development

### Project Structure

```
infograph/
├── app/                    # Next.js app directory
├── components/             # React components
├── lib/                   # Utilities and actions
├── python-api/            # Python FastAPI server
│   ├── main.py           # FastAPI application
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Python API docs
├── dev-start.sh          # Development startup script
└── SETUP.md              # This file
```

### Key Components

- **`components/youtube-transcript.tsx`**: YouTube URL input and transcript display
- **`components/transcript-input.tsx`**: Manual transcript input
- **`lib/actions.ts`**: Server actions for API calls
- **`python-api/main.py`**: Robust YouTube transcript fetching

### Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional
PYTHON_API_URL=http://localhost:8001  # Default

# Cloud deployment proxy support (optional)
YTA_WEBSHARE_USERNAME=your_username
YTA_WEBSHARE_PASSWORD=your_password
```

## Deployment

### Local Development
Use `./dev-start.sh` for the best development experience.

### Production
1. Deploy Python API to a service that supports Python (Railway, Render, etc.)
2. Deploy Next.js app to Vercel/Netlify
3. Update `PYTHON_API_URL` environment variable to point to your Python API

## Contributing

1. Follow the minimal design philosophy: clean, functional, purposeful
2. Maintain TypeScript strict mode
3. Test with various YouTube videos
4. Update documentation for new features

## License

MIT License - see LICENSE file for details.
