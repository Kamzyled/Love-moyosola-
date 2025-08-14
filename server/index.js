const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// In-memory storage for games
const games = {};

// Load questions from JSON files
const questions = {
  romantic: JSON.parse(fs.readFileSync(path.join(__dirname, '../questions/romantic.json'), 'utf8')),
  friends: JSON.parse(fs.readFileSync(path.join(__dirname, '../questions/friends.json'), 'utf8')),
  // ... add other relationships
};

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  // Create a new game
  socket.on('createGame', (data) => {
    const { playerName, relationship, numQuestions } = data;
    const gameCode = generateGameCode();
    
    // Initialize the game
    games[gameCode] = {
      host: socket.id,
      players: {
        [socket.id]: {
          id: socket.id,
          name: playerName,
          role: 'host',
          score: 0
        }
      },
      relationship,
      numQuestions,
      questions: questions[relationship].sort(() => 0.5 - Math.random()).slice(0, numQuestions),
      currentQuestionIndex: 0,
      hostAnswer: null,
      guestGuess: null,
      gameState: 'waiting' // waiting, in-progress, completed
    };

    // Join the room
    socket.join(gameCode);
    socket.emit('gameCreated', { gameCode, playerId: socket.id });
  });

  // Join an existing game
  socket.on('joinGame', (data) => {
    const { gameCode, playerName } = data;
    const game = games[gameCode];

    if (!game) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    if (Object.keys(game.players).length >= 2) {
      socket.emit('error', { message: 'Game is full' });
      return;
    }

    // Add player to the game
    game.players[socket.id] = {
      id: socket.id,
      name: playerName,
      role: 'guest',
      score: 0
    };

    // Join the room
    socket.join(gameCode);
    socket.emit('gameJoined', { gameCode, playerId: socket.id });

    // Notify host that a guest has joined
    io.to(game.host).emit('guestJoined', { guestName: playerName });

    // Start the game if both players are present
    if (Object.keys(game.players).length === 2) {
      game.gameState = 'in-progress';
      // Send the first question to both players
      const question = game.questions[0];
      io.to(gameCode).emit('nextQuestion', {
        question,
        questionIndex: 0,
        totalQuestions: game.numQuestions
      });
    }
  });

  // Host submits an answer
  socket.on('hostAnswer', (data) => {
    const { gameCode, answer } = data;
    const game = games[gameCode];
    if (!game || game.gameState !== 'in-progress') return;

    game.hostAnswer = answer;
    // Notify guest that host has answered
    io.to(gameCode).emit('hostAnswered');
  });

  // Guest submits a guess
  socket.on('guestGuess', (data) => {
    const { gameCode, guess } = data;
    const game = games[gameCode];
    if (!game || game.gameState !== 'in-progress') return;

    game.guestGuess = guess;
    // Check if the guess matches the host's answer
    const isCorrect = guess.toLowerCase() === game.hostAnswer.toLowerCase();
    if (isCorrect) {
      game.players[socket.id].score += 1;
    }

    // Emit the result to both players
    io.to(gameCode).emit('roundResult', {
      hostAnswer: game.hostAnswer,
      guestGuess: guess,
      isCorrect,
      scores: Object.values(game.players).map(player => ({ id: player.id, name: player.name, score: player.score }))
    });

    // Move to next question after a delay
    setTimeout(() => {
      game.currentQuestionIndex += 1;
      if (game.currentQuestionIndex < game.numQuestions) {
        const nextQuestion = game.questions[game.currentQuestionIndex];
        game.hostAnswer = null;
        game.guestGuess = null;
        io.to(gameCode).emit('nextQuestion', {
          question: nextQuestion,
          questionIndex: game.currentQuestionIndex,
          totalQuestions: game.numQuestions
        });
      } else {
        // Game over
        game.gameState = 'completed';
        io.to(gameCode).emit('gameOver', {
          scores: Object.values(game.players).map(player => ({ id: player.id, name: player.name, score: player.score }))
        });
      }
    }, 5000);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id}`);
    // Clean up games if host disconnects
    for (const [gameCode, game] of Object.entries(games)) {
      if (game.host === socket.id || Object.keys(game.players).includes(socket.id)) {
        // If host leaves, end the game for everyone
        if (game.host === socket.id) {
          io.to(gameCode).emit('hostDisconnected');
        }
        // Remove the game
        delete games[gameCode];
      }
    }
  });
});

function generateGameCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
