const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const RoomManager = require('./roomManager');
const GameState = require('./gameState');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../client')));

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('rejoin-room', ({ roomCode, sessionId, isHost }) => {
    const room = roomManager.getRoom(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Raum existiert nicht oder ist abgelaufen' });
      return;
    }

    const session = room.gameState.getSession(sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session nicht gefunden' });
      return;
    }

    socket.join(roomCode);
    room.gameState.updateSocketId(sessionId, socket.id);
    
    console.log(`Client ${sessionId} wieder verbunden in Raum ${roomCode}`);

    socket.emit('game-state-update', room.gameState.getState());
    socket.emit('rejoin-success', {
      sessionId: sessionId,
      isHost: isHost,
      roomCode: roomCode
    });
  });

  socket.on('create-room', ({ hostName }) => {
    const roomCode = roomManager.generateRoomCode();
    const sessionId = roomManager.generateSessionId();
    
    roomManager.createRoom(roomCode);
    const room = roomManager.getRoom(roomCode);
    
    room.gameState.addPlayer({
      sessionId: sessionId,
      socketId: socket.id,
      name: hostName,
      isHost: true
    });

    socket.join(roomCode);
    
    console.log(`Raum ${roomCode} erstellt von ${hostName}`);

    socket.emit('room-created', {
      roomCode: roomCode,
      sessionId: sessionId,
      expiresAt: room.expiresAt
    });

    socket.emit('game-state-update', room.gameState.getState());
  });

  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = roomManager.getRoom(roomCode);
    
    if (!room) {
      socket.emit('error', { message: 'Raum existiert nicht oder ist abgelaufen' });
      return;
    }

    const sessionId = roomManager.generateSessionId();
    
    room.gameState.addPlayer({
      sessionId: sessionId,
      socketId: socket.id,
      name: playerName,
      isHost: false
    });

    socket.join(roomCode);
    
    console.log(`${playerName} ist Raum ${roomCode} beigetreten`);

    socket.emit('room-joined', {
      roomCode: roomCode,
      sessionId: sessionId
    });

    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('start-game-mode', ({ roomCode, sessionId, mode }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Modi starten' });
      return;
    }

    room.gameState.startGameMode(mode);
    
    console.log(`Spielmodus ${mode} gestartet in Raum ${roomCode}`);

    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('reveal-keyword', ({ roomCode, sessionId, keywordIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Keywords revealen' });
      return;
    }

    room.gameState.revealKeyword(keywordIndex);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('eliminate-player', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Spieler eliminieren' });
      return;
    }

    room.gameState.eliminatePlayer(targetSessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('revive-player', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Spieler wiederbeleben' });
      return;
    }

    room.gameState.revivePlayer(targetSessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('set-player-points', ({ roomCode, sessionId, targetSessionId, points }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Punkte anpassen' });
      return;
    }

    room.gameState.setPlayerPoints(targetSessionId, points);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('adjust-points', ({ roomCode, sessionId, targetSessionId, delta }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Punkte anpassen' });
      return;
    }

    room.gameState.adjustPlayerPoints(targetSessionId, delta);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('next-round', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Runden wechseln' });
      return;
    }

    const result = room.gameState.nextRound();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('select-answer', ({ roomCode, sessionId, answerIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    room.gameState.setTempAnswer(sessionId, answerIndex);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('submit-answer', ({ roomCode, sessionId, questionIndex, answerIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    room.gameState.submitAnswer(sessionId, questionIndex, answerIndex);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('reveal-answer', ({ roomCode, sessionId, questionIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Antworten revealen' });
      return;
    }

    room.gameState.revealAnswer(questionIndex);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('next-question', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Fragen wechseln' });
      return;
    }

    room.gameState.nextQuestion();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  // NEW: Higher or Lower Events
  socket.on('add-life', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Leben hinzufügen' });
      return;
    }

    room.gameState.addLife(targetSessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('remove-life', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Leben entziehen' });
      return;
    }

    room.gameState.removeLife(targetSessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('add-points-hol', ({ roomCode, sessionId, targetSessionId, amount }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Punkte vergeben' });
      return;
    }

    room.gameState.addPointsHOL(targetSessionId, amount);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('next-round-hol', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Runden wechseln' });
      return;
    }

    room.gameState.nextRoundHOL();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('show-leaderboard', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Leaderboard anzeigen' });
      return;
    }

    room.gameState.showLeaderboard();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('continue-to-next-mode', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Modi wechseln' });
      return;
    }

    room.gameState.continueToNextMode();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

    // Symbol Quiz Events
  socket.on('player-buzz', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    room.gameState.playerBuzz(sessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('reset-buzzer', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann den Buzzer resetten' });
      return;
    }

    room.gameState.resetBuzzer();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('reveal-tip', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Tipps revealen' });
      return;
    }

    room.gameState.revealNextTip();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('award-points-sq', ({ roomCode, sessionId, targetSessionId, points }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Punkte vergeben' });
      return;
    }

    room.gameState.awardPointsSQ(targetSessionId, points);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('next-theme-sq', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Themen wechseln' });
      return;
    }

    room.gameState.nextThemeSQ();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  // Jeopardy Events
  socket.on('select-jeopardy-question', ({ roomCode, sessionId, categoryIndex, questionIndex }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    // UPDATED: Prüfe ob currentPlayer gleich der sessionId ist (jetzt sessionId, nicht index)
    const currentPlayer = room.gameState.jpState.currentPlayer;
    
    if (currentPlayer === -1) {
      socket.emit('error', { message: 'Der Host muss erst einen Spieler auswählen!' });
      return;
    }

    if (sessionId !== currentPlayer) {
      socket.emit('error', { message: 'Du bist nicht an der Reihe!' });
      return;
    }

    const result = room.gameState.selectJeopardyQuestion(categoryIndex, questionIndex);
    
    if (!result.success) {
      socket.emit('error', { message: result.message });
      return;
    }

    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('mark-jeopardy-correct', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Antworten bewerten' });
      return;
    }

    room.gameState.markJeopardyCorrect();
    
    console.log(`[MARK CORRECT] State wird gesendet mit Punkte-Update`);
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('mark-jeopardy-wrong', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Antworten bewerten' });
      return;
    }

    room.gameState.markJeopardyWrong();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

   socket.on('player-buzz-jeopardy', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    const success = room.gameState.playerBuzzJeopardy(sessionId);
    if (!success) {
      socket.emit('error', { message: 'Du darfst nicht auf deine eigene Frage buzzern!' });
      return;
    }
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('reset-buzzer-jeopardy', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann den Buzzer resetten' });
      return;
    }

    room.gameState.jpState.buzzerPlayer = null;
    // buzzerActive bleibt true - andere können noch buzzern!
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  // UPDATED: Host setzt manuell den nächsten Spieler nach Antwort
  socket.on('set-next-jeopardy-player', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Züge setzen' });
      return;
    }

    room.gameState.setCurrentJeopardyPlayer(targetSessionId);
    room.gameState.jpState.currentQuestion = null;
    room.gameState.jpState.buzzerActive = false;
    room.gameState.jpState.buzzerPlayer = null;
    room.gameState.jpState.answered = false;
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

  socket.on('award-buzz-points', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Punkte vergeben' });
      return;
    }

    room.gameState.awardBuzzPoints(targetSessionId);
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

   socket.on('next-jeopardy-question', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann weitermachen' });
      return;
    }

    const isGameOver = room.gameState.nextJeopardyQuestion();
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
    
    // Wenn Spiel vorbei ist, keine Player-Selection nötig
    if (isGameOver) {
      io.to(roomCode).emit('jeopardy-game-over');
    }
  });

// NEW: Host setzt den aktuellen Spieler
socket.on('set-jeopardy-current-player', ({ roomCode, sessionId, targetSessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann Spieler wechseln' });
      return;
    }

    console.log(`Host setzt Spieler: ${targetSessionId}`); // DEBUG

    room.gameState.setCurrentJeopardyPlayer(targetSessionId);
    room.gameState.jpState.currentQuestion = null;
    room.gameState.jpState.buzzerActive = false;
    room.gameState.jpState.buzzerPlayer = null;
    room.gameState.jpState.answered = false;
    
    console.log(`Aktueller Spieler nach Setzung: ${room.gameState.jpState.currentPlayer}`); // DEBUG
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
  });

 socket.on('end-quiz-show', ({ roomCode, sessionId }) => {
    console.log(`[END-QUIZ-SHOW] roomCode: ${roomCode}, sessionId: ${sessionId}`);
    
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      console.error('✗ Raum nicht gefunden');
      socket.emit('error', { message: 'Raum nicht gefunden' });
      return;
    }

    if (!room.gameState.isHost(sessionId)) {
      console.error('✗ Nur Host darf das tun');
      socket.emit('error', { message: 'Nur der Host kann die Quizshow beenden' });
      return;
    }

    console.log('✓ Beende Quizshow');
    room.gameState.endGameMode();
    
    const newState = room.gameState.getState();
    console.log(`[STATE] currentScreen: ${newState.currentScreen}`);
    
    io.to(roomCode).emit('game-state-update', newState);
    console.log('✓ State Update gesendet');
  });

   socket.on('reset-jeopardy-for-next-player', ({ roomCode, sessionId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) return;

    if (!room.gameState.isHost(sessionId)) {
      socket.emit('error', { message: 'Nur der Host kann das tun' });
      return;
    }

    room.gameState.jpState.currentQuestion = null;
    room.gameState.jpState.buzzerActive = false;
    room.gameState.jpState.buzzerPlayer = null;
    room.gameState.jpState.answered = false;
    
    io.to(roomCode).emit('game-state-update', room.gameState.getState());
    io.to(roomCode).emit('waiting-for-next-player');
  });

  socket.on('disconnect', () => {
    console.log('Client getrennt:', socket.id);
  });
});

setInterval(() => {
  roomManager.cleanupExpiredRooms();
}, 5 * 60 * 1000);

server.listen(PORT, () => {
  console.log(`🚀 Quiz Show Server läuft auf Port ${PORT}`);
  console.log(`📱 Öffne http://localhost:${PORT} im Browser`);
});
