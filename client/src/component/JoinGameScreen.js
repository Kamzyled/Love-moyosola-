import React, { useState } from 'react';

const JoinGameScreen = ({ onJoinGame, onBack }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !gameCode.trim()) return;
    onJoinGame(gameCode, playerName);
  };

  return (
    <div className="join-game-screen">
      <h2>Join Game</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          required
        />
        <div className="button-group">
          <button type="button" className="btn back-btn" onClick={onBack}>Back</button>
          <button type="submit" className="btn join-btn">Join</button>
        </div>
      </form>
    </div>
  );
};

export default JoinGameScreen;
