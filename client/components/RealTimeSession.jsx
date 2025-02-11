import React, { useEffect, useState } from "react";
import CircleAnimation from './CircleAnimation';

export default function RealTimeSession({
                                          sessionState,
                                          toggleMute,
                                          terminateSession,
                                          audioContext,
                                          analyser
                                        }) {
  const [timeLeft, setTimeLeft] = useState(300);
  const [aiState, setAiState] = useState('listening');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);

    const aiInterval = setInterval(() => {
      setAiState(prev => {
        const states = ['listening', 'thinking', 'speaking'];
        return states[(states.indexOf(prev) + 1) % states.length];
      });
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(aiInterval);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      terminateSession();
    }
  }, [timeLeft, terminateSession]);

  const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return (
    <div className="session-container relative flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* Таймер */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow z-10">
        <span className="font-mono">{formattedTime}</span>
      </div>

      {/* Анимация круга поднята выше */}
      <div className="mb-16">
        <CircleAnimation
          audioContext={audioContext}
          analyser={analyser}
          isMuted={sessionState.muted}
          aiState={aiState}
        />
      </div>

      {/* Кнопки управления подняты выше */}
      <div className="absolute bottom-24 flex gap-4 z-10">
        <button
          className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-md flex items-center justify-center"
          onClick={toggleMute}
        >
          <i className="material-icons text-xl">
            {sessionState.muted ? 'mic_off' : 'mic'}
          </i>
        </button>
        <button
          className="p-3 bg-red-100 hover:bg-red-200 rounded-full transition-colors shadow-md flex items-center justify-center"
          onClick={terminateSession}
        >
          <i className="material-icons text-xl">meeting_room</i>
        </button>
      </div>
    </div>
  );
}