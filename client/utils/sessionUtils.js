/**
 * sessionUtils.js
 *
 * This module contains utility functions for managing the session,
 * audio processing and microphone handling.
 * All functions include detailed comments in British English.
 */

/**
 * Fetches the list of available microphones.
 * Checks for MediaDevices API support, requests temporary microphone access,
 * stops the stream, and then sets the available audio input devices.
 */
export async function fetchMicrophones({ setIsMicLoading, setMicrophones, setError, config, setConfig }) {
  // Check if the MediaDevices API is supported
  if (!navigator.mediaDevices?.enumerateDevices) {
    console.warn("MediaDevices API is not supported");
    setIsMicLoading(false);
    return;
  }
  try {
    // Request temporary access to the microphone and immediately stop the stream
    const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    tempStream.getTracks().forEach((track) => track.stop());

    // Enumerate available media devices and filter for audio inputs (microphones)
    const devices = await navigator.mediaDevices.enumerateDevices();
    const mics = devices.filter((device) => device.kind === "audioinput");
    setMicrophones(mics);

    // If the selected microphone is not available, choose the default microphone
    if (mics.length > 0 && !mics.some((mic) => mic.deviceId === config.microphoneId)) {
      setConfig((prev) => ({ ...prev, microphoneId: mics[0].deviceId }));
    }
  } catch (err) {
    console.error("Error accessing microphone:", err);
    setError("Failed to access the microphone");
  } finally {
    setIsMicLoading(false);
  }
}

/**
 * Updates the analyser node source by merging the microphone audio and incoming audio.
 *
 * @param {Object} params - Parameters including audioContext, localStream, audioElement, analyser and mergerRef.
 */
export function updateAnalyserSource({ audioContext, localStream, audioElement, analyser, mergerRef }) {
  if (!audioContext || !localStream || !audioElement) return;

  // Disconnect any existing merger node to prevent duplicate connections
  if (mergerRef.current) {
    try {
      mergerRef.current.disconnect();
    } catch (e) {
      console.warn("Error disconnecting previous merger:", e);
    }
  }

  // Create a media source from the local microphone stream
  const micSource = audioContext.createMediaStreamSource(localStream);
  // Create a media source from the audio element (incoming audio)
  const aiSource = audioContext.createMediaElementSource(audioElement);
  // Create a channel merger to combine two audio sources into one analyser
  const merger = audioContext.createChannelMerger(2);

  // Connect the microphone and incoming audio sources to the merger node
  micSource.connect(merger, 0, 0);
  aiSource.connect(merger, 0, 1);
  // Connect the merger node to the analyser node
  merger.connect(analyser);

  // Store the merger node reference for future disconnections
  mergerRef.current = merger;
}

/**
 * Reconnects the audio track using the selected or default microphone.
 *
 * @param {Object} params - Parameters including peerConnection, config, sessionState, setConfig, fetchMicrophonesFunc, microphones,
 *                            updateAnalyserSourceFunc and localStreamRef.
 * @returns {boolean} - Returns true if reconnection is successful, false otherwise.
 */
export async function reconnectAudio({
                                       peerConnection,
                                       config,
                                       sessionState,
                                       setConfig,
                                       fetchMicrophonesFunc,
                                       microphones,
                                       updateAnalyserSourceFunc,
                                       localStreamRef,
                                     }) {
  if (!peerConnection.current) return false;
  try {
    // Define constraints for getUserMedia based on the selected microphone
    const constraints = config.microphoneId
      ? { audio: { deviceId: { exact: config.microphoneId } } }
      : { audio: true };
    // Request a new audio stream with the specified constraints
    const newStream = await navigator.mediaDevices.getUserMedia(constraints);
    const newAudioTrack = newStream.getAudioTracks()[0];
    // Set the audio track enabled state based on the current session mute status
    newAudioTrack.enabled = !sessionState.muted;

    // Replace the current audio track with the new one in the peer connection
    const sender = peerConnection.current.getSenders().find((s) => s.track?.kind === "audio");
    if (sender) {
      await sender.replaceTrack(newAudioTrack);
    }

    // Stop all tracks in the existing local stream before replacing it
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    localStreamRef.current = newStream;

    // Update the analyser source with the new audio stream
    updateAnalyserSourceFunc();

    // Handle device disconnection by listening to the end event of the new audio track
    newAudioTrack.onended = async () => {
      console.warn("Selected microphone disconnected, switching to default");
      await fetchMicrophonesFunc();
      if (microphones.length > 0) {
        setConfig((prev) => ({ ...prev, microphoneId: microphones[0].deviceId }));
        await reconnectAudio({
          peerConnection,
          config,
          sessionState,
          setConfig,
          fetchMicrophonesFunc,
          microphones,
          updateAnalyserSourceFunc,
          localStreamRef,
        });
      }
    };

    return true;
  } catch (error) {
    console.error("Error reconnecting audio:", error);
    return false;
  }
}

/**
 * Terminates the ongoing session by closing connections, stopping streams, and resetting state.
 *
 * @param {Object} params - Parameters including sessionEndedRef, peerConnection, dataChannel, audioContextRef,
 *                            audioElementRef, localStreamRef, setSessionState, setView, setConnectionState and fetchEnd.
 */
export async function terminateSession({
                                         sessionEndedRef,
                                         peerConnection,
                                         dataChannel,
                                         audioContextRef,
                                         audioElementRef,
                                         localStreamRef,
                                         setSessionState,
                                         setView,
                                         setConnectionState,
                                         fetchEnd, // This can be the global fetch function or a custom one
                                       }) {
  if (sessionEndedRef.current) return;
  try {
    // Close peer connection if it exists
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    // Close data channel if it exists
    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }
    // Close the audio context if it exists
    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
    // Pause and remove the audio element
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    // Stop all tracks in the local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    // Send termination signal to the server
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/end");
    } else {
      await fetchEnd("/end", { method: "POST" });
    }
  } catch (err) {
    console.error("Error terminating session:", err);
  } finally {
    // Reset session state and view
    sessionEndedRef.current = true;
    setSessionState({ status: "idle", muted: false });
    setView("menu");
    setConnectionState("disconnected");
  }
}

/**
 * Initiates the session by setting up connections, audio context, and data channels.
 *
 * @param {Object} params - Parameters including config, setError, setConnectionState, setSessionState, setView,
 *                            sessionEndedRef, peerConnection, dataChannel, audioElementRef, audioContextRef,
 *                            analyserRef, localStreamRef, fetch (for HTTP requests), updateAnalyserSourceFunc, setChatMessages.
 */
export async function startSession({
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
                                     fetch, // Global fetch function
                                     updateAnalyserSourceFunc,
                                     setChatMessages,
                                   }) {
  try {
    // Set initial connection state and clear previous errors
    setConnectionState("connecting");
    setError("");

    // Request token from the server with the provided configuration
    const tokenResponse = await fetch("/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.model,
        voice: config.voice,
        instructions: config.instructions,
        temperature: parseFloat(config.temperature),
      }),
    });
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error.message);
    if (!tokenData.client_secret) throw new Error("Missing client_secret");

    sessionEndedRef.current = false;
    const EPHEMERAL_KEY = tokenData.client_secret.value;

    // Create a new peer connection for the session
    const pc = new RTCPeerConnection();
    peerConnection.current = pc;

    // Create an audio element for playing incoming audio
    const audioEl = document.createElement("audio");
    audioEl.id = "audioPlayback"; // Identifier for audio control
    audioEl.crossOrigin = "anonymous";
    audioEl.autoplay = true;
    audioElementRef.current = audioEl;

    // Initialise AudioContext and analyser for audio processing
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;

    // Handle incoming audio track events
    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        audioEl.srcObject = event.streams[0];
        // If the analyser source for incoming audio has not been set, create it
        if (!audioContextRef.current._aiSource) {
          const aiSource = audioContextRef.current.createMediaStreamSource(event.streams[0]);
          aiSource.connect(analyserRef.current);
          audioContextRef.current._aiSource = aiSource;
        }
      }
    };

    // Acquire the local audio stream using the selected microphone
    const constraints = config.microphoneId
      ? { audio: { deviceId: { exact: config.microphoneId } } }
      : { audio: true };
    const localStream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = localStream;

    // If the session should start with the microphone muted, disable audio tracks
    if (config.startWithMicDisabled) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = false));
      setSessionState((prev) => ({ ...prev, muted: config.startWithMicDisabled }));
    }

    const audioTrack = localStream.getAudioTracks()[0];
    // Listen for the end event on the audio track to handle disconnection
    audioTrack.onended = async () => {
      console.warn("Microphone disconnected during session, switching to default");
      // Additional reconnection logic can be implemented here
    };

    // Add the local audio track to the peer connection
    pc.addTrack(audioTrack, localStream);

    // Create a data channel for receiving events from the server
    dataChannel.current = pc.createDataChannel("oai-events");
    dataChannel.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        // Handle incoming messages, for example AI transcript completion
        switch (data.type) {
          case "response.audio_transcript.done": {
            setChatMessages((prev) => [...prev, { sender: "AI", text: data.transcript }]);
            break;
          }
          default:
            break;
        }
      } catch (err) {
        console.error("Error processing event:", err);
      }
    };

    // Create an offer and set local SDP
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send the SDP offer to the server to initiate the session
    const apiUrl = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(config.model)}`;
    const sdpResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp",
      },
      body: offer.sdp,
    });
    const answerSdp = await sdpResponse.text();
    await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

    // Update the analyser source with the newly established audio stream
    updateAnalyserSourceFunc();

    // Update session state and UI view to indicate an active connection
    setSessionState({ status: "active", muted: config.startWithMicDisabled });
    setView("session");
    setConnectionState("connected");
  } catch (err) {
    console.error("Error starting session:", err);
    setError(err.message);
    // Terminate session if starting fails
    throw err;
  }
}

/**
 * Handles changes in document visibility to manage audio stream state.
 * Stops the audio tracks when the document is hidden and attempts reconnection when visible.
 *
 * @param {Object} params - Parameters including localStreamRef, micStoppedRef and reconnectAudioFunc.
 */
export function handleVisibilityChange({ localStreamRef, micStoppedRef, reconnectAudioFunc }) {
  if (document.hidden) {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      micStoppedRef.current = true;
    }
  } else {
    if (micStoppedRef.current && reconnectAudioFunc) {
      reconnectAudioFunc();
      micStoppedRef.current = false;
    }
  }
}
