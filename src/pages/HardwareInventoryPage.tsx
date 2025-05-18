import { useState, useEffect } from 'react';
import { Plus, Save, Trash } from 'lucide-react';

interface Ball {
  id: string;
  name: string;
  weight: number;
  coverStock: string;
  layout: string;
  notes: string;
}

// Helper function to validate a single ball object
const isValidBall = (item: any): item is Ball => {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.weight === 'number' &&
    typeof item.coverStock === 'string' &&
    typeof item.layout === 'string' &&
    typeof item.notes === 'string'
  );
};

export default function HardwareInventoryPage() {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [isAddingBall, setIsAddingBall] = useState(false);
  const [newBall, setNewBall] = useState<Omit<Ball, 'id'>>({
    name: '',
    weight: 15,
    coverStock: '',
    layout: '',
    notes: ''
  });
  
  useEffect(() => {
    // Load balls from localStorage
    const savedBalls = localStorage.getItem('bowlBetterBalls');
    if (savedBalls) {
      try {
        const parsedBalls = JSON.parse(savedBalls);
        if (Array.isArray(parsedBalls) && parsedBalls.every(isValidBall)) {
          setBalls(parsedBalls);
        } else {
          console.warn('Balls data from localStorage was not a valid array of Ball objects. Resetting.');
          localStorage.removeItem('bowlBetterBalls'); // Clear corrupted data
        }
      } catch (error) {
        console.error('Failed to parse balls from localStorage. Resetting.', error);
        localStorage.removeItem('bowlBetterBalls'); // Clear corrupted data
      }
    }
  }, []);
  
  useEffect(() => {
    // Save balls to localStorage whenever they change
    try {
      localStorage.setItem('bowlBetterBalls', JSON.stringify(balls));
    } catch (error) {
      console.error('Failed to save balls to localStorage:', error);
      // Consider notifying the user if saving fails, e.g., due to quota
    }
  }, [balls]);
  
  const handleAddBall = () => {
    if (!newBall.name) {
      alert('Please enter a ball name');
      return;
    }
    
    const ballToAdd: Ball = {
      id: Date.now().toString(),
      ...newBall
    };
    
    setBalls([...balls, ballToAdd]);
    setNewBall({
      name: '',
      weight: 15,
      coverStock: '',
      layout: '',
      notes: ''
    });
    setIsAddingBall(false);
  };
  
  const handleDeleteBall = (id: string) => {
    const updatedBalls = balls.filter(ball => ball.id !== id);
    setBalls(updatedBalls);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Hardware Inventory</h1>
          <p className="text-green-100 text-sm mt-1">Manage your bowling ball arsenal</p>
          <p className="text-green-200 text-xs mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900">Your Bowling Ball Arsenal</h2>
            <button
              onClick={() => setIsAddingBall(!isAddingBall)}
              className="px-3 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center"
            >
              {isAddingBall ? 'Cancel' : (
                <>
                  <Plus size={18} className="mr-2" />
                  Add Ball
                </>
              )}
            </button>
          </div>
          
          {isAddingBall && (
            <div className="mb-8 p-4 bg-green-50 border border-green-100 rounded-lg">
              <h3 className="text-md font-medium text-green-800 mb-4">Add New Ball</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="ballName" className="block text-sm font-medium text-gray-700 mb-1">
                    Ball Name
                  </label>
                  <input
                    type="text"
                    id="ballName"
                    value={newBall.name}
                    onChange={(e) => setNewBall({...newBall, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Storm Hy-Road"
                  />
                </div>
                
                <div>
                  <label htmlFor="ballWeight" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <select
                    id="ballWeight"
                    value={newBall.weight}
                    onChange={(e) => setNewBall({...newBall, weight: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  >
                    {[6, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(weight => (
                      <option key={weight} value={weight}>{weight} lbs</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="coverStock" className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Stock
                  </label>
                  <input
                    type="text"
                    id="coverStock"
                    value={newBall.coverStock}
                    onChange={(e) => setNewBall({...newBall, coverStock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Reactive Resin"
                  />
                </div>
                
                <div>
                  <label htmlFor="layout" className="block text-sm font-medium text-gray-700 mb-1">
                    Layout
                  </label>
                  <input
                    type="text"
                    id="layout"
                    value={newBall.layout}
                    onChange={(e) => setNewBall({...newBall, layout: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Pin down, 4.5 x 4.5 x 2"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={newBall.notes}
                  onChange={(e) => setNewBall({...newBall, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Performance notes, lane conditions, etc."
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleAddBall}
                  className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Save Ball
                </button>
              </div>
            </div>
          )}
          
          {balls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {balls.map(ball => (
                <div key={ball.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{ball.name}</h3>
                      <p className="text-green-600 font-medium">{ball.weight} lbs</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBall(ball.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label={`Delete ${ball.name}`}
                    >
                      <Trash size={18} />
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-1">
                    {ball.coverStock && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Cover Stock:</span> {ball.coverStock}
                      </p>
                    )}
                    
                    {ball.layout && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Layout:</span> {ball.layout}
                      </p>
                    )}
                    
                    {ball.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <p className="font-medium">Notes:</p>
                        <p className="mt-1">{ball.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No balls added yet</h3>
              <p className="mt-1 text-sm text-gray-500">Add your first bowling ball to start tracking your arsenal.</p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAddingBall(true)}
                  className="px-4 py-2 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center mx-auto"
                >
                  <Plus size={18} className="mr-2" />
                  Add Ball
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
