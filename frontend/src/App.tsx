import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchIcon, FilmIcon, UserIcon, HomeIcon } from 'lucide-react';
import HomePage from './pages/HomePage';
import MovieSearchPage from './pages/MovieSearchPage';
import ActorInterviewsPage from './pages/ActorInterviewsPage';
import VideoSearchPage from './pages/VideoSearchPage';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:movieTitle" element={<MovieSearchPage />} />
            <Route path="/actor/:actorName" element={<ActorInterviewsPage />} />
            <Route path="/search" element={<VideoSearchPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
