import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface WebSocketMessage {
    type: string;
    [key: string]: any;
}

interface WebSocketContextType {
    socketId: string;
    lastMessage: WebSocketMessage | null;
    sendMessage: (message: any) => void;
    isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socketId] = useState(() => {
        const saved = localStorage.getItem('flowstate_socket_id');
        if (saved) return saved;
        const newId = uuidv4();
        localStorage.setItem('flowstate_socket_id', newId);
        return newId;
    });

    const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const baseWsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
        const wsUrl = `${baseWsUrl}/${socketId}`;
        console.log('Connecting to WebSocket:', wsUrl);
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
            setIsConnected(true);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setLastMessage(data);
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        socket.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
            // Optional: implement reconnect logic
        };

        socket.onerror = (err) => {
            console.error('WebSocket Error:', err);
        };

        return () => {
            socket.close();
        };
    }, [socketId]);

    const sendMessage = (message: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
    };

    return (
        <WebSocketContext.Provider value={{ socketId, lastMessage, sendMessage, isConnected }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};
