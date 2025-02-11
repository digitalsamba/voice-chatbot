import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef, lazy, createContext, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server.mjs";
function ModelSelection({ onSelectRealTime }) {
  const [hoveredModel, setHoveredModel] = useState(null);
  const tooltips = {
    other: /* @__PURE__ */ jsxs("div", { className: "max-w-xs p-2 bg-white border rounded shadow-lg", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold mb-1", children: "Regular Model" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Provides consistent responses with no delay, ideal for structured conversations." })
    ] }),
    realtime: /* @__PURE__ */ jsxs("div", { className: "max-w-xs p-2 bg-white border rounded shadow-lg", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-bold mb-1", children: "Real-Time Model" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Responds instantly, adapting tone and speed as you speak, perfect for dynamic, conversational interactions." })
    ] })
  };
  return /* @__PURE__ */ jsxs("div", { className: "menu-container flex flex-col items-center justify-center h-screen bg-gray-100", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-8", children: "Select Model" }),
    /* @__PURE__ */ jsxs("div", { className: "menu-options flex gap-4 relative", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "menu-button px-6 py-3 bg-gray-400 text-white rounded cursor-not-allowed",
            disabled: true,
            children: "Other Models"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute -top-0.5 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors",
            onMouseEnter: () => setHoveredModel("other"),
            onMouseLeave: () => setHoveredModel(null),
            children: /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "i" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "menu-button px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500",
            onClick: onSelectRealTime,
            children: "Real-Time Model"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute -top-0.5 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors",
            onMouseEnter: () => setHoveredModel("realtime"),
            onMouseLeave: () => setHoveredModel(null),
            children: /* @__PURE__ */ jsx("span", { className: "text-gray-600 text-xs", children: "i" })
          }
        )
      ] }),
      hoveredModel && /* @__PURE__ */ jsx("div", { className: "absolute bottom-full left-1/2 -translate-x-1/2 mb-2", children: tooltips[hoveredModel] })
    ] })
  ] });
}
function RealTimeConfiguration({
  config,
  setConfig,
  onCreatePrompt,
  onModelCreate
}) {
  const [microphones, setMicrophones] = useState([]);
  useEffect(() => {
    async function getMicrophones() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const mics = devices.filter((device) => device.kind === "audioinput");
        setMicrophones(mics);
        if (mics.length > 0 && !config.microphoneId) {
          setConfig((prev) => ({ ...prev, microphoneId: mics[0].deviceId }));
        }
      } catch (err) {
        console.error("Error accessing microphone devices:", err);
      }
    }
    getMicrophones();
  }, [setConfig, config.microphoneId]);
  const voiceOptions = [
    { value: "alloy", label: "Alloy" },
    { value: "ash", label: "Ash" },
    { value: "ballad", label: "Ballad" },
    { value: "coral", label: "Coral" },
    { value: "echo", label: "Echo" },
    { value: "sage", label: "Sage" },
    { value: "shimmer", label: "Shimmer" },
    { value: "verse", label: "Verse" }
  ];
  return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen p-4", children: /* @__PURE__ */ jsxs("div", { className: "configuration-container max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold mb-4", children: "Real-Time Model Configuration" }),
    /* @__PURE__ */ jsxs("div", { className: "config-item mb-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "voiceSelect", className: "block mb-1 font-medium", children: "Select Voice:" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          id: "voiceSelect",
          className: "w-full border rounded p-2",
          value: config.voice,
          onChange: (e) => {
            console.log("Selected voice:", e.target.value);
            setConfig((prev) => ({ ...prev, voice: e.target.value }));
          },
          children: voiceOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "config-item mb-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "instructionInput", className: "block mb-1 font-medium", children: "Instruction:" }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "instructionInput",
          className: "w-full border rounded p-2",
          value: config.instructions,
          onChange: (e) => {
            const newInstructions = e.target.value.slice(0, 1e3);
            setConfig((prev) => ({ ...prev, instructions: newInstructions }));
          },
          placeholder: "e.g. Speak like a kind young programmer with extensive experience."
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "config-item mb-4", children: /* @__PURE__ */ jsx(
      "button",
      {
        className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500",
        onClick: onCreatePrompt,
        children: "Create Prompt"
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "config-item mb-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "micSelect", className: "block mb-1 font-medium", children: "Select Microphone:" }),
      /* @__PURE__ */ jsx(
        "select",
        {
          id: "micSelect",
          className: "w-full border rounded p-2",
          value: config.microphoneId,
          onChange: (e) => setConfig((prev) => ({ ...prev, microphoneId: e.target.value })),
          children: microphones.map((mic) => /* @__PURE__ */ jsx("option", { value: mic.deviceId, children: mic.label || "Microphone" }, mic.deviceId))
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "config-item mb-4 flex items-center", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "micToggle",
          type: "checkbox",
          checked: config.startWithMicDisabled,
          onChange: (e) => setConfig((prev) => ({
            ...prev,
            startWithMicDisabled: e.target.checked
          })),
          className: "mr-2"
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "micToggle", className: "font-medium", children: "Start dialogue with microphone disabled" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "config-item", children: /* @__PURE__ */ jsx(
      "button",
      {
        className: "w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500",
        onClick: onModelCreate,
        children: "Create Model"
      }
    ) })
  ] }) });
}
const CircleAnimation = ({ audioContext, analyser, isMuted, aiState }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  const isMounted = useRef(true);
  const circles = useRef([]);
  const gradients = useRef([]);
  const aiStateRef = useRef(aiState);
  const isMutedRef = useRef(isMuted);
  const baseRadius = useRef(0);
  const smoothMultiplier = useRef(1);
  useEffect(() => {
    aiStateRef.current = aiState;
    isMutedRef.current = isMuted;
  }, [aiState, isMuted]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    isMounted.current = true;
    const dpr = window.devicePixelRatio || 1;
    const size = 400;
    const w = size * dpr;
    const h = size * dpr;
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const pi = Math.PI;
    const points = 12;
    baseRadius.current = 140 * dpr;
    const center = { x: w / 2, y: h / 2 };
    const lerp = (a, b, t) => a * (1 - t) + b * t;
    const random = (min, max) => Math.random() * (max - min) + min;
    const cycle = (num, max) => (num % max + max) % max;
    const createGradients = () => {
      gradients.current = [
        ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, baseRadius.current),
        ctx.createLinearGradient(0, 0, w, 0),
        ctx.createLinearGradient(0, 0, w, 0),
        ctx.createLinearGradient(0, 0, w, 0)
      ];
      gradients.current[0].addColorStop(0, "rgba(255,255,255,0.9)");
      gradients.current[0].addColorStop(1, "rgba(255,255,255,0.4)");
      gradients.current[1].addColorStop(0, "#70d7ff");
      gradients.current[1].addColorStop(1, "#a8d8ff");
      gradients.current[2].addColorStop(0, "#d8a8ff");
      gradients.current[2].addColorStop(1, "#e0c3fc");
      gradients.current[3].addColorStop(0, "#ff9be3");
      gradients.current[3].addColorStop(1, "#ffb3e6");
    };
    const initCircles = () => {
      circles.current = [];
      for (let idx = 0; idx < 3; idx++) {
        const swingpoints = [];
        for (let i = 0; i < points; i++) {
          const radian = pi * 2 / points * i;
          swingpoints.push({
            x: center.x + baseRadius.current * Math.cos(radian),
            y: center.y + baseRadius.current * Math.sin(radian),
            radian,
            range: random(18, 25),
            phase: random(0, pi * 2),
            baseRadius: baseRadius.current
          });
        }
        circles.current.push(swingpoints);
      }
    };
    const drawCurve = (pts, fillStyle) => {
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(
        (pts[cycle(-1, points)].x + pts[0].x) / 2,
        (pts[cycle(-1, points)].y + pts[0].y) / 2
      );
      for (let i = 0; i < pts.length; i++) {
        ctx.quadraticCurveTo(
          pts[i].x,
          pts[i].y,
          (pts[i].x + pts[cycle(i + 1, points)].x) / 2,
          (pts[i].y + pts[cycle(i + 1, points)].y) / 2
        );
      }
      ctx.closePath();
      ctx.fill();
    };
    const updateAudioLevel = () => {
      if (!analyser || !isMounted.current) return 0;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const sum = dataArray.reduce((a, b) => a + b, 0);
      return Math.min(sum / dataArray.length / 255, 0.5);
    };
    const animate = () => {
      if (!isMounted.current) return;
      const rawAudioLevel = updateAudioLevel();
      const smoothAudioLevel = lerp(0.1, rawAudioLevel, 1);
      const targetMultiplier = aiStateRef.current === "thinking" ? 0.95 : aiStateRef.current === "speaking" ? 1.15 : 1;
      smoothMultiplier.current = lerp(
        smoothMultiplier.current,
        targetMultiplier,
        0.15
      );
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "screen";
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(center.x, center.y, baseRadius.current * 0.6, 0, 2 * Math.PI);
      ctx.fillStyle = gradients.current[0];
      ctx.fill();
      circles.current.forEach((swingpoints, k) => {
        const gradientIndex = k + 1;
        if (!gradients.current[gradientIndex]) return;
        swingpoints.forEach((point) => {
          const audioEffect = 1 + smoothAudioLevel * 1.5;
          point.phase += random(-0.05, 0.05) * smoothMultiplier.current * audioEffect;
          let dynamicRadius = baseRadius.current * smoothMultiplier.current;
          if (!isMutedRef.current) {
            dynamicRadius += Math.min(
              smoothAudioLevel * 100 * dpr,
              50 * dpr
            );
          }
          const amplitude = point.range * Math.sin(point.phase * audioEffect);
          const targetX = center.x + (dynamicRadius + amplitude) * Math.cos(point.radian);
          const targetY = center.y + (dynamicRadius + amplitude) * Math.sin(point.radian);
          point.x = lerp(point.x, targetX, 0.2);
          point.y = lerp(point.y, targetY, 0.2);
          point.radian += pi / 320 * (1 / smoothMultiplier.current);
        });
        ctx.shadowColor = "#70d7ff55";
        ctx.shadowBlur = 20 * dpr;
        drawCurve(swingpoints, gradients.current[gradientIndex]);
        ctx.shadowBlur = 0;
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };
    createGradients();
    initCircles();
    animate();
    return () => {
      isMounted.current = false;
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [analyser]);
  return /* @__PURE__ */ jsx(
    "canvas",
    {
      ref: canvasRef,
      className: "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0",
      style: { imageRendering: "crisp-edges" }
    }
  );
};
function RealTimeSession({
  sessionState,
  toggleMute,
  terminateSession,
  audioContext,
  analyser
}) {
  const [timeLeft, setTimeLeft] = useState(300);
  const [aiState, setAiState] = useState("listening");
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1e3);
    const aiInterval = setInterval(() => {
      setAiState((prev) => {
        const states = ["listening", "thinking", "speaking"];
        return states[(states.indexOf(prev) + 1) % states.length];
      });
    }, 5e3);
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
  const formattedTime = `${Math.floor(timeLeft / 60).toString().padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`;
  return /* @__PURE__ */ jsxs("div", { className: "session-container relative flex flex-col items-center justify-center h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsx("div", { className: "absolute top-4 right-4 bg-white px-4 py-2 rounded shadow z-10", children: /* @__PURE__ */ jsx("span", { className: "font-mono", children: formattedTime }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-16", children: /* @__PURE__ */ jsx(
      CircleAnimation,
      {
        audioContext,
        analyser,
        isMuted: sessionState.muted,
        aiState
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { className: "absolute bottom-24 flex gap-4 z-10", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors shadow-md flex items-center justify-center",
          onClick: toggleMute,
          children: /* @__PURE__ */ jsx("i", { className: "material-icons text-xl", children: sessionState.muted ? "mic_off" : "mic" })
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "p-3 bg-red-100 hover:bg-red-200 rounded-full transition-colors shadow-md flex items-center justify-center",
          onClick: terminateSession,
          children: /* @__PURE__ */ jsx("i", { className: "material-icons text-xl", children: "meeting_room" })
        }
      )
    ] })
  ] });
}
function App() {
  const [view, setView] = useState("menu");
  const [apiError, setApiError] = useState("");
  const [config, setConfig] = useState({
    voice: "alloy",
    instructions: "",
    microphoneId: "",
    startWithMicDisabled: false
    // Флаг для старта с отключённым микрофоном
    // Обратите внимание: config.model используется в startSession, но не задаётся здесь.
  });
  const [sessionState, setSessionState] = useState({
    status: "idle",
    // Возможные значения: "idle", "listening", и т.д.
    muted: false
  });
  const peerConnection = useRef(null);
  const dataChannel = useRef(null);
  const audioElement = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  async function startSession() {
    console.log("Starting Real-Time session with configuration:", config);
    try {
      const tokenResponse = await fetch("/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: config.voice,
          instructions: config.instructions
        })
      });
      const tokenData = await tokenResponse.json();
      console.log("Token data:", tokenData);
      if (tokenData.error) {
        throw new Error("Error creating session: " + JSON.stringify(tokenData.error));
      }
      if (!tokenData.client_secret) {
        throw new Error("client_secret missing in response: " + JSON.stringify(tokenData));
      }
      const EPHEMERAL_KEY = tokenData.client_secret.value;
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;
      audioElement.current = document.createElement("audio");
      audioElement.current.autoplay = true;
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          audioElement.current.srcObject = event.streams[0];
        }
      };
      const constraints = {
        audio: config.microphoneId ? { deviceId: { exact: config.microphoneId } } : true
      };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (config.startWithMicDisabled) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = false;
        });
        setSessionState((prev) => ({ ...prev, muted: true }));
      }
      localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });
      const dc = pc.createDataChannel("oai-events");
      dataChannel.current = dc;
      dc.onopen = () => {
        console.log("Data channel is open");
      };
      dc.onmessage = (e) => {
        console.log("Data channel message:", e.data);
      };
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const apiUrl = `https://api.openai.com/v1/realtime?model=${encodeURIComponent(config.model)}`;
      const sdpResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
        body: offer.sdp
      });
      const answerSdp = await sdpResponse.text();
      const answer = {
        type: "answer",
        sdp: answerSdp
      };
      await pc.setRemoteDescription(answer);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const mergeAudio = async () => {
        const dest = audioContextRef.current.createMediaStreamDestination();
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const userSource = audioContextRef.current.createMediaStreamSource(userStream);
        userSource.connect(dest);
        const aiSource = audioContextRef.current.createMediaElementSource(audioElement.current);
        aiSource.connect(dest);
        dest.stream.getTracks().forEach((track) => {
          const source = audioContextRef.current.createMediaStreamSource(new MediaStream([track]));
          source.connect(analyserRef.current);
        });
      };
      await mergeAudio();
      setSessionState((prev) => ({ ...prev, status: "listening..." }));
      setView("session");
    } catch (err) {
      console.error("Failed to start session:", err);
      setApiError(err.message);
    }
  }
  async function terminateSession() {
    console.log("Terminating session");
    try {
      await fetch("/end", { method: "POST" });
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
      console.error("Error ending session:", err);
    }
    setSessionState({ status: "idle", muted: false });
    setView("menu");
  }
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
  return /* @__PURE__ */ jsxs("div", { className: "app-container", children: [
    apiError && /* @__PURE__ */ jsxs("div", { className: "api-error fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded z-50", children: [
      apiError,
      /* @__PURE__ */ jsx("button", { onClick: () => setApiError(""), className: "ml-4 text-white font-bold", children: "X" })
    ] }),
    useEffect(() => {
      if (apiError) {
        const timer = setTimeout(() => setApiError(""), 5e3);
        return () => clearTimeout(timer);
      }
    }, [apiError]),
    view === "menu" && /* @__PURE__ */ jsx(ModelSelection, { onSelectRealTime: () => setView("configuration") }),
    view === "configuration" && /* @__PURE__ */ jsx(
      RealTimeConfiguration,
      {
        config,
        setConfig,
        onCreatePrompt: async () => {
          try {
            const response = await fetch("/prompt");
            const data = await response.json();
            setConfig((prev) => ({ ...prev, instructions: data.instruction }));
            console.log("Received prompt:", data.instruction);
          } catch (err) {
            console.error("Failed to fetch prompt:", err);
          }
        },
        onModelCreate: startSession
      }
    ),
    view === "session" && /* @__PURE__ */ jsx(
      RealTimeSession,
      {
        sessionState,
        toggleMute,
        terminateSession,
        audioContext: audioContextRef.current,
        analyser: analyserRef.current
      }
    ),
    view === "configuration" && /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setView("menu"),
        className: "fixed top-4 left-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full",
        title: "Back to main",
        children: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) })
      }
    )
  ] });
}
function Index() {
  return /* @__PURE__ */ jsx(App, {});
}
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Index
}, Symbol.toStringTag, { value: "Module" }));
const routes = createRoutes(/* @__PURE__ */ Object.assign({ "/pages/index.jsx": __vite_glob_0_0 }));
async function createRoutes(from, { param } = { param: /\[(\w+)\]/ }) {
  class Routes2 extends Array {
    toJSON() {
      return this.map((route) => {
        return {
          id: route.id,
          path: route.path,
          layout: route.layout,
          getData: !!route.getData,
          getMeta: !!route.getMeta,
          onEnter: !!route.onEnter
        };
      });
    }
  }
  const importPaths = Object.keys(from);
  const promises = [];
  if (Array.isArray(from)) {
    for (const routeDef of from) {
      promises.push(
        getRouteModule(routeDef.path, routeDef.component).then(
          (routeModule) => {
            return {
              id: routeDef.path,
              path: routeDef.path ?? routeModule.path,
              ...routeModule
            };
          }
        )
      );
    }
  } else {
    for (const path of importPaths.sort((a, b) => a > b ? -1 : 1)) {
      promises.push(
        getRouteModule(path, from[path]).then((routeModule) => {
          return {
            id: path,
            layout: routeModule.layout,
            path: routeModule.path ?? path.slice(6, -4).replace(param, (_, m) => `:${m}`).replace(/\/index$/, "/").replace(/(.+)\/+$/, (...m) => m[1]),
            ...routeModule
          };
        })
      );
    }
  }
  return new Routes2(...await Promise.all(promises));
}
function getRouteModuleExports(routeModule) {
  return {
    // The Route component (default export)
    component: routeModule.default,
    // The Layout Route component
    layout: routeModule.layout,
    // Route-level hooks
    getData: routeModule.getData,
    getMeta: routeModule.getMeta,
    onEnter: routeModule.onEnter,
    // Other Route-level settings
    streaming: routeModule.streaming,
    clientOnly: routeModule.clientOnly,
    serverOnly: routeModule.serverOnly,
    ...routeModule
  };
}
async function getRouteModule(path, routeModuleInput) {
  let routeModule = routeModuleInput;
  if (typeof routeModule === "function") {
    routeModule = await routeModule();
    return getRouteModuleExports(routeModule);
  }
  return getRouteModuleExports(routeModule);
}
const DefaultLayout = () => import("./assets/default-Dr2757P8.js");
const appLayouts = /* @__PURE__ */ Object.assign({});
if (!Object.keys(appLayouts).some(
  (path) => path.match(/\/layouts\/default\.(j|t)sx/)
)) {
  appLayouts["/layouts/default.jsx"] = DefaultLayout;
}
const layouts = Object.fromEntries(
  Object.keys(appLayouts).map((path) => {
    const name = path.slice(9, -4);
    return [name, lazy(appLayouts[path])];
  })
);
const Router = StaticRouter;
const RouteContext = createContext({});
function AppRoute({ head, ctxHydration, ctx, children }) {
  {
    const Layout2 = layouts[ctxHydration.layout ?? "default"];
    return /* @__PURE__ */ jsx(
      RouteContext.Provider,
      {
        value: {
          ...ctx,
          ...ctxHydration,
          state: ctxHydration.state ?? {}
        },
        children: /* @__PURE__ */ jsx(Layout2, { children })
      }
    );
  }
}
function Root({ url, routes: routes2, head, ctxHydration, routeMap }) {
  return /* @__PURE__ */ jsx(Suspense, { children: /* @__PURE__ */ jsx(Router, { location: url, children: /* @__PURE__ */ jsx(Routes, { children: routes2.map(({ path, component: Component }) => /* @__PURE__ */ jsx(
    Route,
    {
      path,
      element: /* @__PURE__ */ jsx(
        AppRoute,
        {
          head,
          ctxHydration,
          ctx: routeMap[path],
          children: /* @__PURE__ */ jsx(Component, {})
        }
      )
    },
    path
  )) }) }) });
}
function create({ url, ...serverInit }) {
  return /* @__PURE__ */ jsx(Root, { url, ...serverInit });
}
const index = {
  context: import("./assets/_context-CFXBAM5k.js"),
  routes,
  create
};
export {
  index as default
};
