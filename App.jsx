import { HashRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HostPage from './pages/HostPage';
import ScreenPage from './pages/ScreenPage';
import VotePage from './pages/VotePage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host/:roomId" element={<HostPage />} />
        <Route path="/vote/:roomId" element={<VotePage />} />
        <Route path="/screen/:roomId" element={<ScreenPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </HashRouter>
  );
}
