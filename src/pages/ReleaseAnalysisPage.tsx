import { useState, useEffect } from 'react';
import { Camera, Download, Loader, Share2 } from 'lucide-react';
import { useAssignment } from '../contexts/AssignmentContext';
import base64 from 'base64-js';

export default function ReleaseAnalysisPage() {
  const { assignments } = useAssignment();
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

  useEffect(() => {
    // Find the image assigned to "Release Analysis"
    // This will take the last assigned frame for "Release Analysis" if multiple exist.
    let releaseImageFile: File | null = null;
    let latestTimestamp = 0;

    Object.entries(assignments).forEach(([key, { step, file: assignedFile }]) => {
      if (step === 'Release Analysis' && assignedFile) {
        // Assuming keys are timestamps or can be parsed into something sortable if multiple are assigned
        // For simplicity, if keys are just frame indices, this will effectively take the one with the highest index.
        // If a more robust "latest" is needed, the assignment key or structure should include a timestamp.
        const currentTimestamp = parseInt(key, 10); // Or however you determine recency
        if (currentTimestamp >= latestTimestamp) { // Simple way to get the "last" one by index
            latestTimestamp = currentTimestamp;
            releaseImageFile = assignedFile;
        }
      }
    });

    if (releaseImageFile) {
      setFile(releaseImageFile);
      // Clear previous analysis results when a new file is set from context
      setAnalysisResults({
        overall: null,
        wristPosition: null,
        fingerPosition: null,
        releaseAngle: null,
        metrics: null
      });
    } else {
      // Optionally, clear the file if no assignment is found, or leave the old one
      setFile(null);
      setAnalysisResults({
        overall: null,
        wristPosition: null,
        fingerPosition: null,
        releaseAngle: null,
        metrics: null
      });
    }
  }, [assignments]);

  const analyzeRelease = async () => {
    if (!file) return;

    setIsAnalyzing(true);

    try {
        const apiKey = localStorage.getItem('groqApiKey');
        if (!apiKey) {
            throw new Error('API key is missing. Please set it in the Settings page.');
        }

        const reader = new FileReader();
        reader.onload = async () => {
            const base64Image = reader.result?.toString().split(',')[1];
            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify({
                        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                        messages: [
                            {
                                role: 'user',
                                content: [
                                    { type: 'text', text: "What's in this image?" },
                                    {
                                        type: 'image_url',
                                        image_url: {
                                            url: `data:image/jpeg;base64,${base64Image}`,
                                        },
                                    },
                                ],
                            },
                        ],
                    }),
                });

                let result;
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Groq API error:', errorText);
                    console.error('Groq API status:', response.status, response.statusText);
                    if (response.status === 0) {
                        console.error('Possible CORS or network error.');
                    }
                    throw new Error('Failed to analyze release image');
                }

                result = await response.json();
                console.log('Groq API response:', result);
                // Defensive: check for expected structure
                const content = result.choices?.[0]?.message?.content;
                setAnalysisResults({
                    overall: content?.overall || null,
                    wristPosition: content?.wristPosition || null,
                    fingerPosition: content?.fingerPosition || null,
                    releaseAngle: content?.releaseAngle || null,
                    metrics: content?.metrics || null,
                });
            } catch (fetchError) {
                console.error('Fetch or network error:', fetchError);
            }
        };

        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error analyzing release image:', error);
    } finally {
        setIsAnalyzing(false);
    }
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
              The image assigned for Release Analysis (from the Analyzer page) will be shown below. You can then analyze it.
            </p>
            
            {/* Display assigned image directly */}
            {file ? (
              <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center">
                <img 
                  src={URL.createObjectURL(file)}
                  alt="Assigned Release Frame"
                  className="max-w-md max-h-96 border rounded-md shadow-sm mb-4"
                />
                <button
                  onClick={analyzeRelease}
                  disabled={isAnalyzing || !file} // Ensure file is present
                  className="px-6 py-3 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center disabled:bg-green-300"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader size={18} className="mr-2 animate-spin" />
                      Analyzing Release...
                    </>
                  ) : (
                    <>
                      <Camera size={18} className="mr-2" />
                      Analyze Release Image
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                <p className="text-gray-500">
                  No image assigned for Release Analysis yet. 
                  Please go to the Analyzer page, import an image sequence, and assign a frame to 'Release Analysis'.
                </p>
              </div>
            )}
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
