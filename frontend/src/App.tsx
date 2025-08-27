import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import ActorInterviewsPage from './pages/ActorInterviewsPage';
import HomePage from './pages/HomePage';
import MovieSearchPage from './pages/MovieSearchPage';
import VideoSearchPage from './pages/VideoSearchPage';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/movie/:movieTitle" element={<MovieSearchPage />} />
                    <Route path="/actor/:actorName" element={<ActorInterviewsPage />} />
                    <Route path="/search" element={<VideoSearchPage />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
