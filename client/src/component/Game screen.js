import React, { useState, useEffect } from 'react';

const GameScreen = ({ gameState, playerId, onHostAnswer, onGuestGuess }) => {
  const [answer, setAnswer] = useState('');
  const [guess, setGuess] = useState('');

  const isHost = gameState?.players?.[playerId]?.role === 'host';

  useEffect(() => {
    // Reset input fields when a new question comes
    setAnswer('');
    setGuess('');
  }, [gameState?.currentQuestion]);

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      onHostAnswer(answer);
    }
  };

  const handleSubmitGuess = (e) => {
    e.preventDefault();
    if (guess.trim()) {
      onGuestGuess(guess);
    }
  };

  if (gameState.gameOver) {
    return (
      <div className="game-over-screen">
        <h2>Game Over!</h2>
        <h3>Final Scores</h3>
        <ul>
          {gameState.scores.map(player => (
            <li key={player.id}>{player.name}: {player.score}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="game-screen">
      <div className="question-section">
        <h3>Question {gameState.questionIndex + 1} of {gameState.totalQuestions}</h3>
        <h2>{gameState.currentQuestion}</h2>
      </div>

      {gameState.showResult ? (
        <div className="result-section">
          <p>Host's answer: {gameState.hostAnswer}</p>
          <p>Guest's guess: {gameState.guestGuess}</p>
          <p>{gameState.isCorrect ? 'Correct!' : 'Incorrect!'}</p>
          <div className="scores">
            <h3>Scores</h3>
            <ul>
              {gameState.scores.map(player => (
                <li key={player.id}>{player.name}: {player.score}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          {isHost ? (
            <div className="host-section">
              {gameState.waitingForHostAnswer ? (
                <form onSubmit={handleSubmitAnswer}>
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer"
                    required
                  />
                  <button type="submit">Submit Answer</button>
                </form>
              ) : (
                <p>Waiting for guest to guess...</p>
              )}
            </div>
          ) : (
            <div className="guest-section">
              {gameState.waitingForGuestGuess ? (
                gameState.waitingForHostAnswer ? (
                  <p>Waiting for host to answer...</p>
                ) : (
                  <form onSubmit={handleSubmitGuess}>
                    <input
                      type="text"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      placeholder="Guess the host's answer"
                      required
                    />
                    <button type="submit">Submit Guess</button>
                  </form>
                )
              ) : (
                <p>Waiting for results...</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GameScreen;
