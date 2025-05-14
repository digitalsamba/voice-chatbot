/**
 * RealTimeSession.js
 *
 * This component renders the real-time session interface, including the timer, circle animation,
 * chat, and control buttons (mute, end session, settings). It also manages local settings such as microphone selection and volume.
 * All comments are in British English.
 */

import React, { useEffect, useState } from "react";
import CircleAnimation from "./CircleAnimation";

export default function RealTimeSession({
                                          sessionState,
                                          toggleMute,
                                          terminateSession,
                                          audioContext,
                                          analyser,
                                          microphones,
                                          onMicrophoneChange,
                                          chatMessages,
                                        }) {
  const [timeLeft, setTimeLeft] = useState(360);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [volume, setVolume] = useState(1);

  // Update the audio element volume whenever the volume state changes
  useEffect(() => {
    const audioEl = document.getElementById("audioPlayback");
    if (audioEl) {
      audioEl.volume = volume;
    }
  }, [volume]);

  // Countdown timer that decreases every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically terminate the session when the timer reaches zero
  useEffect(() => {
    if (timeLeft === 0) {
      terminateSession();
    }
  }, [timeLeft, terminateSession]);

  // Format the remaining time in MM:SS format
  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(
    timeLeft % 60
  ).padStart(2, "0")}`;

  // Resume AudioContext on user interaction if it is suspended
  useEffect(() => {
    const resumeAudio = () => {
      if (audioContext && audioContext.state === "suspended") {
        audioContext.resume();
      }
    };
    document.addEventListener("click", resumeAudio);
    document.addEventListener("touchstart", resumeAudio);
    return () => {
      document.removeEventListener("click", resumeAudio);
      document.removeEventListener("touchstart", resumeAudio);
    };
  }, [audioContext]);

  // Manage temporary settings state for microphone selection and volume
  const [tempMic, setTempMic] = useState("");
  const [tempVolume, setTempVolume] = useState(volume);

  useEffect(() => {
    if (showSettings) {
      setTempMic(microphones.length > 0 ? microphones[0].deviceId : "");
      setTempVolume(volume);
    }
  }, [showSettings, microphones, volume]);

  // Save settings changes and apply them
  const handleSaveSettings = () => {
    onMicrophoneChange(tempMic);
    setVolume(tempVolume);
    setShowSettings(false);
  };

  return (
    <div className="session-container relative flex flex-col items-center justify-center h-screen bg-gray-50">
      {/* Timer display */}
      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded shadow z-10">
        <span className="font-mono">{formattedTime}</span>
      </div>

      {/* Main circle animation */}
      <div className="mb-16">
        <CircleAnimation
          audioContext={audioContext}
          analyser={analyser}
          isMuted={sessionState.muted}
        />
      </div>

      {/* Bottom control bar */}
      <div
        className="absolute bottom-20 left-0 right-0 flex items-center justify-between px-4 z-10"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* Chat Button */}
        <button
          className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-md flex items-center justify-center h-auto"
          onClick={() => setShowChat(true)}
        >
          <i className="material-icons text-xl">chat</i>
        </button>

        {/* Mute and End Session Buttons */}
        <div className="flex gap-4">
          <button
            className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-md flex items-center justify-center h-auto"
            onClick={toggleMute}
          >
            <i className="material-icons text-xl">
              {sessionState.muted ? "mic_off" : "mic"}
            </i>
          </button>
          <button
            className="p-3 bg-red-100 hover:bg-red-200 rounded-full transition-colors shadow-md flex items-center justify-center h-auto"
            onClick={terminateSession}
          >
            <i className="material-icons text-xl">meeting_room</i>
          </button>
        </div>

        {/* Settings Button */}
        <button
          className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-md flex items-center justify-center h-auto"
          onClick={() => setShowSettings(true)}
        >
          <i className="material-icons text-xl">settings</i>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold mb-4">Settings</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Microphone
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                value={tempMic}
                onChange={(e) => setTempMic(e.target.value)}
              >
                {microphones && microphones.length > 0 ? (
                  microphones.map((mic) => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label || "Default Microphone"}
                    </option>
                  ))
                ) : (
                  <option value="">Default Microphone</option>
                )}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Site Volume
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={tempVolume}
                onChange={(e) => setTempVolume(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSaveSettings}
                className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-grow bg-gray-400 hover:bg-gray-500 text-white py-2 rounded"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 flex z-30">
          <div className="bg-white w-80 max-w-full h-full shadow-xl transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-bold">Chat</h3>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="material-icons">close</i>
              </button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
              {chatMessages.length === 0 ? (
                <p className="text-gray-500">No messages yet.</p>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 p-2 rounded ${
                      msg.sender === "user"
                        ? "bg-blue-100 text-blue-800 self-end"
                        : "bg-gray-100 text-gray-800 self-start"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <div
            className="flex-grow bg-black bg-opacity-50"
            onClick={() => setShowChat(false)}
          ></div>
        </div>
      )}
    </div>
  );
}
