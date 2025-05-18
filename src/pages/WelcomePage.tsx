import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';

interface WelcomePageProps {
  onComplete: () => void;
}

export default function WelcomePage({ onComplete }: WelcomePageProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [apiKey, setApiKey] = useState('');
  
  const steps = [
    {
      title: "Welcome to BowlBetter!",
      description: "Your personal bowling coach and analyzer. Let's get you set up in just a few steps.",
      action: () => setCurrentStep(1)
    },
    {
      title: "Set Up Your API Key",
      description: "BowlBetter! uses the Groq API for image analysis. Enter your API key below to get started.",
      action: () => {
        if (apiKey.trim()) {
          localStorage.setItem('groqApiKey', apiKey);
          setCurrentStep(2);
        } else {
          alert("Please enter an API key or click 'Skip for now'");
        }
      },
      skipAction: () => setCurrentStep(2)
    },
    {
      title: "You're All Set!",
      description: "You're ready to start analyzing your bowling approach and improving your game.",
      action: () => {
        onComplete();
        navigate("/analyzer");
      }
    }
  ];
  
  const currentStepData = steps[currentStep];
  
  return (
    <div className="max-w-2xl mx-auto pt-10 pb-20">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-6 px-8">
          <h1 className="text-white text-2xl font-bold">BowlBetter!</h1>
          <p className="text-green-100 mt-2">Bowling Approach Analyzer & Tournament Assistant</p>
          <p className="text-green-200 text-sm mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-8">
          <div className="flex items-center mb-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep 
                    ? 'bg-green-500 text-white' 
                    : index === currentStep 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStep ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-1 w-12 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{currentStepData.title}</h2>
          <p className="text-gray-600 mb-8">{currentStepData.description}</p>
          
          {currentStep === 1 && (
            <div className="mb-8">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                Groq API Key
              </label>
              <input
                type="text"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your Groq API key..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Don't have an API key? <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">Get one here</a>
              </p>
            </div>
          )}
          
          <div className="flex justify-between">
            {currentStep === 1 && (
              <button
                onClick={() => setCurrentStep(0)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            
            <div className="flex space-x-4">
              {currentStep === 1 && (
                <button
                  onClick={currentStepData.skipAction}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Skip for now
                </button>
              )}
              
              <button
                onClick={currentStepData.action}
                className="px-6 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'} 
                <ChevronRight size={18} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
