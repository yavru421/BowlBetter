import React, { useState } from 'react';

const HomePage: React.FC = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Welcome to BowlBetter</h1>
      <p className="mb-4">Follow these steps to make the most of the app:</p>

      <div className="space-y-4">
        {/* Step 1 */}
        <div>
          <button
            onClick={() => toggleSection('step1')}
            className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Step 1: Upload a Video
          </button>
          {openSections['step1'] && (
            <div className="mt-2 p-4 border rounded bg-gray-50">
              Navigate to the <strong>Video Upload</strong> page to upload your bowling video. Scrub through the video and select specific frames for analysis. Download the selected frames to your device.
            </div>
          )}
        </div>

        {/* Step 2 */}
        <div>
          <button
            onClick={() => toggleSection('step2')}
            className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Step 2: Analyze Frames
          </button>
          {openSections['step2'] && (
            <div className="mt-2 p-4 border rounded bg-gray-50">
              Go to the <strong>Analyzer</strong> page and upload the frames you downloaded. The app will provide detailed insights into your bowling technique.
            </div>
          )}
        </div>

        {/* Step 3 */}
        <div>
          <button
            onClick={() => toggleSection('step3')}
            className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Step 3: Track Performance
          </button>
          {openSections['step3'] && (
            <div className="mt-2 p-4 border rounded bg-gray-50">
              Use the <strong>Tournament Tracker</strong> to log your scores and monitor your performance over time. Identify trends and areas for improvement.
            </div>
          )}
        </div>

        {/* Step 4 */}
        <div>
          <button
            onClick={() => toggleSection('step4')}
            className="w-full text-left px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Step 4: Customize Settings
          </button>
          {openSections['step4'] && (
            <div className="mt-2 p-4 border rounded bg-gray-50">
              Visit the <strong>Settings</strong> page to personalize the app. Enable dark mode or adjust preferences to suit your needs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
