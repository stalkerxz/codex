import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LessonDetailPage from "./pages/LessonDetailPage";
import PracticeLabPage from "./pages/PracticeLabPage";
import GalleryPage from "./pages/GalleryPage";
import "./styles/app.css";

const App = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="app-title">Photography Foundation</p>
          <p className="app-subtitle">Leica-inspired, offline-first learning</p>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>
            Learning Path
          </NavLink>
          <NavLink to="/practice">Practice Lab</NavLink>
          <NavLink to="/gallery">Gallery</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson/:lessonId" element={<LessonDetailPage />} />
          <Route path="/practice" element={<PracticeLabPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <span>Offline-first PWA • All progress stays on your device.</span>
      </footer>
    </div>
  );
};

export default App;
