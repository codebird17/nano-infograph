# 🎯 Nano Infograph

> **AI-powered YouTube transcript to infograph generator using Gemini 2.5 Flash Image**

Transform YouTube video content into stunning visual infographs with customizable styles, real-time editing, and AI-powered summarization.

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/codebird17/nano-infograph)

## ✨ Features

- **🎥 YouTube Integration**: Robust transcript extraction from any YouTube video
- **🤖 AI-Powered**: Gemini 2.5 Flash Image for real-time visual generation
- **🎨 Style Customization**: 6 distinct visual styles (Modern, Minimal, Corporate, Creative, Dark, Colorful)
- **✏️ Real-time Editing**: Interactive prompt editing with version management
- **📱 Responsive Design**: Minimal black and white aesthetic, works on all devices
- **⚡ Fast Processing**: Automatic summarization and infograph generation
- **🔄 Version Control**: Multiple image versions with carousel navigation

## 🚀 Quick Start

### **Option 1: Deploy to Vercel (Recommended)**

1. Click the "Deploy to Vercel" button above
2. Add your `GEMINI_API_KEY` in Vercel environment variables
3. Deploy and start creating infographs!

### **Option 2: Local Development**

```bash
# Clone the repository
git clone https://github.com/codebird17/nano-infograph.git
cd nano-infograph

# Install dependencies
npm install
cd python-api && pip install -r requirements.txt && cd ..

# Set up environment
cp env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Start development servers
./dev-start.sh
```

Visit `http://localhost:3000` to start creating infographs!

## 🎬 How It Works

1. **📋 Paste YouTube URL** → Automatic transcript extraction
2. **🤖 AI Processing** → Summary and infograph prompt generation  
3. **🎨 Style Selection** → Choose from 6 visual styles
4. **⚡ Generate** → Real-time infograph creation with Gemini 2.5 Flash Image
5. **✏️ Edit & Refine** → Interactive editing with version management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TailwindCSS
- **Backend**: Python FastAPI, multiple YouTube libraries
- **AI**: Google Gemini 2.5 Flash Image, Gemini 1.5 Flash
- **Deployment**: Vercel (serverless functions)
- **Styling**: Minimal black and white aesthetic

## 🔧 Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (for local development)
PYTHON_API_URL=http://localhost:8001
```

Get your Gemini API key: [Google AI Studio](https://aistudio.google.com/apikey)

## 📁 Project Structure

```
nano-infograph/
├── app/                    # Next.js app directory
├── components/             # React components
│   └── youtube-transcript.tsx  # Main component
├── lib/actions.ts         # Server actions & AI integration
├── api/transcript.py      # Vercel serverless function
├── python-api/           # Alternative FastAPI backend
├── gemini.md             # Hackathon writeup
└── vercel-deploy.sh      # One-click deployment
```

## 🎯 Key Features

### **Gemini 2.5 Flash Image Integration**
- Text-to-image generation with style-aware prompts
- Base64 image processing for immediate display
- Professional infograph layouts with typography and visual elements

### **Robust YouTube Processing** 
- Multiple extraction libraries (`youtube-transcript-api`, `yt-dlp`, `pytube`)
- Automatic fallbacks for maximum reliability
- Language detection and proxy support

### **Interactive Design Workflow**
- Real-time prompt editing and refinement
- Multiple image versions with comparison
- Instant style switching and regeneration

## 🚀 Deployment Options

### **Vercel (Recommended)**
- ✅ One-click deployment
- ✅ Serverless functions for Python
- ✅ Automatic HTTPS and CDN

### **Railway**
- ✅ Full Python support
- ✅ No timeout limitations
- ✅ Persistent server instances

### **Local Development**
- ✅ Full feature development
- ✅ FastAPI backend
- ✅ Hot reloading

## 📖 Documentation

- [`SETUP.md`](./SETUP.md) - Detailed setup instructions
- [`VERCEL-DEPLOY.md`](./VERCEL-DEPLOY.md) - Vercel deployment guide
- [`gemini.md`](./gemini.md) - Hackathon submission writeup

## 🎊 Demo

Try it live: [nano-infograph.vercel.app](https://nano-infograph.vercel.app) *(after deployment)*

**Sample YouTube URLs to test:**
- TED Talks: `https://www.youtube.com/watch?v=9bZkp7q19f0`
- Educational content: `https://www.youtube.com/watch?v=3CSlL8R7_h8`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**🏆 Built for hackathons • ⚡ Powered by Gemini 2.5 Flash Image • 🎨 Minimal design**

[Live Demo](https://nano-infograph.vercel.app) • [Documentation](./SETUP.md) • [Deploy](https://vercel.com/new/clone?repository-url=https://github.com/codebird17/nano-infograph)

</div>
