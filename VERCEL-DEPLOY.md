# 🚀 Vercel-Only Deployment Guide

**⚠️ Important Limitations**: Vercel Python functions have constraints that may affect reliability:
- 10-second timeout limit
- Cold start delays with YouTube libraries  
- Potential package compatibility issues

## 📋 **What Changed for Vercel**

**✅ Created:**
- `api/transcript.py` - Vercel serverless function (replaces FastAPI)
- `requirements.txt` - Minimal Python dependencies
- `vercel.json` - Vercel configuration

**🔄 Modified:**
- Streamlined transcript fetching (removed heavy libraries)
- Single-endpoint API instead of full FastAPI server

## 🚀 **Deployment Steps**

### **Step 1: Update Frontend (if needed)**
Your existing frontend should work, but update the API URL:

```typescript
// In lib/actions.ts, ensure PYTHON_API_URL uses Vercel functions:
const apiUrl = process.env.PYTHON_API_URL || '/api/transcript'
```

### **Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Project name: infograph-generator
# - Framework: Next.js
# - Deploy: Yes
```

### **Step 3: Configure Environment Variables**
In Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   GEMINI_API_KEY = your_gemini_api_key_here
   ```

### **Step 4: Test Deployment**
Visit your Vercel URL and test:
- YouTube transcript fetching
- AI summarization  
- Infograph generation

## ⚠️ **Known Limitations**

**Potential Issues:**
- **Timeout**: Complex YouTube processing may hit 10-second limit
- **Cold Starts**: First request after inactivity will be slow
- **Reliability**: Less robust than dedicated Python server
- **Limited Libraries**: Can't use heavy YouTube processing tools

**If You Experience Issues:**
- Try shorter videos first
- Expect 3-5 second delays on cold starts
- Consider fallback to manual transcript input

## 🔄 **Alternative: Hybrid Approach**

If Vercel limitations cause problems:

**Option A: Vercel + Railway**
- Frontend on Vercel (fastest)
- Python API on Railway (most reliable)
- Best of both worlds

**Option B: Railway Only** 
- Both services on Railway
- More reliable, slightly slower frontend

## 📝 **Vercel vs Railway Trade-offs**

| Feature | Vercel Only | Railway |
|---------|-------------|---------|
| **Frontend Speed** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Python Reliability** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Setup Complexity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Cold Starts** | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Hackathon Ready** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 🎯 **Recommendation**

**For Hackathon Judges:**
- Use **Railway** for maximum reliability
- Vercel works but may have hiccups during demos
- Consider your risk tolerance for live presentations

**Try Vercel if:**
- You want everything in one place
- Willing to accept some limitations
- Have backup plans for demo failures

**Use Railway if:**
- Reliability is critical
- Want robust YouTube processing
- Prefer proven deployment path
