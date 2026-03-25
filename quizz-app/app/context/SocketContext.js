'use client';

import {createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';


const SocketContext = createContext(null);



export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(()=>{
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
    const newSocket = io(url);
    setSocket(newSocket);

    return () => newSocket.disconnect(); // socket get updated when user get disconnected
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children} {/*  whole app */}
    </SocketContext.Provider>
  );
};

// use by all the files to get the socket prop
export const useSocket = () => {
  return useContext(SocketContext);
};