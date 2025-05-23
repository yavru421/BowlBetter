import { useState, useEffect } from 'react';
import { Bell, CircleCheck, Key, Moon, Save, Sun, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useScoringContext } from '../contexts/ScoringContext';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  const [notifications, setNotifications] = useState(true);
  const [apiKeyError, setApiKeyError] = useState('');
  const { scoringContext, setScoringContext } = useScoringContext();
  
  useEffect(() => {
    // Load the API key from localStorage
    const savedApiKey = localStorage.getItem('groqApiKey') || '';
    setApiKey(savedApiKey);
  }, []);
  
  const handleSaveApiKey = () => {
    setIsLoading(true);
    setApiKeyError(''); // Clear previous errors
    setIsSaved(false);

    // Basic validation (e.g., not empty)
    // A more robust validation might check the key format or length if known
    if (!apiKey.trim()) {
      setApiKeyError('API key cannot be empty.');
      setIsLoading(false);
      return;
    }
    
    // Simulate API check (in a real app, you might ping an endpoint)
    setTimeout(() => {
      localStorage.setItem('groqApiKey', apiKey);
      setIsLoading(false);
      setIsSaved(true);
      
      // Reset the "Saved" status after 3 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    }, 1000);
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScoringContext(e.target.value);
  };

  const testGroqEndpoint = async (endpoint: string) => {
    const apiKey = localStorage.getItem('groqApiKey');
    if (!apiKey) {
        alert('API key is missing. Please set it first.');
        return;
    }

    try {
        const response = await fetch(endpoint, {
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
                            { type: 'text', text: 'Test API call (vision)' },
                            // Optionally add a sample image_url here for vision test
                        ],
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        alert(`Success: ${JSON.stringify(result)}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        alert(`Failed: ${errorMessage}`);
    }
};
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Settings</h1>
          <p className="text-green-100 text-sm mt-1">Configure your BowlBetter! experience</p>
          <p className="text-green-200 text-xs mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="md:col-span-1">
              <nav className="space-y-1">
                <a href="#api-settings" className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-md">
                  <Key size={18} className="mr-3 text-green-500" />
                  API Settings
                </a>
                <a href="#account" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <User size={18} className="mr-3 text-gray-500" />
                  Account
                </a>
                <a href="#preferences" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md">
                  <Bell size={18} className="mr-3 text-gray-500" />
                  Preferences
                </a>
              </nav>
            </div>
            
            {/* Main Content */}
            <div className="md:col-span-3">
              <div id="api-settings" className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">API Settings</h2>
                
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-4">
                  <p className="text-sm text-gray-600">
                    BowlBetter! uses the Groq API for image analysis. You'll need to provide your own API key to use the analysis features.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                      Groq API Key
                    </label>
                    <div className="flex">
                      <input
                        type="password"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          if (apiKeyError) setApiKeyError(''); // Clear error on change
                          if (isSaved) setIsSaved(false); // Clear saved status on change
                        }}
                        className={`flex-1 px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 ${apiKeyError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'}`}
                        placeholder="Enter your Groq API key..."
                        aria-describedby={apiKeyError ? "apiKey-error" : undefined}
                      />
                      <button
                        onClick={handleSaveApiKey}
                        disabled={isLoading || isSaved}
                        className={`px-4 py-2 flex items-center rounded-r-md text-white ${
                          isSaved 
                            ? 'bg-green-500' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </span>
                        ) : isSaved ? (
                          <span className="flex items-center">
                            <CircleCheck size={16} className="mr-2" />
                            Saved!
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Save size={16} className="mr-2" />
                            Save
                          </span>
                        )}
                      </button>
                    </div>
                    {apiKeyError && (
                      <p id="apiKey-error" className="mt-1 text-xs text-red-600">
                        {apiKeyError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Test Groq API Endpoints Section */}
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Test Groq API Endpoints</h3>
                  <div className="space-y-2">
                    <button
                        onClick={() => testGroqEndpoint('https://api.groq.com/openai/v1/chat/completions')}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Test Vision Chat Completions Endpoint
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="preferences" className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Preferences</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Dark Mode</h3>
                      <p className="text-sm text-gray-500">Enable dark mode for the application</p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        darkMode ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Enable dark mode</span>
                      <span
                        className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                          darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                      {darkMode ? 
                        <Sun size={12} className="absolute right-1 text-white" /> : 
                        <Moon size={12} className="absolute left-1 text-gray-400" />
                      }
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications about analysis results</p>
                    </div>
                    <button
                      onClick={() => setNotifications(!notifications)}
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        notifications ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className="sr-only">Enable notifications</span>
                      <span
                        className={`inline-block w-4 h-4 transform transition-transform bg-white rounded-full ${
                          notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="scoring-context" className="mb-8">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Scoring Context</h2>
                
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-md mb-4">
                  <p className="text-sm text-gray-600">
                    Customize the context for scoring. This will be sent to the Groq API along with the metrics to produce a realistic score.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="scoringContext" className="block text-sm font-medium text-gray-700 mb-1">
                      Context for Scoring Prompt
                    </label>
                    <div className="flex">
                      <textarea
                        id="scoringContext"
                        value={scoringContext}
                        onChange={handleContextChange}
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
