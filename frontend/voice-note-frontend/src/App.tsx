import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MeetingLibrary from './pages/MeetingLibrary';
import MeetingDetail from './pages/MeetingDetail';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/library" element={<MeetingLibrary />} />
          <Route path="/meeting/:id" element={<MeetingDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
