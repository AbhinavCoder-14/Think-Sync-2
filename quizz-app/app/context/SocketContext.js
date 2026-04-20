'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);
const DEFAULT_SOCKET_PATH = '/socket.io';
const DEFAULT_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const connect = (path = DEFAULT_SOCKET_PATH) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const newSocket = io(DEFAULT_SOCKET_URL, {
      path,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    return newSocket;
  };

  const connectToSocketPath = async (path = DEFAULT_SOCKET_PATH) => {
    const nextSocket = connect(path);

    return new Promise((resolve, reject) => {
      nextSocket.once('connect', () => resolve(nextSocket));
      nextSocket.once('connect_error', reject);
    });
  };

  const connectToRoom = async (route) => {
    const socketPath = route?.socketPath || DEFAULT_SOCKET_PATH;
    return connectToSocketPath(socketPath);
  };

  useEffect(() => {
    connect(DEFAULT_SOCKET_PATH);

    // clean up fucntion
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectToSocketPath, connectToRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};