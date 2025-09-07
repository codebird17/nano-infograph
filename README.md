# 🎯 Nano Infograph

> **AI-powered YouTube transcript to infograph generator using Gemini 2.5 Flash Image**

Transform YouTube video content into stunning visual infographs with customizable styles, real-time editing, and AI-powered summarization.

## 🚀 Live Demo

**Try it now:** [https://nano-infograph.vercel.app/](https://nano-infograph.vercel.app/)

## ✨ Features

- **🎥 YouTube Integration**: Robust transcript extraction from any YouTube video
- **🤖 AI-Powered**: Gemini 2.5 Flash Image for real-time visual generation
- **🎨 Style Customization**: 6 distinct visual styles (Modern, Minimal, Corporate, Creative, Dark, Colorful)
- **✏️ Real-time Editing**: Interactive prompt editing with version management
- **📱 Responsive Design**: Minimal black and white aesthetic, works on all devices
- **⚡ Fast Processing**: Automatic summarization and infograph generation
- **🔄 Version Control**: Multiple image versions with carousel navigation

## 🚀 Local Development Setup

#### **Prerequisites**
- **Node.js 20.x** or higher
- **Python 3.9+** with pip
- **Git**

#### **Quick Setup**

```bash
# 1. Clone the repository
git clone https://github.com/codebird17/nano-infograph.git
cd nano-infograph

# 2. Install Node.js dependencies
npm install

# 3. Install Python dependencies
cd python-api
pip install -r requirements.txt
cd ..

# 4. Set up environment variables
cp env.example .env.local
```

#### **Configure Environment**
Open `.env.local` and add your API key:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your API key from: [Google AI Studio](https://aistudio.google.com/apikey)

#### **Start Development Servers**

**Option A: Automatic (Recommended)**
```bash
chmod +x dev-start.sh
./dev-start.sh
```

**Option B: Manual**
```bash
# Terminal 1 - Start Python API
cd python-api
python3 main.py

# Terminal 2 - Start Next.js app
npm run dev
```

#### **Access the Application**
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Python API**: [http://localhost:8001](http://localhost:8001)

#### **Testing the Setup**
1. Paste any YouTube URL in the input field
2. Click "Fetch Transcript" - you should see a sample transcript
3. The app will automatically generate a summary and infograph prompt
4. Select a style and click "Generate Infograph" to test Gemini integration

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
- **Deployment**: Self-hosted or cloud platforms
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
├── api/transcript.py      # Python API endpoint
├── python-api/           # FastAPI backend
└── dev-start.sh          # Development startup script
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

## 🤖 Gemini 2.5 Flash Image Integration

### Overview
Our YouTube Infograph Generator leverages **Gemini 2.5 Flash Image** as the core AI engine for transforming video transcripts into stunning visual infographs.

### Key Gemini Features Utilized

#### 1. **Text-to-Image Generation**
- Uses Gemini 2.5 Flash Image's `generateContent()` API with `gemini-2.5-flash-image-preview` model
- Converts structured text prompts into high-quality infograph images
- Handles complex visual requirements including typography, icons, charts, and layout design

#### 2. **Style-Aware Prompt Engineering**
- Implements 6 distinct visual styles (Modern, Minimal, Corporate, Creative, Dark, Colorful)
- Each style dynamically enhances prompts with specific design instructions
- Enables consistent visual branding across generated infographs

#### 3. **Base64 Image Processing**
- Extracts `inlineData` from Gemini's response parts
- Converts base64 image data to data URIs for immediate browser display
- Seamless integration without external file storage requirements

#### 4. **Iterative Design Workflow**
- Supports multiple image generations with custom prompts
- Enables real-time editing and refinement of infograph concepts
- Maintains version history for user comparison and selection

### Centrality to Application
Gemini 2.5 Flash Image is **essential** to our application - it transforms static YouTube transcripts into engaging visual content. Without Gemini's advanced image generation capabilities, our tool would be limited to text processing only. The model's ability to understand complex design requirements and generate professional-quality infographs makes visual storytelling accessible to everyone.


## 📖 Documentation

All setup and deployment instructions are included in this README file.

## 🎊 Demo

Try it live: [nano-infograph.vercel.app](https://nano-infograph.vercel.app)

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

[Live Demo](https://nano-infograph.vercel.app) • [GitHub Repository](https://github.com/codebird17/nano-infograph)

</div>
