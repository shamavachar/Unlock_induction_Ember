import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "../constants";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

    this.socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to Canteen Rush Socket.IO server:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from Socket.IO server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.warn("⚠️ Socket connection error:", error.message);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRoom(roomName) {
    if (!this.socket) this.connect();
    this.socket.emit(SOCKET_EVENTS.JOIN_ROOM, roomName);
  }

  leaveRoom(roomName) {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.LEAVE_ROOM, roomName);
    }
  }

  on(event, callback) {
    if (!this.socket) this.connect();
    this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (!this.socket) this.connect();
    this.socket.emit(event, data);
  }
}

export const socketService = new SocketService();
