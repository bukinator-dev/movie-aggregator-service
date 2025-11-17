# Movie Aggregator Service

> A powerful full-stack application that aggregates and displays comprehensive movie information from multiple sources, providing users with a seamless movie discovery experience.

## Overview

Movie Aggregator Service is a modern web application that brings together movie data from various sources into one unified platform. Built with cutting-edge technologies, it offers a fast, responsive, and intuitive interface for exploring movies, actors, and related content.

### Key Features

- **Multi-Source Aggregation**: Combines data from YouTube and other movie databases
- **Rich Movie Information**: Access detailed movie metadata, cast information, and media content
- **Real-time Search**: Lightning-fast search functionality with instant results
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, intuitive interface built with React and Tailwind CSS
- **RESTful API**: Robust backend API for easy integration and extensibility

## Architecture

The project follows a modern full-stack architecture:

```
┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │
│   React + Vite  │ ◄────► │    FastAPI      │
│   Port 3000     │         │    Port 8000    │
└─────────────────┘         └─────────────────┘
                                    │
                            ┌───────┴────────┐
                            │  External APIs │
                            │  (YouTube, etc)│
                            └────────────────┘
```

### Technology Stack

#### Frontend
- **React 18** - Modern UI library with hooks and concurrent features
- **TypeScript** - Type-safe development experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - Promise-based HTTP client
- **Lucide React** - Beautiful icon library

#### Backend
- **FastAPI** - High-performance Python web framework
- **Uvicorn** - ASGI server for async operations
- **Pydantic** - Data validation using Python type annotations
- **Google APIs** - Integration with YouTube and other Google services
- **HTTPX** - Modern async HTTP client
- **python-dotenv** - Environment configuration management

## Getting Started

### Prerequisites

Before running the application, ensure you have:

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **YouTube API Key** ([Get one here](https://developers.google.com/youtube/v3/getting-started))

### Quick Start (Windows)

The fastest way to get started on Windows:

```bash
# Clone the repository
git clone https://github.com/bukinator-dev/movie-aggregator-service.git
cd movie-aggregator-service

# Run the automated startup script
start-dev.bat
```

This will automatically start both the backend and frontend services.

### Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file with your API key
echo YOUTUBE_API_KEY=your_api_key_here > .env

# Start the backend server
python main.py
```

The backend will be available at `http://localhost:8000`

#### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Project Structure

```
movie-aggregator-service/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Application entry point
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables (create this)
├── frontend/               # React + TypeScript frontend
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
├── services/              # Auxiliary service modules
├── start-dev.bat          # Windows startup script
├── start-dev.ps1          # PowerShell startup script
└── setup-frontend.md      # Detailed frontend setup guide
```

## API Endpoints

The backend provides a RESTful API with the following endpoints:

- `GET /api/movies` - Search and retrieve movie information
- `GET /api/movies/{id}` - Get detailed information about a specific movie
- `GET /api/actors` - Search for actors
- `GET /api/youtube` - Fetch YouTube content related to movies

*For complete API documentation, visit `http://localhost:8000/docs` when the backend is running.*

## Development

### Running Tests

```bash
# Backend tests
cd backend
python test_youtube.py

# Frontend tests
cd frontend
npm run lint
```

### Building for Production

#### Frontend Build
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

The build output will be in the `frontend/dist` directory.

## Environment Variables

### Backend (.env)
```env
YOUTUBE_API_KEY=your_youtube_api_key_here
PORT=8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## Troubleshooting

### Common Issues

**Backend won't start:**
- Verify Python 3.8+ is installed: `python --version`
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check if port 8000 is already in use

**Frontend won't start:**
- Verify Node.js 16+ is installed: `node --version`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check if port 3000 is already in use

**API Key Issues:**
- Ensure your `.env` file exists in the backend directory
- Verify your YouTube API key is valid and has the YouTube Data API v3 enabled
- Test the API key with: `python test_youtube.py`

**Connection Errors:**
- Ensure both backend and frontend are running
- Check that the backend is accessible at `http://localhost:8000`
- Verify CORS settings if making external requests

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Built with [FastAPI](https://fastapi.tiangolo.com/)
- Frontend powered by [React](https://react.dev/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide](https://lucide.dev/)
- Movie data provided by YouTube API

## Contact

For questions, suggestions, or issues, please open an issue on the [GitHub repository](https://github.com/bukinator-dev/movie-aggregator-service).

---

Made with ❤️ by bukinator-dev
