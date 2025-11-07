import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI, transcriptionAPI, analysisAPI, exportAPI } from '../lib/api';
import { Download, ArrowLeft, CheckCircle2, Clock, AlertCircle, Play } from 'lucide-react';

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      loadMeeting();
      const interval = setInterval(loadMeeting, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [id]);

  const loadMeeting = async () => {
    try {
      const response = await meetingAPI.getMeetingById(id!);
      setMeeting(response.meeting);
    } catch (error) {
      console.error('Failed to load meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAnalysis = async () => {
    if (!id) return;
    
    setProcessing(true);
    try {
      await analysisAPI.analyzeMeeting(id);
      await loadMeeting();
    } catch (error) {
      console.error('Failed to start analysis:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const blob = await exportAPI.exportMarkdown(id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meeting.title}_minutes.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export markdown:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Meeting not found</p>
        <button
          onClick={() => navigate('/library')}
          className="mt-4 text-blue-600 hover:text-blue-700"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/library')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Library</span>
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
            <p className="mt-2 text-gray-600">
              {new Date(meeting.meetingDate).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex space-x-2">
            {meeting.status === 'completed' && (
              <button
                onClick={handleExportMarkdown}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Markdown</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status Card */}
      <StatusCard meeting={meeting} onStartAnalysis={handleStartAnalysis} processing={processing} />

      {/* Transcription */}
      {meeting.transcriptions && meeting.transcriptions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transcription</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {meeting.transcriptions.map((segment: any, index: number) => (
              <div key={segment.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-start space-x-2">
                  <span className="text-xs text-gray-500 min-w-[60px]">
                    {segment.startTimeSeconds ? formatTime(segment.startTimeSeconds) : `#${index + 1}`}
                  </span>
                  <p className="text-gray-700">{segment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      {meeting.actionItems && meeting.actionItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Action Items</h2>
          <div className="space-y-2">
            {meeting.actionItems.map((item: any) => (
              <div key={item.id} className="flex items-start space-x-3">
                <input type="checkbox" className="mt-1" />
                <div className="flex-1">
                  <p className="text-gray-900">{item.title}</p>
                  {(item.assignee || item.dueDate) && (
                    <p className="text-sm text-gray-600">
                      {item.assignee && <span className="font-medium">{item.assignee}</span>}
                      {item.assignee && item.dueDate && <span> • </span>}
                      {item.dueDate && <span>{new Date(item.dueDate).toLocaleDateString()}</span>}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Decisions */}
      {meeting.decisions && meeting.decisions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Decisions Made</h2>
          <div className="space-y-3">
            {meeting.decisions.map((decision: any) => (
              <blockquote key={decision.id} className="border-l-4 border-green-500 pl-4 italic text-gray-700">
                {decision.decisionText}
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {/* Meeting Minutes */}
      {meeting.meetingMinutes && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{meeting.meetingMinutes.executiveSummary}</p>
        </div>
      )}
    </div>
  );
}

function StatusCard({ meeting, onStartAnalysis, processing }: any) {
  const status = meeting.status;
  
  const statusConfig: { [key: string]: { icon: any; color: string; message: string; action?: string } } = {
    uploaded: {
      icon: <Clock className="w-6 h-6" />,
      color: 'text-gray-600',
      message: 'Audio file uploaded. Ready for transcription.',
      action: 'Start Transcription'
    },
    transcribing: {
      icon: <Play className="w-6 h-6 animate-pulse" />,
      color: 'text-blue-600',
      message: 'Transcribing audio... This may take a few minutes.'
    },
    transcribed: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'text-green-600',
      message: 'Transcription complete. Ready for AI analysis.',
      action: 'Start Analysis'
    },
    analyzing: {
      icon: <Play className="w-6 h-6 animate-pulse" />,
      color: 'text-blue-600',
      message: 'Analyzing meeting content with AI...'
    },
    completed: {
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: 'text-green-600',
      message: 'Meeting minutes ready! You can export or review the content.'
    },
    error: {
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'text-red-600',
      message: 'Processing error occurred. Please try again or contact support.'
    }
  };

  const config = statusConfig[status] || statusConfig.uploaded;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={config.color}>
            {config.icon}
          </div>
          <div>
            <p className="font-semibold text-gray-900">Status: {status}</p>
            <p className="text-sm text-gray-600">{config.message}</p>
          </div>
        </div>
        
        {config.action && !processing && (
          <button
            onClick={onStartAnalysis}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            {config.action}
          </button>
        )}
        
        {processing && (
          <div className="flex items-center space-x-2 text-gray-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
