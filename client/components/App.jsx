/**
 * App.js
 *
 * Main application file that orchestrates the session, configuration, and user interface.
 * It imports components and session utility functions.
 * All comments are in British English.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import ModelSelection from "./ModelSelection";
import RealTimeConfiguration from "./RealTimeConfiguration";
import RealTimeSession from "./RealTimeSession";

// Import session utility functions
import {
  fetchMicrophones,
  updateAnalyserSource,
  reconnectAudio,
  terminateSession,
  startSession,
  handleVisibilityChange,
} from "../utils/sessionUtils";

export default function App() {
  // State for controlling the current view (menu, configuration, session)
  const [view, setView] = useState("menu");
  // State for error messages
  const [error, setError] = useState("");
  // State for connection status of the session
  const [connectionState, setConnectionState] = useState("disconnected");

  // Configuration state for the session
  const [config, setConfig] = useState({
    model: "gpt-4o-realtime-preview-2024-12-17",
    voice: "alloy",
    instructions: "",
    temperature: "0.8",
    microphoneId: "",
    startWithMicDisabled: false,
  });

  // State for session-specific parameters
  const [sessionState, setSessionState] = useState({
    status: "idle",
    muted: false,
  });

  // State for available microphones
  const [microphones, setMicrophones] = useState([]);
  // Loading state for microphone fetching
  const [isMicLoading, setIsMicLoading] = useState(true);
  // Loading states for session initiation and prompt generation
  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  // Chat messages state
  const [chatMessages, setChatMessages] = useState([]);

  // Refs for managing session and audio elements
  const sessionEndedRef = useRef(false);
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioElementRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const localStreamRef = useRef(null);
  const micStoppedRef = useRef(false);
  const mergerRef = useRef(null); // Stores the merger node for audio sources

  // Fetch the list of available microphones
  const handleFetchMicrophones = useCallback(() => {
    fetchMicrophones({ setIsMicLoading, setMicrophones, setError, config, setConfig });
  }, [config, setConfig]);

  // Update the analyser source by merging microphone and incoming audio
  const handleUpdateAnalyserSource = useCallback(() => {
    updateAnalyserSource({
      audioContext: audioContextRef.current,
      localStream: localStreamRef.current,
      audioElement: audioElementRef.current,
      analyser: analyserRef.current,
      mergerRef,
    });
  }, []);

  // Reconnect the audio track using the selected microphone
  const handleReconnectAudio = useCallback(async () => {
    return await reconnectAudio({
      peerConnection,
      config,
      sessionState,
      setConfig,
      fetchMicrophonesFunc: handleFetchMicrophones,
      microphones,
      updateAnalyserSourceFunc: handleUpdateAnalyserSource,
      localStreamRef,
    });
  }, [config, sessionState, setConfig, handleFetchMicrophones, microphones, handleUpdateAnalyserSource]);

  // Fetch microphones on component mount
  useEffect(() => {
    handleFetchMicrophones();
  }, [handleFetchMicrophones]);

  // Handle device changes (e.g. headset disconnection)
  useEffect(() => {
    const handleDeviceChange = async () => {
      await handleFetchMicrophones();
      const currentExists = microphones.some((mic) => mic.deviceId === config.microphoneId);
      if (!currentExists && sessionState.status === "active" && microphones.length > 0) {
        setConfig((prev) => ({ ...prev, microphoneId: microphones[0].deviceId }));
        await handleReconnectAudio();
      }
    };
    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
  }, [handleFetchMicrophones, microphones, config.microphoneId, sessionState.status, handleReconnectAudio]);

  // Terminate the session and clean up all connections and streams
  const handleTerminateSession = useCallback(async () => {
    await terminateSession({
      sessionEndedRef,
      peerConnection,
      dataChannel,
      audioContextRef,
      audioElementRef,
      localStreamRef,
      setSessionState,
      setView,
      setConnectionState,
      fetchEnd: fetch,
    });
  }, [setSessionState, setView, setConnectionState]);

  // Start the session with proper loading states and connection setup
  const handleStartSession = useCallback(async () => {
    if (loadingSession || loadingPrompt) return;
    setLoadingSession(true);
    try {
      await startSession({
        config,
        setError,
        setConnectionState,
        setSessionState,
        setView,
        sessionEndedRef,
        peerConnection,
        dataChannel,
        audioElementRef,
        audioContextRef,
        analyserRef,
        localStreamRef,
        fetch, // Global fetch
        updateAnalyserSourceFunc: handleUpdateAnalyserSource,
        setChatMessages,
      });
    } catch (err) {
      setError(err.message);
      await handleTerminateSession();
    } finally {
      setLoadingSession(false);
    }
  }, [config, loadingSession, loadingPrompt, handleUpdateAnalyserSource, setChatMessages, handleTerminateSession]);

  // Handle document visibility changes to manage microphone stream
  const handleVisibilityChangeWrapper = useCallback(() => {
    handleVisibilityChange({
      localStreamRef,
      micStoppedRef,
      reconnectAudioFunc: handleReconnectAudio,
    });
  }, [handleReconnectAudio]);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChangeWrapper);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChangeWrapper);
    };
  }, [handleVisibilityChangeWrapper]);

  // Update connection state based on the peer connection's state changes
  useEffect(() => {
    const pc = peerConnection.current;
    if (!pc) return;
    const updateState = () => setConnectionState(pc.connectionState);
    pc.addEventListener("connectionstatechange", updateState);
    return () => pc.removeEventListener("connectionstatechange", updateState);
  }, []);

  // Toggle mute state for the local microphone
  const handleToggleMute = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setSessionState((prev) => ({ ...prev, muted: !prev.muted }));
    }
  }, []);

  // Global cleanup on page unload
  useEffect(() => {
    const cleanupHandler = () => {
      if (sessionState.status !== "idle") {
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (peerConnection.current) {
          peerConnection.current.close();
        }
        navigator.sendBeacon("/end");
      }
    };
    window.addEventListener("beforeunload", cleanupHandler);
    return () => window.removeEventListener("beforeunload", cleanupHandler);
  }, [sessionState.status]);

  // Handle prompt creation and update configuration with the generated instruction
  const handleCreatePrompt = async () => {
    if (loadingSession || loadingPrompt) return;
    setLoadingPrompt(true);
    try {
      const response = await fetch("/prompt");
      const data = await response.json();
      setConfig((prev) => ({ ...prev, instructions: data.instruction }));
      // Add the generated instruction to chat messages as an AI message
      setChatMessages((prev) => [...prev, { sender: "ai", text: data.instruction }]);
    } catch (err) {
      console.error("Error fetching prompt:", err);
    } finally {
      setLoadingPrompt(false);
    }
  };

  // Handle microphone change from the session settings modal
  const handleMicrophoneChange = async (newMicId) => {
    setConfig((prev) => ({ ...prev, microphoneId: newMicId }));
  };

  return (
    <div className="app-container min-h-screen bg-gradient-to-r from-[#ffc3a0] to-[#ffafbd] relative">
      {error && (
        <div className="api-error fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50">
          {error}
          <button onClick={() => setError("")} className="ml-4 text-white font-bold">
            ×
          </button>
        </div>
      )}

      {view === "menu" && (
        <ModelSelection onSelectRealTime={() => setView("configuration")} />
      )}

      {view === "configuration" && (
        <RealTimeConfiguration
          config={config}
          setConfig={setConfig}
          onCreatePrompt={handleCreatePrompt}
          onModelCreate={handleStartSession}
          isMicLoading={isMicLoading}
          microphones={microphones}
          loadingSession={loadingSession}
          loadingPrompt={loadingPrompt}
        />
      )}

      {view === "session" && (
        <RealTimeSession
          sessionState={sessionState}
          toggleMute={handleToggleMute}
          terminateSession={handleTerminateSession}
          audioContext={audioContextRef.current}
          analyser={analyserRef.current}
          microphones={microphones}
          onMicrophoneChange={handleMicrophoneChange}
          chatMessages={chatMessages}
        />
      )}

      {view === "configuration" && (
        <button
          onClick={() => setView("menu")}
          className="fixed top-4 left-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
          title="Back to menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}
    </div>
  );
}
