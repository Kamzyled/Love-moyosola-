import React, { useState } from 'react';

const CreateGameScreen = ({ onCreateGame, onBack }) => {
  const [playerName, setPlayerName] = useState('');
  const [relationship, setRelationship] = useState('romantic');
  const [numQuestions, setNumQuestions] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    onCreateGame(playerName, relationship, parseInt(numQuestions));
  };

  return (
    <div className="create-game-screen">
      <h2>Create Game</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        <select value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option value="romantic">Romantic Partner</option>
          <option value="friends">Friends</option>
          {/* Add more options */}
        </select>
        <input
          type="number"
          placeholder="Number of Questions"
          min="1"
          max="20"
          value={numQuestions}
          onChange={(e) => setNumQuestions(e.target.value)}
          required
        />
        <div className="button-group">
          <button type="button" className="btn back-btn" onClick={onBack}>Back</button>
          <button type="submit" className="btn start-btn">Start Game</button>
        </div>
      </form>
    </div>
  );
};

export default CreateGameScreen;
