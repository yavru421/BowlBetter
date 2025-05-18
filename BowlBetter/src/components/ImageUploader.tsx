import { useState, useRef } from 'react';
import { Camera, Check, Loader, Trash, Upload } from 'lucide-react';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  currentFile: File | null;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function ImageUploader({ onFileSelect, currentFile, onAnalyze, isAnalyzing }: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        simulateUpload(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        simulateUpload(file);
      } else {
        alert('Please upload an image file');
      }
    }
  };

  const simulateUpload = (file: File) => {
    // Reset progress
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 15) + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          // Complete upload after reaching 100%
          setTimeout(() => {
            onFileSelect(file);
          }, 200);
          return 100;
        }
        return newProgress;
      });
    }, 100);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${
        isDragging ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 
        currentFile ? 'border-green-300 bg-green-50 dark:bg-green-900/10' : 
        'border-gray-300 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {currentFile ? (
        <div className="w-full">
          <div className="relative mb-4">
            <img
              src={URL.createObjectURL(currentFile)}
              alt="Uploaded image"
              className="max-h-64 mx-auto rounded-lg"
            />
            <button
              onClick={() => onFileSelect(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <Trash size={16} />
            </button>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={triggerFileInput}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center"
            >
              <Upload size={16} className="mr-2" />
              Replace Image
            </button>
            
            <button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center disabled:bg-green-300 dark:disabled:bg-green-800"
            >
              {isAnalyzing ? (
                <>
                  <Loader size={16} className="mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera size={16} className="mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      ) : uploadProgress > 0 && uploadProgress < 100 ? (
        <div className="w-full max-w-md">
          <div className="flex items-center mb-2">
            <Loader size={20} className="text-green-500 animate-spin mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Uploading image...</span>
            <span className="ml-auto text-sm font-medium text-green-600 dark:text-green-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <Upload size={40} className="mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Drag and drop an image here, or</p>
          <button
            onClick={triggerFileInput}
            className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700"
          >
            Browse Files
          </button>
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
