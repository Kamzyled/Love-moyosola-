import React from 'react';

const WelcomeScreen = ({ onCreateGame, onJoinGame }) => {
  return (
    <div className="welcome-screen">
      <h1 className="logo">Moyosola</h1>
      <div className="button-group">
        <button className="btn create-btn" onClick={onCreateGame}>Create Game</button>
        <button className="btn join-btn" onClick={onJoinGame}>Join Game</button>
      </div>
      <footer>Created with love by Kamzy</footer>
    </div>
  );
};

export default WelcomeScreen;
