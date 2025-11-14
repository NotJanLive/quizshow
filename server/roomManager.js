const GameState = require('./gameState');

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  generateRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    // Prüfe ob Code bereits existiert
    if (this.rooms.has(code)) {
      return this.generateRoomCode();
    }
    return code;
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  createRoom(roomCode) {
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 Stunden
    
    this.rooms.set(roomCode, {
      roomCode: roomCode,
      gameState: new GameState(),
      createdAt: Date.now(),
      expiresAt: expiresAt
    });

    console.log(`Raum ${roomCode} erstellt, läuft ab am ${new Date(expiresAt).toLocaleString()}`);
  }

  getRoom(roomCode) {
    const room = this.rooms.get(roomCode);
    
    if (!room) {
      return null;
    }

    // Prüfe ob Raum abgelaufen ist
    if (Date.now() > room.expiresAt) {
      this.rooms.delete(roomCode);
      console.log(`Raum ${roomCode} ist abgelaufen und wurde gelöscht`);
      return null;
    }

    return room;
  }

  deleteRoom(roomCode) {
    this.rooms.delete(roomCode);
    console.log(`Raum ${roomCode} wurde gelöscht`);
  }

  cleanupExpiredRooms() {
    const now = Date.now();
    let deletedCount = 0;

    for (const [roomCode, room] of this.rooms.entries()) {
      if (now > room.expiresAt) {
        this.rooms.delete(roomCode);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`${deletedCount} abgelaufene Räume wurden aufgeräumt`);
    }
  }

  getRoomCount() {
    return this.rooms.size;
  }
}

module.exports = RoomManager;
