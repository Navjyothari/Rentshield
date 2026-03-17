import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useSocket = () => {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      withCredentials: true,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      // console.log('Socket connected');
      if (user) {
        socket.emit('join_room', `${user.role}:${user.id}`);
        socket.emit('join_room', user.role);
      }
    });

    // Global notifications
    socket.on('issue:status_changed', (data) => {
      toast.info(`Issue ${data.issueId.substring(0,8)} status changed to ${data.newStatus}`);
    });

    socket.on('ai:verdict_ready', (data) => {
      toast.success('AI Analysis Completed');
    });

    socket.on('evidence:analyzed', (data) => {
      if(data.tamperScore > 0.5) {
        toast.error('Warning: Uploaded evidence flagged by EXIF analysis');
      } else {
        toast.success('Evidence verified successfully');
      }
    });

    return () => {
      if (socket) {
        if (user) {
          socket.emit('leave_room', `${user.role}:${user.id}`);
          socket.emit('leave_room', user.role);
        }
        socket.disconnect();
      }
    };
  }, [user]);

  return socketRef.current;
};
