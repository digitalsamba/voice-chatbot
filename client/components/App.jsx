import { useState, useRef, useEffect } from "react";
import ModelSelection from "./ModelSelection";
import RealTimeConfiguration from "./RealTimeConfiguration";
import RealTimeSession from "./RealTimeSession";

export default function App() {
  // Состояние текущего представления: 'menu' | 'configuration' | 'session'
  const [view, setView] = useState("menu");

  // Состояние для отображения ошибок API (например, лимит сессий)
  const [apiError, setApiError] = useState("");

  // Конфигурация Real-Time модели
  const [config, setConfig] = useState({
    voice: "alloy",
    instructions: "",
    microphoneId: "",
    startWithMicDisabled: false, // Флаг для старта с отключённым микрофоном
    // Обратите внимание: config.model используется в startSession, но не задаётся здесь.
  });

  // Состояние сессии (например, статус работы и mute)
  const [sessionState, setSessionState] = useState({
    status: "idle", // Возможные значения: "idle", "listening", и т.д.
    muted: false,
  });

  // Ссылки для хранения объектов соединения и аудиоэлемента
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioElement = useRef(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Функция старта сессии с установлением WebRTC‑соединения и передачей параметров
  async function startSession() {
    console.log("Starting Real-Time session with configuration:", config);
    try {
      // Отправляем на сервер актуальные параметры для создания сессии
      const tokenResponse = await fetch("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: config.voice,
          instructions: config.instructions,
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log("Token data:", tokenData);

      // Если сервер вернул ошибку, выбрасываем исключение
      if (tokenData.error) {
        throw new Error("Error creating session: " + JSON.stringify(tokenData.error));
      }
      if (!tokenData.client_secret) {
        throw new Error("client_secret missing in response: " + JSON.stringify(tokenData));
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;

      // Создаём новый RTCPeerConnection
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // Создаём аудиоэлемент для воспроизведения удалённого аудио
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          audioElement.current.srcObject = event.streams[0];
        }
      };

      // Запрашиваем аудиопоток с выбранного микрофона
      const constraints = {
        audio: config.microphoneId
          ? { deviceId: { exact: config.microphoneId } }
          : true,
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Если пользователь выбрал старт с отключённым микрофоном,
      // отключаем аудиотреки и обновляем состояние сессии
      if (config.startWithMicDisabled) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        setSessionState((prev) => ({ ...prev, muted: true }));
      }

      localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      // Создаём data channel для обмена событиями (если потребуется)
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      dc.onopen = () => {
        console.log("Data channel is open");
      };
      dc.onmessage = (e) => {
        console.log("Data channel message:", e.data);
      };

      // Создаём SDP‑предложение
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

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
      const answer = {
        type: "answer",
        sdp: answerSdp,
      };
      await pc.setRemoteDescription(answer);

      // Создаём аудиоконтекст если его нет
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }

      // Создаём анализатор
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      // Подключаем оба аудиопотока к анализатору
      const mergeAudio = async () => {
        const dest = audioContextRef.current.createMediaStreamDestination();

        // Микрофон пользователя
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const userSource = audioContextRef.current.createMediaStreamSource(userStream);
        userSource.connect(dest);

        // Аудио от ИИ
        const aiSource = audioContextRef.current.createMediaElementSource(audioElement.current);
        aiSource.connect(dest);

        dest.stream.getTracks().forEach(track => {
          const source = audioContextRef.current.createMediaStreamSource(new MediaStream([track]));
          source.connect(analyserRef.current);
        });
      };

      await mergeAudio();

      // Обновляем состояние сессии и переключаем представление
      // (Оставляем статус для обратной совместимости, но он не используется для анимации круга)
      setSessionState((prev) => ({ ...prev, status: "listening..." }));
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
      setApiError(err.message);
    }
  }

  // Функция завершения сессии – закрывает data channel и соединение
  async function terminateSession() {
    console.log("Terminating session");
    try {
      await fetch('/end', { method: 'POST' });
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (dataChannel.current) {
        dataChannel.current.close();
        dataChannel.current = null;
      }
      if (audioContextRef.current) {
        await audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current = null;
      }
    } catch (err) {
      console.error('Error ending session:', err);
    }
    setSessionState({ status: "idle", muted: false });
    setView("menu");
  }

  // Функция переключения mute – отключает/включает аудиотреки
  function toggleMute() {
    if (peerConnection.current) {
      const senders = peerConnection.current.getSenders();
      senders.forEach((sender) => {
        if (sender.track && sender.track.kind === "audio") {
          sender.track.enabled = !sender.track.enabled;
        }
      });
    }
    setSessionState((prev) => ({ ...prev, muted: !prev.muted }));
    console.log(sessionState.muted ? "Microphone unmuted" : "Microphone muted");
  }

  return (
    <div className="app-container min-h-screen bg-gradient-to-r from-[#ffc3a0] to-[#ffafbd]">
      {/* Уведомление об ошибке, например, превышен лимит сессий */}
      {apiError && (
        <div className="api-error fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50">
          {apiError}
          <button onClick={() => setApiError("")} className="ml-4 text-white font-bold">
            X
          </button>
        </div>
      )}

      {useEffect(() => {
        if (apiError) {
          const timer = setTimeout(() => setApiError(""), 5000);
          return () => clearTimeout(timer);
        }
      }, [apiError])}

      {view === "menu" && (
        <ModelSelection onSelectRealTime={() => setView("configuration")} />
      )}
      {view === "configuration" && (
        <RealTimeConfiguration
          config={config}
          setConfig={setConfig}
          onCreatePrompt={async () => {
            try {
              const response = await fetch("/prompt");
              const data = await response.json();
              setConfig((prev) => ({ ...prev, instructions: data.instruction }));
              console.log("Received prompt:", data.instruction);
            } catch (err) {
              console.error("Failed to fetch prompt:", err);
            }
          }}
          onModelCreate={startSession}
        />
      )}
      {view === "session" && (
        <RealTimeSession
          sessionState={sessionState}
          toggleMute={toggleMute}
          terminateSession={terminateSession}
          audioContext={audioContextRef.current}
          analyser={analyserRef.current}
        />
      )}
      {view === "configuration" && (
        <button
          onClick={() => setView("menu")}
          className="fixed top-4 left-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full"
          title="Back to main"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      )}
    </div>
  );
}
