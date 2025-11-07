import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI, transcriptionAPI, analysisAPI } from '../lib/api';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    meetingDate: new Date().toISOString().split('T')[0],
    participants: '',
    location: '',
    meetingType: 'general'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/flac', 'audio/ogg', 'audio/webm'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(mp3|wav|m4a|flac|ogg|webm)$/i)) {
        setError('Please upload a valid audio file (mp3, wav, m4a, flac, ogg, webm)');
        return;
      }
      
      setFile(selectedFile);
      setError('');
      
      // Auto-fill title from filename if empty
      if (!formData.title) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, '');
        setFormData(prev => ({ ...prev, title: filename }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create form data
      const data = new FormData();
      data.append('audio', file);
      data.append('title', formData.title || file.name);
      data.append('meetingDate', formData.meetingDate);
      data.append('participants', formData.participants);
      data.append('location', formData.location);
      data.append('meetingType', formData.meetingType);

      // Upload audio file
      const uploadResponse = await meetingAPI.uploadAudio(data);
      const meetingId = uploadResponse.meeting.id;

      // Start transcription process
      await transcriptionAPI.process(meetingId);

      // Navigate to meeting detail page
      navigate(`/meeting/${meetingId}`);
    } catch (err: any) {
      console.error('Upload error:', err);
      // Handle error object properly - extract message string
      const errorData = err.response?.data?.error;
      const errorMessage = typeof errorData === 'object' && errorData?.message
        ? errorData.message
        : typeof errorData === 'string'
          ? errorData
          : err.message || 'Upload failed. Please try again.';
      setError(errorMessage);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Upload Meeting Recording</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition">
              <div className="space-y-1 text-center">
                <FileAudio className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  MP3, WAV, M4A, FLAC, OGG, WEBM up to 500MB
                </p>
                {file && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Meeting Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meeting Title
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter meeting title"
              disabled={uploading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Date
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.meetingDate}
                onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                disabled={uploading}
              >
                <option value="general">General</option>
                <option value="team">Team Meeting</option>
                <option value="client">Client Call</option>
                <option value="board">Board Meeting</option>
                <option value="standup">Daily Standup</option>
                <option value="review">Review</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participants (optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.participants}
              onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
              placeholder="John Doe, Jane Smith, etc."
              disabled={uploading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (optional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Conference Room A or Virtual"
              disabled={uploading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Upload and Process'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
