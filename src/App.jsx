import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import Questions from './pages/Questions';
import Summary from './pages/Summary';

export default function App() {
  return (
    <BrowserRouter>
      <div className="max-w-md mx-auto min-h-screen bg-gray-100 shadow-xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join/:roomId" element={<JoinRoom />} />
          <Route path="/room/:roomId/questions" element={<Questions />} />
          <Route path="/room/:roomId/summary" element={<Summary />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
