'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';


const SocketContext = createContext(null);
const DEFAULT_SOCKET_PATH = '/socket.io';

const getSocketBaseUrl = () => process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  const createSocket = (path = DEFAULT_SOCKET_PATH) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(getSocketBaseUrl(), {
      path,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    return newSocket;
  };

  const connectToSocketPath = async (path = DEFAULT_SOCKET_PATH) => {
    const newSocket = createSocket(path);

    await new Promise((resolve, reject) => {
      newSocket.once('connect', resolve);
      newSocket.once('connect_error', reject);
    });

    return newSocket;
  };

  const connectToRoom = async (route) => {
    const socketPath = route?.socketPath || DEFAULT_SOCKET_PATH;
    return connectToSocketPath(socketPath);
  };

  useEffect(() => {
    createSocket(DEFAULT_SOCKET_PATH);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connectToSocketPath, connectToRoom }}>
      {children} {/*  whole app */}
    </SocketContext.Provider>
  );
};

// use by all the files to get the socket prop
export const useSocket = () => {
  return useContext(SocketContext);
};