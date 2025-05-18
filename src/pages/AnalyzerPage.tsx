import { useState, useEffect } from 'react';
import { Camera, Check, Loader, Upload } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { useAssignment } from '../contexts/AssignmentContext';
import { useScoringContext } from '../contexts/ScoringContext';
import base64 from 'base64-js';

export default function AnalyzerPage() {
  const { assignments, setAssignments } = useAssignment(); // Added setAssignments
  const { scoringContext } = useScoringContext(); // Retrieve the scoring context
  const [numSteps, setNumSteps] = useState(4);
  const [activeStep, setActiveStep] = useState(0);
  const [stepImages, setStepImages] = useState<{ [key: number]: File | null }>({});
  const [analysisResults, setAnalysisResults] = useState<{ [key: number]: string | null }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallAnalysis, setOverallAnalysis] = useState<string | null>(null);

  // State for analysis metrics (NEW)
  const [analysisMetrics, setAnalysisMetrics] = useState({ timing: 0, balance: 0, armSwing: 0, posture: 0 });

  // State from MediaImportPage
  const [importedImageFiles, setImportedImageFiles] = useState<File[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [showMediaImporter, setShowMediaImporter] = useState(true); // To toggle visibility

  // Initialize step images and analysis results
  useEffect(() => {
    console.log('Initializing stepImages and analysisResults for numSteps:', numSteps);
    const initialStepImages: { [key: number]: File | null } = {};
    const initialAnalysisResults: { [key: number]: string | null } = {};

    for (let i = 0; i < numSteps; i++) {
      initialStepImages[i] = stepImages[i] || null; // Preserve existing images if numSteps changes
      initialAnalysisResults[i] = analysisResults[i] || null;
    }

    console.log('Initial stepImages:', initialStepImages);
    setStepImages(initialStepImages);
    setAnalysisResults(initialAnalysisResults);
  }, [numSteps]);

  useEffect(() => {
    console.log('Updated stepImages:', stepImages);
  }, [stepImages]);

  useEffect(() => {
    console.log('AnalyzerPage Rendered');
    console.log('Assignments in AnalyzerPage:', assignments);

    // Populate step images based on assignments for "Bowling Approach"
    // Create a new object for stepImages to ensure re-render
    const newStepImages = { ...stepImages }; 
    let updated = false;

    Object.entries(assignments).forEach(([frameIdxStr, { step, file }]) => {
      if (step === 'Bowling Approach') {
        const frameIdx = parseInt(frameIdxStr, 10); // This is the index from the *imported sequence*
        // If the user has, for example, a 4-step approach (numSteps = 4),
        // and they assign frames 0, 1, 2, 3 from the sequence to "Bowling Approach",
        // these will map to stepImages[0], stepImages[1], stepImages[2], stepImages[3].
        if (frameIdx >= 0 && frameIdx < numSteps) {
          if (newStepImages[frameIdx] !== file) {
            newStepImages[frameIdx] = file;
            updated = true;
          }
        }
      }
    });

    if (updated) {
      setStepImages(newStepImages);
    }
  }, [assignments, numSteps]); // Removed stepImages from dependencies to avoid potential loops if not careful

  // Handlers from MediaImportPage
  const handleImageSequenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImportedImageFiles(files);
      setCurrentFrameIndex(0); // Reset to the first image
      // Decide if you want to clear all assignments or just 'Bowling Approach' ones
      // setAssignments({}); // Clears all
      console.log('Uploaded Image Sequence:', files);
    }
  };

  const handleScrubImageSequence = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentFrameIndex(parseInt(event.target.value, 10));
  };

  const assignFrameFromSequence = (assignmentType: string) => {
    if (importedImageFiles[currentFrameIndex]) {
      setAssignments((prev) => {
        const updatedAssignments = {
          ...prev,
          // Using currentFrameIndex from the sequence as the key in assignments
          [currentFrameIndex]: { step: assignmentType, file: importedImageFiles[currentFrameIndex] },
        };
        console.log('Updated assignments:', updatedAssignments);
        return updatedAssignments;
      });
      console.log(`Assigned Frame ${currentFrameIndex} from sequence to ${assignmentType}`);
    } else {
      console.warn("No image file at currentFrameIndex to assign.");
    }
  };


  const handleFileSelect = (stepIndex: number, file: File | null) => {
    console.log(`handleFileSelect called for stepIndex: ${stepIndex}, file:`, file);
    setStepImages(prev => ({
      ...prev,
      [stepIndex]: file
    }));
    
    // Clear previous analysis for this step
    setAnalysisResults(prev => ({
      ...prev,
      [stepIndex]: null
    }));
  };

  // const handleDragOver = (e: React.DragEvent) => {
  //   e.preventDefault();
  // };

  // const handleDrop = (e: React.DragEvent, stepIndex: number) => {
  //   e.preventDefault();
  //   if (e.dataTransfer.files && e.dataTransfer.files[0]) {
  //     const file = e.dataTransfer.files[0];
  //     if (file.type.startsWith('image/')) {
  //       handleFileSelect(stepIndex, file);
  //     } else {
  //       alert('Please upload an image file');
  //     }
  //   }
  // };

  // Allow uploading multiple images at once and distribute them to steps
  const handleMultipleFiles = (files: FileList) => {
    console.log('handleMultipleFiles called with files:', files);
    if (files.length > 0) {
      // Determine how many steps we can fill
      const stepsToFill = Math.min(files.length, numSteps);
      console.log(`Distributing files to ${stepsToFill} steps.`);
      for (let i = 0; i < stepsToFill; i++) {
        if (files[i].type.startsWith('image/')) {
          console.log(`Assigning file to step ${i}:`, files[i]);
          handleFileSelect(i, files[i]);
        }
      }
      
      // If we filled at least one step, navigate to the first one
      if (stepsToFill > 0) {
        setActiveStep(0);
      }
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(e.target.files);
    }
  };

  const analyzeSingleImage = async (stepIndex: number) => {
    const file = stepImages[stepIndex];
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

            const response = await fetch('https://api.groq.com/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
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
                    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to analyze image');
            }

            const result = await response.json();
            setAnalysisResults((prev) => ({
                ...prev,
                [stepIndex]: result.choices[0].message.content,
            }));
        };

        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error analyzing image:', error);
    } finally {
        setIsAnalyzing(false);
    }
};

  const analyzeAllSteps = async () => {
    const allStepsComplete = Object.values(stepImages).every((img) => img !== null);

    if (!allStepsComplete) {
        alert('Please upload images for all steps before analyzing.');
        return;
    }

    setIsAnalyzing(true);

    try {
        for (let i = 0; i < numSteps; i++) {
            await analyzeSingleImage(i);
        }

        const overallResponse = await fetch('https://api.groq.com/overall-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('groqApiKey')}`,
            },
            body: JSON.stringify({
                stepResults: analysisResults,
                scoringContext,
            }),
        });

        if (!overallResponse.ok) {
            throw new Error('Failed to fetch overall analysis');
        }

        const overallResult = await overallResponse.json();
        setOverallAnalysis(overallResult.analysis);
    } catch (error) {
        console.error('Error analyzing all steps:', error);
    } finally {
        setIsAnalyzing(false);
    }
};
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Bowling Approach Analyzer</h1>
          <p className="text-green-100 text-sm mt-1">Import your image sequence and analyze your approach</p> {/* Updated subtitle */}
          <p className="text-green-200 text-xs mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-6">
          {/* Toggle Media Importer Button */}
          <div className="mb-4 text-right">
            <button
              onClick={() => setShowMediaImporter(!showMediaImporter)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              {showMediaImporter ? 'Hide Media Importer' : 'Show Media Importer'}
            </button>
          </div>

          {/* Integrated Media Import Section */}
          {showMediaImporter && (
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Import Image Sequence</h2>
              <label htmlFor="image-sequence-upload" className="block mb-2 text-sm font-medium text-gray-700">
                Upload Images (e.g., frames from a video)
              </label>
              <input
                id="image-sequence-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSequenceUpload}
                className="mb-4 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />

              {importedImageFiles.length > 0 && (
                <div>
                  <div className="flex justify-center mb-4">
                    <img
                      src={URL.createObjectURL(importedImageFiles[currentFrameIndex])}
                      alt={`Frame ${currentFrameIndex + 1}`}
                      className="max-w-md max-h-96 border rounded-md shadow-sm"
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <label htmlFor="sequence-scrubber" className="text-sm font-medium text-gray-700">Scrub:</label>
                    <input
                      id="sequence-scrubber"
                      type="range"
                      min="0"
                      max={importedImageFiles.length - 1}
                      value={currentFrameIndex}
                      onChange={handleScrubImageSequence}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span className="text-sm text-gray-600">
                      Frame {currentFrameIndex + 1} / {importedImageFiles.length}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <button
                      onClick={() => assignFrameFromSequence('Bowling Approach')}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                      Assign Frame to Bowling Approach
                    </button>
                    <button
                      onClick={() => assignFrameFromSequence('Release Analysis')}
                      className="flex-1 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                    >
                      Assign Frame to Release Analysis
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Current Assignments (from Sequence)</h3>
                    {Object.keys(assignments).length > 0 ? (
                      <ul className="list-disc pl-5 text-sm text-gray-600">
                        {Object.entries(assignments).map(([idx, { step, file }]) => (
                          <li key={idx}>
                            Frame {parseInt(idx, 10) + 1} ({file?.name}): {step}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No frames assigned from the sequence yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Steps Configuration */}
          <div className="mb-6">
            <label htmlFor="numStepsSelect" className="block text-sm font-medium text-gray-700 mb-2">
              Number of steps in your approach:
            </label>
            <select
              id="numStepsSelect"
              value={numSteps}
              onChange={(e) => setNumSteps(parseInt(e.target.value))}
              className="w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="3">3 Steps</option>
              <option value="4">4 Steps</option>
              <option value="5">5 Steps</option>
              <option value="6">6 Steps</option>
            </select>
          </div>
          
          {/* Step Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              {Array.from({ length: numSteps }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`py-2 px-4 font-medium text-sm ${
                    activeStep === index
                      ? 'border-b-2 border-green-500 text-green-600'
                      : 'text-gray-500 hover:text-green-500'
                  }`}
                >
                  Step {index + 1}
                  {stepImages[index] && (
                    <Check className="inline-block ml-1" size={14} color="#10b981" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Active Step Content */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Step {activeStep + 1}</h3>
            
            {/* Upload multiple images option */}
            <div className="mb-4 flex justify-end">
              <div className="relative">
                <input
                  type="file"
                  id="multipleFiles"
                  multiple
                  accept="image/*"
                  onChange={handleFilesSelected}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  aria-label="Upload multiple images for approach steps"
                />
                <button
                  className="px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 flex items-center"
                >
                  <Upload size={14} className="mr-1.5" />
                  Upload multiple images
                </button>
              </div>
            </div>
            
            {/* Image Upload Area */}
            <ImageUploader
              onFileSelect={(file) => handleFileSelect(activeStep, file)}
              currentFile={stepImages[activeStep]}
              onAnalyze={() => analyzeSingleImage(activeStep)}
              isAnalyzing={isAnalyzing}
            />
            
            {/* Analysis Results for this step */}
            {analysisResults[activeStep] && (
              <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
                <h4 className="text-green-800 font-medium mb-2 flex items-center">
                  <Check size={18} className="mr-2" />
                  Analysis Results
                </h4>
                <p className="text-green-700">{analysisResults[activeStep]}</p>
              </div>
            )}
          </div>
          
          {/* Analyze Full Approach Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={analyzeAllSteps}
              disabled={isAnalyzing}
              className="px-6 py-3 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center disabled:bg-green-300"
            >
              {isAnalyzing ? (
                <>
                  <Loader size={18} className="mr-2 animate-spin" />
                  Analyzing Full Approach...
                </>
              ) : (
                <>
                  <Camera size={18} className="mr-2" />
                  Analyze Full Approach
                </>
              )}
            </button>
          </div>
          
          {/* Overall Analysis Results */}
          {overallAnalysis && (
            <div className="mt-8 border border-green-100 dark:border-green-800 rounded-lg overflow-hidden">
              <div className="bg-green-50 dark:bg-green-900/20 px-6 py-4 border-b border-green-100 dark:border-green-800">
                <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Overall Analysis</h3>
              </div>
              <div className="p-6">
                <div className="prose dark:prose-invert prose-green max-w-none">
                  {overallAnalysis.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-green-700 dark:text-green-400">{paragraph}</p>
                  ))}
                </div>
                
                {/* Performance Metrics Visualization */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Timing</h4>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">{`${analysisMetrics.timing}/100`}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`bg-green-600 h-2 rounded-full w-[${analysisMetrics.timing}%]`}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Balance</h4>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">{`${analysisMetrics.balance}/100`}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`bg-green-600 h-2 rounded-full w-[${analysisMetrics.balance}%]`}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Arm Swing</h4>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">{`${analysisMetrics.armSwing}/100`}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`bg-green-600 h-2 rounded-full w-[${analysisMetrics.armSwing}%]`}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Posture</h4>
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">{`${analysisMetrics.posture}/100`}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`bg-green-600 h-2 rounded-full w-[${analysisMetrics.posture}%]`}></div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center">
                    Save This Analysis
                    {/* <ChevronRight size={16} className="ml-1" /> */}
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
