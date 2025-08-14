import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import WelcomeScreen from './components/WelcomeScreen';
import CreateGameScreen from './components/CreateGameScreen';
import JoinGameScreen from './components/JoinGameScreen';
import GameScreen from './components/GameScreen';
import './App.css';

const socket = io('http://localhost:4000');

function App() {
  const [screen, setScreen] = useState('welcome'); // welcome, create, join, game
  const [playerId, setPlayerId] = useState(null);
  const [gameCode, setGameCode] = useState(null);
  const [gameState, setGameState] = useState(null); // Holds the current game state

  useEffect(() => {
    // Listen for events from the server
    socket.on('gameCreated', (data) => {
      setGameCode(data.gameCode);
      setPlayerId(data.playerId);
      setScreen('waiting'); // Show waiting screen for host until guest joins
    });

    socket.on('gameJoined', (data) => {
      setGameCode(data.gameCode);
      setPlayerId(data.playerId);
      setScreen('game');
    });

    socket.on('guestJoined', (data) => {
      // Host is notified that a guest joined, so start the game
      setScreen('game');
    });

    socket.on('nextQuestion', (data) => {
      setGameState(prev => ({
        ...prev,
        currentQuestion: data.question,
        questionIndex: data.questionIndex,
        totalQuestions: data.totalQuestions,
        hostAnswer: null,
        guestGuess: null,
        waitingForHostAnswer: true,
        waitingForGuestGuess: true
      }));
    });

    socket.on('hostAnswered', () => {
      // Guest is notified that host has answered
      setGameState(prev => ({
        ...prev,
        waitingForHostAnswer: false,
        waitingForGuestGuess: true
      }));
    });

    socket.on('roundResult', (data) => {
      setGameState(prev => ({
        ...prev,
        hostAnswer: data.hostAnswer,
        guestGuess: data.guestGuess,
        isCorrect: data.isCorrect,
        scores: data.scores,
        showResult: true
      }));
    });

    socket.on('gameOver', (data) => {
      setGameState(prev => ({
        ...prev,
        gameOver: true,
        scores: data.scores
      }));
    });

    socket.on('hostDisconnected', () => {
      alert('Host disconnected! Game ended.');
      setScreen('welcome');
    });

    socket.on('error', (data) => {
      alert(data.message);
    });

    return () => {
      socket.off();
    };
  }, []);

  const handleCreateGame = (playerName, relationship, numQuestions) => {
    socket.emit('createGame', { playerName, relationship, numQuestions });
  };

  const handleJoinGame = (gameCode, playerName) => {
    socket.emit('joinGame', { gameCode, playerName });
  };

  const handleHostAnswer = (answer) => {
    socket.emit('hostAnswer', { gameCode, answer });
  };

  const handleGuestGuess = (guess) => {
    socket.emit('guestGuess', { gameCode, guess });
  };

  return (
    <div className="app">
      {screen === 'welcome' && (
        <WelcomeScreen onCreateGame={() => setScreen('create')} onJoinGame={() => setScreen('join')} />
      )}
      {screen === 'create' && (
        <CreateGameScreen onCreateGame={handleCreateGame} onBack={() => setScreen('welcome')} />
      )}
      {screen === 'join' && (
        <JoinGameScreen onJoinGame={handleJoinGame} onBack={() => setScreen('welcome')} />
      )}
      {screen === 'waiting' && (
        <div className="waiting-screen">
          <h2>Game Code: {gameCode}</h2>
          <p>Waiting for a player to join...</p>
        </div>
      )}
      {screen === 'game' && gameState && (
        <GameScreen 
          gameState={gameState}
          playerId={playerId}
          onHostAnswer={handleHostAnswer}
          onGuestGuess={handleGuestGuess}
        />
      )}
    </div>
  );
}

export default App;
