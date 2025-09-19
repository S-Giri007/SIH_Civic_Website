// Audio upload service for handling audio file uploads

export interface AudioUploadResponse {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
}

// Upload audio to local server
export const uploadAudioToServer = async (audioBlob: Blob, issueId?: string): Promise<AudioUploadResponse> => {
  try {
    const formData = new FormData();
    
    // Create a unique filename
    const timestamp = Date.now();
    const fileName = `audio_${issueId || 'temp'}_${timestamp}.webm`;
    
    formData.append('audio', audioBlob, fileName);
    if (issueId) {
      formData.append('issueId', issueId);
    }

    const response = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      filePath: result.filePath,
      fileName: result.fileName
    };
  } catch (error) {
    console.error('Audio upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

// Save audio locally in browser (fallback)
export const saveAudioLocally = (audioBlob: Blob, fileName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create object URL for the blob
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Store in localStorage as base64 (for small files only)
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64Data = reader.result as string;
          const audioData = {
            fileName,
            data: base64Data,
            timestamp: Date.now(),
            size: audioBlob.size
          };
          
          // Store in localStorage (note: has size limitations)
          localStorage.setItem(`audio_${fileName}`, JSON.stringify(audioData));
          resolve(audioUrl);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read audio file'));
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      reject(error);
    }
  });
};

// Get audio from localStorage
export const getAudioFromLocal = (fileName: string): string | null => {
  try {
    const audioDataStr = localStorage.getItem(`audio_${fileName}`);
    if (!audioDataStr) return null;
    
    const audioData = JSON.parse(audioDataStr);
    return audioData.data;
  } catch (error) {
    console.error('Error retrieving audio from localStorage:', error);
    return null;
  }
};

// Clean up old audio files from localStorage
export const cleanupOldAudioFiles = (maxAgeMs: number = 24 * 60 * 60 * 1000) => {
  try {
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('audio_')) {
        try {
          const audioDataStr = localStorage.getItem(key);
          if (audioDataStr) {
            const audioData = JSON.parse(audioDataStr);
            if (now - audioData.timestamp > maxAgeMs) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Invalid data, mark for removal
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`Cleaned up ${keysToRemove.length} old audio files`);
  } catch (error) {
    console.error('Error cleaning up audio files:', error);
  }
};

// Convert audio blob to different formats if needed
export const convertAudioFormat = async (audioBlob: Blob, targetFormat: string = 'mp3'): Promise<Blob> => {
  // This is a placeholder for audio conversion
  // In a real implementation, you might use libraries like lamejs for MP3 conversion
  // For now, we'll return the original blob
  console.warn('Audio conversion not implemented, returning original format');
  return audioBlob;
};

// Get audio file size in human readable format
export const formatAudioFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate audio file
export const validateAudioFile = (audioBlob: Blob): { valid: boolean; error?: string } => {
  // Check file size (limit to 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (audioBlob.size > maxSize) {
    return {
      valid: false,
      error: `Audio file too large. Maximum size is ${formatAudioFileSize(maxSize)}`
    };
  }
  
  // Check file type
  const validTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
  if (!validTypes.includes(audioBlob.type)) {
    return {
      valid: false,
      error: `Invalid audio format. Supported formats: ${validTypes.join(', ')}`
    };
  }
  
  return { valid: true };
};