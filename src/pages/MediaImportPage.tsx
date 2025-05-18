import React, { useState } from 'react';
import { useAssignment } from '../contexts/AssignmentContext';

const MediaImportPage: React.FC = () => {
  const { assignments, setAssignments } = useAssignment();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  console.log('MediaImportPage Rendered');
  console.log('Current Assignments:', assignments);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setImageFiles(files);
      setCurrentIndex(0); // Reset to the first image
      setAssignments({}); // Clear previous assignments
      console.log('Uploaded Files:', files);
    }
  };

  const handleScrub = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentIndex(parseInt(event.target.value, 10));
    console.log('Scrubbed to Index:', currentIndex);
  };

  const assignFrame = (step: string) => {
    setAssignments((prev) => ({
      ...prev,
      [currentIndex]: { step, file: imageFiles[currentIndex] || null },
    }));
    console.log(`Assigned Frame ${currentIndex} to ${step}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Media Import and Assignment</h1>

      <label htmlFor="image-upload" className="block mb-2">Upload Image Sequence</label>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="mb-4"
      />

      {imageFiles.length > 0 && (
        <div>
          <div className="flex justify-center mb-4">
            <img
              src={URL.createObjectURL(imageFiles[currentIndex])}
              alt={`Frame ${currentIndex + 1}`}
              className="max-w-full max-h-96 border"
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <label htmlFor="scrubber" className="text-sm">Scrub:</label>
            <input
              id="scrubber"
              type="range"
              min="0"
              max={imageFiles.length - 1}
              value={currentIndex}
              onChange={handleScrub}
              className="w-full"
            />
            <span className="text-sm">Frame {currentIndex + 1} / {imageFiles.length}</span>
          </div>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => assignFrame('Bowling Approach')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Assign to Bowling Approach
            </button>
            <button
              onClick={() => assignFrame('Release Analysis')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Assign to Release Analysis
            </button>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Assignments</h2>
            <ul className="list-disc pl-5">
              {Object.entries(assignments).map(([index, { step }]) => (
                <li key={index}>
                  Frame {parseInt(index, 10) + 1}: {step}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaImportPage;
