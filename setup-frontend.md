# 🚀 Frontend Setup Guide

## Quick Start

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open Browser
Navigate to `http://localhost:3000`

## 🔧 What You Need

- **Node.js 16+** installed on your system
- **Python backend** running on port 8000
- **YouTube API key** configured in your `.env` file

## 🌐 How It Works

1. **Frontend runs on port 3000** (React + Vite)
2. **Backend runs on port 8000** (Python + FastAPI)
3. **Vite proxy** forwards `/api/*` calls to your backend
4. **Real-time updates** as you type in the search

## 📱 Features Ready to Test

- ✅ **Home page** with search functionality
- ✅ **Navigation** between different sections
- ✅ **API integration** with your Python backend
- ✅ **Responsive design** for all devices
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for modern styling

## 🎯 Next Steps

1. **Test the search** - Try searching for "Inception"
2. **Check the API calls** - Open browser dev tools
3. **Customize the UI** - Modify components in `src/components/`
4. **Add new features** - Extend the API service

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### "Cannot connect to backend"
- Make sure your Python service is running: `uvicorn main:app --reload`
- Check that it's on port 8000

### "API key errors"
- Verify your `.env` file has `YOUTUBE_API_KEY=your_key_here`
- Check that the backend is working with `python test_youtube.py`

## 🎉 You're Ready!

Your React frontend is now set up with:
- Modern React 18 + TypeScript
- Beautiful Tailwind CSS styling
- Full API integration
- Responsive design
- Professional project structure

**Happy coding! 🎬✨**
