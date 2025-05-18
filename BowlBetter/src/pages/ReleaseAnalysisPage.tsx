import { useState, useEffect } from 'react';
import { Camera, Check, ChevronRight, Download, Loader, Share2 } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

export default function ReleaseAnalysisPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    overall: string | null;
    wristPosition: string | null;
    fingerPosition: string | null;
    releaseAngle: string | null;
    metrics: {
      wristPositionScore: number;
      fingerPositionScore: number;
      releaseAngleScore: number;
      overallScore: number;
    } | null;
  }>({
    overall: null,
    wristPosition: null,
    fingerPosition: null,
    releaseAngle: null,
    metrics: null
  });

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    
    // Clear previous analysis
    setAnalysisResults({
      overall: null,
      wristPosition: null,
      fingerPosition: null,
      releaseAngle: null,
      metrics: null
    });
  };

  const analyzeRelease = async () => {
    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey) {
      alert('Please set your Groq API key in Settings first.');
      return;
    }

    if (!file) return;

    setIsAnalyzing(true);
    
    // Mock API call (in a real app, this would call the Groq API)
    setTimeout(() => {
      const mockAnalysis = getMockReleaseAnalysis();
      setAnalysisResults(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Mock analysis results for demo purposes
  const getMockReleaseAnalysis = () => {
    return {
      overall: "Your release shows a consistent follow-through with good finger position. The wrist position is slightly cupped which is contributing to a higher rev rate. Your release angle appears to be around 45 degrees, which is optimal for medium oil conditions. Consider focusing on maintaining a more consistent wrist position throughout the release for improved consistency.",
      wristPosition: "Your wrist is slightly cupped at release (approximately 15 degrees), which is generating good revolutions on the ball. However, there's some inconsistency in maintaining this position throughout the release phase. Try strengthening your wrist with specific exercises to maintain this position more consistently.",
      fingerPosition: "Excellent finger position at release with proper lifting motion. Your fingers are exiting the ball at the optimal position (between 4-5 o'clock for right-handers), contributing to a strong entry angle into the pocket. Continue to focus on this consistent exit point.",
      releaseAngle: "Your release angle is approximately 45 degrees, which is ideal for medium oil conditions. This angle is creating good entry angle into the pocket. For heavier oil conditions, you might benefit from a slightly higher release angle (closer to 50-55 degrees) to create more axis rotation.",
      metrics: {
        wristPositionScore: 79,
        fingerPositionScore: 92,
        releaseAngleScore: 86,
        overallScore: 85
      }
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Release Analysis</h1>
          <p className="text-green-100 text-sm mt-1">Analyze your ball release for maximum performance</p>
          <p className="text-green-200 text-xs mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload a clear image of your ball release (side view preferred) for detailed analysis of wrist position, finger position, and release angle.
            </p>
            
            <ImageUploader
              onFileSelect={handleFileSelect}
              currentFile={file}
              onAnalyze={analyzeRelease}
              isAnalyzing={isAnalyzing}
            />
          </div>
          
          {/* Analysis Results */}
          {analysisResults.overall && (
            <div className="mt-8 border border-green-100 dark:border-green-800 rounded-lg overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-100 dark:border-green-800">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Release Analysis Results</h3>
              </div>
              
              <div className="p-6">
                {/* Metrics */}
                {analysisResults.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {analysisResults.metrics.overallScore}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {analysisResults.metrics.wristPositionScore}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Wrist Position</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {analysisResults.metrics.fingerPositionScore}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Finger Position</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {analysisResults.metrics.releaseAngleScore}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Release Angle</div>
                    </div>
                  </div>
                )}
                
                {/* Overall Analysis */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Overall Assessment</h4>
                  <p className="text-gray-600 dark:text-gray-300">{analysisResults.overall}</p>
                </div>
                
                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Wrist Position</h4>
                    <p className="text-green-700 dark:text-green-400">{analysisResults.wristPosition}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Finger Position</h4>
                    <p className="text-green-700 dark:text-green-400">{analysisResults.fingerPosition}</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-md">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Release Angle</h4>
                    <p className="text-green-700 dark:text-green-400">{analysisResults.releaseAngle}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-8 flex justify-end space-x-4">
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center">
                    <Download size={16} className="mr-2" />
                    Save Report
                  </button>
                  <button className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center">
                    <Share2 size={16} className="mr-2" />
                    Share Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
