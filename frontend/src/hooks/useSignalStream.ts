import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addSignal, setConnectionStatus } from '@/store/slices/signalSlice';

export const useSignalStream = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || `${process.env.NEXT_PUBLIC_BACKEND_WS_URL}`;
    let ws = new WebSocket(`${wsUrl}/api/v1/signals/ws`);
    
    ws.onopen = () => {
      dispatch(setConnectionStatus(true));
    };

    ws.onmessage = (event) => {
      try {
        const signal = JSON.parse(event.data);
        dispatch(addSignal(signal));
      } catch (err) {
        console.error("Failed to parse signal message:", err);
      }
    };

    ws.onclose = () => {
      dispatch(setConnectionStatus(false));
      // Basic reconnect logic could go here
    };

    return () => {
      ws.close();
    };
  }, [dispatch]);
};
