const gameConfig = require('./gameConfig');

class GameState {
  constructor() {
    this.players = new Map();
    this.currentMode = null;
    this.currentScreen = 'lobby';
    this.gameProgress = 0;
    
    this.lmsState = {
      currentRound: 1,
      maxRounds: 5,
      keywords: [],
      revealedKeywords: [],
      currentRoundPoints: new Map(),
      accumulatedRoundPoints: new Map(),
      eliminatedPlayers: new Set()
    };

    this.wwmState = {
      currentQuestion: 0,
      totalQuestions: 30,
      questions: [],
      currentQuestionRevealed: false,
      playerTempAnswers: new Map(),
      playerAnswers: new Map(),
      correctAnswersRevealed: false
    };

    this.holState = {
      currentRound: 1,
      maxRounds: 3,
      roundLives: new Map()
    };

    this.sqState = {
      currentTheme: 0,
      maxThemes: 16,
      themes: [],
      currentBuzzer: null,
      revealedTips: [true, false, false, false],
      answered: false,
      revealedKeyword: -1
    };

    this.jpState = {
      categories: [],
      usedQuestions: new Set(),
      currentQuestion: null,
      currentPlayer: 0,
      activePlayersOrder: [],
      buzzerActive: false,
      buzzerPlayer: null,
      answered: false
    };
  }

  addPlayer(playerData) {
    this.players.set(playerData.sessionId, {
      sessionId: playerData.sessionId,
      socketId: playerData.socketId,
      name: playerData.name,
      isHost: playerData.isHost,
      totalPoints: 0,
      modePoints: 0,
      eliminated: false,
      lives: 2
    });
  }

  getSession(sessionId) {
    return this.players.get(sessionId);
  }

  updateSocketId(sessionId, newSocketId) {
    const player = this.players.get(sessionId);
    if (player) {
      player.socketId = newSocketId;
    }
  }

  isHost(sessionId) {
    const player = this.players.get(sessionId);
    return player && player.isHost;
  }

  startGameMode(mode) {
    this.currentMode = mode;
    this.currentScreen = 'game';

    for (const player of this.players.values()) {
      player.modePoints = 0;
      player.eliminated = false;
      player.lives = 2;
    }

    if (mode === 'last-man-standing') {
      this.initLastManStanding();
    } else if (mode === 'wwm') {
      this.initWWM();
    } else if (mode === 'higher-or-lower') {
      this.initHigherOrLower();
    } else if (mode === 'symbol-quiz') {
      this.initSymbolQuiz();
    } else if (mode === 'jeopardy') {
      this.initJeopardy();
    }
  }

  endGameMode() {
    for (const player of this.players.values()) {
      player.totalPoints += player.modePoints;
      player.modePoints = 0;
    }

    this.currentMode = null;
    this.currentScreen = 'leaderboard';
  }

  showLeaderboard() {
    this.currentScreen = 'leaderboard';
  }

  continueToNextMode() {
    for (const player of this.players.values()) {
      player.totalPoints += player.modePoints;
      player.modePoints = 0;
    }

    this.gameProgress++;
    this.currentMode = null;
    this.currentScreen = 'lobby';
  }

  // ============ LAST MAN STANDING ============

  initLastManStanding() {
    const config = gameConfig.lastManStanding;
    
    this.lmsState.currentRound = 1;
    this.lmsState.maxRounds = config.rounds.length;
    this.lmsState.keywords = [...config.rounds[0].keywords];
    this.lmsState.revealedKeywords = [];
    this.lmsState.currentRoundPoints.clear();
    this.lmsState.accumulatedRoundPoints.clear();
    this.lmsState.eliminatedPlayers.clear();

    for (const player of this.players.values()) {
      player.eliminated = false;
      player.modePoints = 0;
    }
  }

  revealKeyword(keywordIndex) {
    if (!this.lmsState.revealedKeywords.includes(keywordIndex)) {
      this.lmsState.revealedKeywords.push(keywordIndex);
    }
  }

  eliminatePlayer(sessionId) {
    const player = this.players.get(sessionId);
    if (player) {
      player.eliminated = true;
      this.lmsState.eliminatedPlayers.add(sessionId);
    }
  }

  revivePlayer(sessionId) {
    const player = this.players.get(sessionId);
    if (player) {
      player.eliminated = false;
      this.lmsState.eliminatedPlayers.delete(sessionId);
    }
  }

  setPlayerPoints(sessionId, points) {
    const player = this.players.get(sessionId);
    if (player) {
      this.lmsState.currentRoundPoints.set(sessionId, points);
      
      const accumulatedPoints = this.lmsState.accumulatedRoundPoints.get(sessionId) || 0;
      player.modePoints = accumulatedPoints + points;
    }
  }

  adjustPlayerPoints(sessionId, delta) {
    const player = this.players.get(sessionId);
    if (player) {
      const currentRoundPoints = this.lmsState.currentRoundPoints.get(sessionId) || 0;
      const newRoundPoints = Math.max(0, currentRoundPoints + delta);
      this.lmsState.currentRoundPoints.set(sessionId, newRoundPoints);
      
      const accumulatedPoints = this.lmsState.accumulatedRoundPoints.get(sessionId) || 0;
      player.modePoints = accumulatedPoints + newRoundPoints;
    }
  }

  nextRound() {
    const config = gameConfig.lastManStanding;
    
    if (this.lmsState.currentRound >= this.lmsState.maxRounds) {
      for (const [sessionId, roundPoints] of this.lmsState.currentRoundPoints.entries()) {
        const accumulatedPoints = this.lmsState.accumulatedRoundPoints.get(sessionId) || 0;
        this.lmsState.accumulatedRoundPoints.set(sessionId, accumulatedPoints + roundPoints);
      }

      for (const player of this.players.values()) {
        player.totalPoints += player.modePoints;
        player.modePoints = 0;
      }
      this.currentMode = null;
      this.currentScreen = 'leaderboard';
      return { nextMode: null, screen: 'leaderboard' };
    }

    for (const [sessionId, roundPoints] of this.lmsState.currentRoundPoints.entries()) {
      const accumulatedPoints = this.lmsState.accumulatedRoundPoints.get(sessionId) || 0;
      this.lmsState.accumulatedRoundPoints.set(sessionId, accumulatedPoints + roundPoints);
    }

    this.lmsState.currentRound++;
    const roundIndex = this.lmsState.currentRound - 1;
    this.lmsState.keywords = [...config.rounds[roundIndex].keywords];
    this.lmsState.revealedKeywords = [];
    this.lmsState.currentRoundPoints.clear();
    this.lmsState.eliminatedPlayers.clear();

    for (const player of this.players.values()) {
      player.eliminated = false;
      const accumulated = this.lmsState.accumulatedRoundPoints.get(player.sessionId) || 0;
      player.modePoints = accumulated;
    }

    return { nextMode: null, screen: 'game' };
  }

  // ============ WWM ============

  initWWM() {
    const config = gameConfig.wwm;
    this.wwmState.questions = [...config.questions];
    this.wwmState.currentQuestion = 0;
    this.wwmState.currentQuestionRevealed = false;
    this.wwmState.playerTempAnswers.clear();
    this.wwmState.playerAnswers.clear();
    this.wwmState.correctAnswersRevealed = false;

    for (const player of this.players.values()) {
      if (!player.isHost) {
        player.modePoints = 0;
      }
    }
  }

  setTempAnswer(sessionId, answerIndex) {
    this.wwmState.playerTempAnswers.set(sessionId, {
      answerIndex: answerIndex
    });
  }

  submitAnswer(sessionId, questionIndex, answerIndex) {
    if (questionIndex === this.wwmState.currentQuestion) {
      this.wwmState.playerAnswers.set(sessionId, {
        questionIndex: questionIndex,
        answerIndex: answerIndex,
        correct: null
      });
      this.wwmState.playerTempAnswers.delete(sessionId);
    }
  }

  revealAnswer(questionIndex) {
    if (questionIndex === this.wwmState.currentQuestion) {
      this.wwmState.currentQuestionRevealed = true;
      const correctAnswer = this.wwmState.questions[questionIndex].correctAnswer;

      const questionPoints = this.getWWMQuestionPoints(questionIndex);

      for (const [sessionId, answer] of this.wwmState.playerAnswers.entries()) {
        const player = this.players.get(sessionId);
        if (player && answer.answerIndex === correctAnswer) {
          player.modePoints += questionPoints;
          answer.correct = true;
        } else if (answer) {
          answer.correct = false;
        }
      }

      this.wwmState.correctAnswersRevealed = true;
    }
  }

  getWWMQuestionPoints(questionIndex) {
    const pointLevel = Math.floor(questionIndex / 2) + 1;
    return pointLevel;
  }

  nextQuestion() {
    if (this.wwmState.currentQuestion >= this.wwmState.totalQuestions - 1) {
      for (const player of this.players.values()) {
        player.totalPoints += player.modePoints;
        player.modePoints = 0;
      }
      this.currentMode = null;
      this.currentScreen = 'leaderboard';
      return;
    }

    this.wwmState.currentQuestion++;
    this.wwmState.currentQuestionRevealed = false;
    this.wwmState.playerTempAnswers.clear();
    this.wwmState.playerAnswers.clear();
    this.wwmState.correctAnswersRevealed = false;
  }

  // ============ HIGHER OR LOWER ============

  initHigherOrLower() {
    this.holState.currentRound = 1;
    this.holState.maxRounds = 3;
    this.holState.roundLives.clear();

    for (const player of this.players.values()) {
      if (!player.isHost) {
        player.lives = 2;
        player.modePoints = 0;
        this.holState.roundLives.set(player.sessionId, 2);
      }
    }
  }

  addLife(sessionId) {
    const player = this.players.get(sessionId);
    if (player && !player.isHost) {
      player.lives = Math.min(player.lives + 1, 5);
      this.holState.roundLives.set(sessionId, player.lives);
    }
  }

  removeLife(sessionId) {
    const player = this.players.get(sessionId);
    if (player && !player.isHost) {
      player.lives = Math.max(player.lives - 1, 0);
      this.holState.roundLives.set(sessionId, player.lives);
    }
  }

  addPointsHOL(sessionId, amount) {
    const player = this.players.get(sessionId);
    if (player && !player.isHost) {
      player.modePoints = Math.max(0, player.modePoints + amount);
    }
  }

  nextRoundHOL() {
    if (this.holState.currentRound >= this.holState.maxRounds) {
      for (const player of this.players.values()) {
        player.totalPoints += player.modePoints;
        player.modePoints = 0;
      }
      this.currentMode = null;
      this.currentScreen = 'leaderboard';
      return;
    }

    this.holState.currentRound++;
    for (const player of this.players.values()) {
      if (!player.isHost) {
        player.lives = 2;
        this.holState.roundLives.set(player.sessionId, 2);
      }
    }
  }

  // ============ SYMBOL QUIZ ============

  initSymbolQuiz() {
    const config = gameConfig.symbolQuiz;
    this.sqState.themes = [...config.themes];
    this.sqState.currentTheme = 0;
    this.sqState.currentBuzzer = null;
    this.sqState.revealedTips = [true, false, false, false];
    this.sqState.answered = false;
    this.sqState.revealedKeyword = -1;

    for (const player of this.players.values()) {
      if (!player.isHost) {
        player.modePoints = 0;
      }
    }
  }

  playerBuzz(sessionId) {
    if (!this.sqState.currentBuzzer && !this.sqState.answered) {
      this.sqState.currentBuzzer = sessionId;
    }
  }

  resetBuzzer() {
    this.sqState.currentBuzzer = null;
  }

  revealNextTip() {
    for (let i = 0; i < this.sqState.revealedTips.length; i++) {
      if (!this.sqState.revealedTips[i]) {
        this.sqState.revealedTips[i] = true;
        break;
      }
    }
  }

  awardPointsSQ(sessionId, points) {
    const player = this.players.get(sessionId);
    if (player && !player.isHost) {
      player.modePoints += points;
      this.sqState.answered = true;
      if (this.sqState.currentTheme >= 0) {
        this.sqState.revealedKeyword = this.sqState.currentTheme;
      }
    }
  }

  nextThemeSQ() {
    if (this.sqState.currentTheme >= this.sqState.themes.length - 1) {
      for (const player of this.players.values()) {
        player.totalPoints += player.modePoints;
        player.modePoints = 0;
      }
      this.currentMode = null;
      this.currentScreen = 'leaderboard';
      return;
    }

    this.sqState.currentTheme++;
    this.sqState.currentBuzzer = null;
    this.sqState.revealedTips = [true, false, false, false];
    this.sqState.answered = false;
    this.sqState.revealedKeyword = -1;
  }

  // ============ JEOPARDY ============

  initJeopardy() {
    const config = gameConfig.jeopardy;
    
    this.jpState.categories = config.categories.map(cat => ({
      name: cat.name,
      questions: [...cat.questions].sort((a, b) => a.points - b.points)
    }));
    
    this.jpState.usedQuestions.clear();
    this.jpState.currentQuestion = null;
    this.jpState.buzzerActive = false;
    this.jpState.buzzerPlayer = null;
    this.jpState.answered = false;

    this.jpState.activePlayersOrder = Array.from(this.players.values())
      .filter(p => !p.isHost)
      .map(p => p.sessionId);
    
    this.jpState.currentPlayer = -1;

    for (const player of this.players.values()) {
      if (!player.isHost) {
        player.modePoints = 0;
      }
    }
  }

  selectJeopardyQuestion(categoryIndex, questionIndex) {
    const key = `${categoryIndex}-${questionIndex}`;
    
    if (this.jpState.usedQuestions.has(key)) {
      return { success: false, message: 'Diese Frage wurde bereits beantwortet' };
    }

    if (this.jpState.currentQuestion) {
      return { success: false, message: 'Eine Frage ist bereits aktiv. Bitte warte auf die nächste Runde.' };
    }

    const question = this.jpState.categories[categoryIndex].questions[questionIndex];
    
    if (!question) {
      return { success: false, message: 'Frage nicht gefunden' };
    }

    this.jpState.currentQuestion = {
      categoryIndex,
      questionIndex,
      points: question.points,
      question: question.question,
      answer: question.answer
    };

    this.jpState.buzzerActive = false;
    this.jpState.buzzerPlayer = null;
    this.jpState.answered = false;

    return { success: true };
  }

  markJeopardyCorrect() {
    if (!this.jpState.currentQuestion) return;

    const currentPlayer = this.players.get(this.jpState.currentPlayer);
    if (currentPlayer) {
      const points = this.jpState.currentQuestion.points;
      currentPlayer.modePoints += points;
    }

    this.markQuestionUsed();
    this.jpState.answered = true;
  }

  markJeopardyWrong() {
    if (!this.jpState.currentQuestion) return;

    this.jpState.buzzerActive = true;
  }

  awardBuzzPoints(sessionId) {
    if (!this.jpState.currentQuestion || !this.jpState.buzzerActive) return;

    const buzzerPlayer = this.players.get(sessionId);
    if (buzzerPlayer) {
      const halfPoints = Math.floor(this.jpState.currentQuestion.points / 2);
      buzzerPlayer.modePoints += halfPoints;
    }

    this.markQuestionUsed();
    this.jpState.answered = true;
    this.jpState.buzzerActive = false;
    this.jpState.buzzerPlayer = null;
  }

  playerBuzzJeopardy(sessionId) {
    const currentPlayerSessionId = this.jpState.activePlayersOrder[this.jpState.currentPlayer];
    
    if (sessionId === currentPlayerSessionId) {
      return false;
    }

    if (this.jpState.buzzerActive && !this.jpState.buzzerPlayer) {
      this.jpState.buzzerPlayer = sessionId;
      return true;
    }
    return false;
  }

  resetBuzzerJeopardy() {
    this.jpState.buzzerPlayer = null;
  }

  markQuestionUsed() {
    if (!this.jpState.currentQuestion) return;
    
    const key = `${this.jpState.currentQuestion.categoryIndex}-${this.jpState.currentQuestion.questionIndex}`;
    this.jpState.usedQuestions.add(key);
  }

  setCurrentJeopardyPlayer(sessionId) {
    if (this.jpState.activePlayersOrder.includes(sessionId)) {
      this.jpState.currentPlayer = sessionId;
    }
  }

  nextJeopardyQuestion() {
    const totalQuestions = this.jpState.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
    
    if (this.jpState.usedQuestions.size >= totalQuestions) {
      for (const player of this.players.values()) {
        player.totalPoints += player.modePoints;
        player.modePoints = 0;
      }
      this.currentMode = null;
      this.currentScreen = 'final-leaderboard';
      return true;
    }

    this.jpState.currentQuestion = null;
    this.jpState.buzzerActive = false;
    this.jpState.buzzerPlayer = null;
    this.jpState.answered = false;
    return false;
  }

  getHostPlayersList() {
    const players = Array.from(this.players.values())
      .filter(p => !p.isHost);
    
    return players.sort((a, b) => a.name.localeCompare(b.name));
  }

  // State Export
  getState() {
    const playersArray = Array.from(this.players.values()).map(p => ({
      sessionId: p.sessionId,
      name: p.name,
      isHost: p.isHost,
      totalPoints: p.totalPoints,
      modePoints: p.modePoints,
      eliminated: p.eliminated,
      lives: p.lives
    }));

    playersArray.sort((a, b) => {
      if (this.currentScreen === 'leaderboard') {
        return b.totalPoints - a.totalPoints;
      }
      return b.modePoints - a.modePoints;
    });

    const state = {
      currentMode: this.currentMode,
      currentScreen: this.currentScreen,
      gameProgress: this.gameProgress,
      players: playersArray
    };

    if (this.currentMode === 'last-man-standing') {
      const config = gameConfig.lastManStanding;
      const roundConfig = config.rounds[this.lmsState.currentRound - 1];
      
      state.lmsState = {
        currentRound: this.lmsState.currentRound,
        maxRounds: this.lmsState.maxRounds,
        roundTitle: roundConfig.title,
        keywords: this.lmsState.keywords,
        revealedKeywords: this.lmsState.revealedKeywords
      };
    } else if (this.currentMode === 'wwm') {
      const question = this.wwmState.questions[this.wwmState.currentQuestion];
      
      const playerAnswers = {};
      const playerTempAnswers = {};

      for (const [sessionId, tempAnswer] of this.wwmState.playerTempAnswers.entries()) {
        const player = this.players.get(sessionId);
        if (player) {
          playerTempAnswers[player.name] = {
            answerIndex: tempAnswer.answerIndex
          };
        }
      }

      for (const [sessionId, answer] of this.wwmState.playerAnswers.entries()) {
        const player = this.players.get(sessionId);
        if (player) {
          playerAnswers[player.name] = {
            answerIndex: answer.answerIndex,
            correct: answer.correct
          };
        }
      }

      state.wwmState = {
        currentQuestion: this.wwmState.currentQuestion,
        totalQuestions: this.wwmState.totalQuestions,
        question: question,
        questionRevealed: this.wwmState.currentQuestionRevealed,
        playerTempAnswers: playerTempAnswers,
        playerAnswers: playerAnswers,
        correctAnswersRevealed: this.wwmState.correctAnswersRevealed,
        questionPoints: this.getWWMQuestionPoints(this.wwmState.currentQuestion)
      };
    } else if (this.currentMode === 'higher-or-lower') {
      state.holState = {
        currentRound: this.holState.currentRound,
        maxRounds: this.holState.maxRounds
      };
    } else if (this.currentMode === 'symbol-quiz') {
      const currentThemeData = this.sqState.themes[this.sqState.currentTheme];
      
      state.sqState = {
        currentTheme: this.sqState.currentTheme,
        maxThemes: this.sqState.themes.length,
        themes: this.sqState.themes,
        tips: currentThemeData ? currentThemeData.tips : [],
        revealedTips: this.sqState.revealedTips,
        currentBuzzer: this.sqState.currentBuzzer ? 
          this.players.get(this.sqState.currentBuzzer).name : null,
        answered: this.sqState.answered,
        revealedKeyword: this.sqState.revealedKeyword
      };
    } else if (this.currentMode === 'jeopardy') {
      let currentPlayerName = '';
      let currentPlayerSessionId = this.jpState.currentPlayer;
      
      if (this.jpState.currentPlayer !== -1 && this.jpState.currentPlayer !== null) {
        const player = this.players.get(this.jpState.currentPlayer);
        currentPlayerName = player ? player.name : '';
      }
      
      state.jpState = {
        categories: this.jpState.categories,
        usedQuestions: Array.from(this.jpState.usedQuestions),
        currentQuestion: this.jpState.currentQuestion,
        currentPlayer: currentPlayerName,
        currentPlayerSessionId: currentPlayerSessionId,
        buzzerActive: this.jpState.buzzerActive,
        buzzerPlayer: this.jpState.buzzerPlayer ? 
          this.players.get(this.jpState.buzzerPlayer).name : null,
        answered: this.jpState.answered
      };
    }

    return state;
  }
}

module.exports = GameState;