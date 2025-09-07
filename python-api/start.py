#!/usr/bin/env python3
"""
Start script for the YouTube Transcript API server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages."""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        sys.exit(1)

def start_server():
    """Start the FastAPI server."""
    print("Starting YouTube Transcript API server on http://localhost:8001")
    print("Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")

if __name__ == "__main__":
    # Change to the script directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Install dependencies if needed
    if "--install" in sys.argv or not os.path.exists("venv"):
        install_requirements()
    
    # Start the server
    start_server()
