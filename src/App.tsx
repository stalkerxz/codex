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
          <p className="app-title">Фотография: основы</p>
          <p className="app-subtitle">Leica-вдохновлённое обучение офлайн</p>
        </div>
        <nav className="app-nav">
          <NavLink to="/" end>
            Учебный путь
          </NavLink>
          <NavLink to="/practice">Практика</NavLink>
          <NavLink to="/gallery">Галерея</NavLink>
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
        <span>PWA офлайн • Весь прогресс хранится на вашем устройстве.</span>
      </footer>
    </div>
  );
};

export default App;
