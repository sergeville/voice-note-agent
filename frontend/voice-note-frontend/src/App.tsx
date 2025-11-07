import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Upload, Library, FileText, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';
import { systemAPI } from './lib/api';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import MeetingLibrary from './pages/MeetingLibrary';
import MeetingDetail from './pages/MeetingDetail';
import './App.css';

function App() {
  const [modelInfo, setModelInfo] = useState<string>('');

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = async () => {
    try {
      const config = await systemAPI.getConfig();
      setModelInfo(config.analysis.model);
    } catch (error) {
      console.error('Failed to load model info:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">Voice-to-Note Agent</span>
              </div>

              <div className="flex items-center space-x-6">
                <Link to="/" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                  <Home className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/upload" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                </Link>
                <Link to="/library" className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition">
                  <Library className="w-5 h-5" />
                  <span>Library</span>
                </Link>
                {modelInfo && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">LLM: {modelInfo}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/library" element={<MeetingLibrary />} />
            <Route path="/meeting/:id" element={<MeetingDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
