import { useState, useEffect } from 'react';
import { ArrowDown, ArrowUp, Award, Download, FileText, Plus, Save, Trash } from 'lucide-react';
import { saveAs } from 'file-saver';

interface Game {
  id: string;
  score: number;
  date: string;
  location: string;
  notes: string;
}

export default function TournamentPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [newGame, setNewGame] = useState<Omit<Game, 'id'>>({
    score: 0,
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: ''
  });
  const [tipOfTheDay, setTipOfTheDay] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'score'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    // Load games from localStorage
    const savedGames = localStorage.getItem('bowlBetterGames');
    if (savedGames) {
      setGames(JSON.parse(savedGames));
    }
    
    // Set tip of the day
    setTipOfTheDay(getRandomTip());
  }, []);
  
  useEffect(() => {
    // Save games to localStorage whenever they change
    localStorage.setItem('bowlBetterGames', JSON.stringify(games));
  }, [games]);
  
  const getRandomTip = () => {
    const tips = [
      "Focus on your breathing to stay calm during tournament play.",
      "Keep your pre-shot routine consistent for every frame.",
      "Stay hydrated throughout tournament play for better focus.",
      "Adjust your targeting based on lane conditions after practice.",
      "Make small adjustments - move only 1-2 boards at a time.",
      "Pay attention to how your ball reacts as the lane conditions change.",
      "Keep track of which balls work best on different lane conditions.",
      "Focus on spare shooting in practice - strikes will come in competition.",
      "Stay positive and focus on your next shot, not your last one.",
      "Watch how other bowlers' balls are reacting on your pair."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  };
  
  const handleAddGame = () => {
    if (newGame.score < 0 || newGame.score > 300) {
      alert('Please enter a valid score between 0 and 300');
      return;
    }
    
    const gameToAdd: Game = {
      id: Date.now().toString(),
      ...newGame
    };
    
    setGames([...games, gameToAdd]);
    setNewGame({
      score: 0,
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: ''
    });
    setShowAddForm(false);
  };
  
  const handleDeleteGame = (id: string) => {
    const updatedGames = games.filter(game => game.id !== id);
    setGames(updatedGames);
  };
  
  const calculateStats = () => {
    if (games.length === 0) return { average: 0, highest: 0, lowest: 0 };
    
    const scores = games.map(game => game.score);
    const sum = scores.reduce((acc, score) => acc + score, 0);
    const average = Math.round(sum / games.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return { average, highest, lowest };
  };
  
  const stats = calculateStats();
  
  const sortGames = (games: Game[]) => {
    return [...games].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
      }
    });
  };
  
  const sortedGames = sortGames(games);
  
  const toggleSort = (field: 'date' | 'score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-green-600 py-4 px-6">
          <h1 className="text-white text-xl font-bold">Tournament Tools</h1>
          <p className="text-green-100 text-sm mt-1">Track your scores and get tournament tips</p>
          <p className="text-green-200 text-xs mt-1">Created by John Dondlinger</p>
        </div>
        
        <div className="p-6">
          {/* Tip of the Day */}
          <div className="mb-8 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
            <h3 className="text-yellow-800 font-medium mb-2 flex items-center">
              <Award size={18} className="mr-2 text-yellow-600" />
              Tip of the Day
            </h3>
            <p className="text-yellow-700">{tipOfTheDay}</p>
          </div>
          
          {/* Stats Overview */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Statistics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-green-600 text-sm font-medium">Average Score</p>
                <p className="text-3xl font-bold text-green-700">{stats.average}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <p className="text-green-600 text-sm font-medium">Highest Game</p>
                <p className="text-3xl font-bold text-green-700">{stats.highest}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <p className="text-purple-600 text-sm font-medium">Games Recorded</p>
                <p className="text-3xl font-bold text-purple-700">{games.length}</p>
              </div>
            </div>
          </div>
          
          {/* Game List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Games</h2>
              
              <div className="flex gap-2">
                {games.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="px-3 py-1 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center text-sm"
                  >
                    <Download size={16} className="mr-1" />
                    Export CSV
                  </button>
                )}
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-3 py-1 bg-green-600 rounded-md text-white hover:bg-green-700 flex items-center text-sm"
                >
                  {showAddForm ? 'Cancel' : (
                    <>
                      <Plus size={16} className="mr-1" />
                      Add Game
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Add Game Form */}
            {showAddForm && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-3">Add New Game</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      id="score"
                      min="0"
                      max="300"
                      value={newGame.score}
                      onChange={(e) => setNewGame({...newGame, score: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={newGame.date}
                      onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={newGame.location}
                    onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter bowling alley name"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={newGame.notes}
                    onChange={(e) => setNewGame({...newGame, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Lane conditions, equipment used, etc."
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAddGame}
                    className="px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 flex items-center"
                  >
                    <Save size={16} className="mr-2" />
                    Save Game
                  </button>
                </div>
              </div>
            )}
            
            {/* Games Table */}
            {games.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('score')} 
                          className="flex items-center focus:outline-none"
                        >
                          Score
                          {sortField === 'score' && (
                            sortDirection === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <button 
                          onClick={() => toggleSort('date')} 
                          className="flex items-center focus:outline-none"
                        >
                          Date
                          {sortField === 'date' && (
                            sortDirection === 'asc' ? 
                            <ArrowUp size={14} className="ml-1" /> : 
                            <ArrowDown size={14} className="ml-1" />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedGames.map((game) => (
                      <tr key={game.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            game.score >= 200 ? 'bg-green-100 text-green-800' :
                            game.score >= 150 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {game.score}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(game.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {game.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {game.notes}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteGame(game.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText size={40} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No games recorded yet. Add a game to start tracking your progress!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
