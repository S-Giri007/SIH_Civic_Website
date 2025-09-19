import { useState, useRef } from 'react';
import { Play, Pause, Volume2, Download, AlertCircle } from 'lucide-react';

interface SimpleAudioPlayerProps {
  audioFileName: string;
  audioData?: string; // Base64 or blob URL
  className?: string;
}

const SimpleAudioPlayer: React.FC<SimpleAudioPlayerProps> = ({ 
  audioFileName, 
  audioData,
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio data
  const loadAudio = () => {
    try {
      // Try to get from localStorage first
      const localAudioData = localStorage.getItem(`audio_${audioFileName}`);
      if (localAudioData) {
        const parsedData = JSON.parse(localAudioData);
        setAudioUrl(parsedData.data);
        setError(null);
        return;
      }

      // Use provided audioData
      if (audioData) {
        setAudioUrl(audioData);
        setError(null);
        return;
      }

      setError('Audio file not found');
    } catch (error) {
      console.error('Error loading audio:', error);
      setError('Failed to load audio file');
    }
  };

  // Initialize audio loading
  useState(() => {
    loadAudio();
  });

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setError('Failed to play audio');
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = audioFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (error) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
          <div>
            <p className="text-sm text-yellow-800">Audio Recording Available</p>
            <p className="text-xs text-yellow-600">
              {error} - File: {audioFileName}
            </p>
          </div>
        </div>
        <button
          onClick={loadAudio}
          className="mt-2 px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded hover:bg-yellow-200 transition-colors"
        >
          Try Loading Again
        </button>
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center">
          <Volume2 className="w-4 h-4 text-gray-400 mr-2" />
          <p className="text-sm text-gray-600">Loading audio recording...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={() => setError('Error playing audio')}
        className="hidden"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Volume2 className="w-4 h-4 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-blue-800">Audio Description</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-blue-600">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={downloadAudio}
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="Download Audio"
          >
            <Download className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-100"
              style={{
                width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%'
              }}
            ></div>
          </div>
        </div>
      </div>

      <p className="text-xs text-blue-600 mt-2">
        Click play to listen to the citizen's audio description of this issue.
      </p>
    </div>
  );
};

export default SimpleAudioPlayer;