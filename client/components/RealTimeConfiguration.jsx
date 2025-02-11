// client/components/RealTimeConfiguration.jsx
import React, { useEffect, useState } from "react";

export default function RealTimeConfiguration({
                                                config,
                                                setConfig,
                                                onCreatePrompt,
                                                onModelCreate,
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
    { value: "verse", label: "Verse" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
    <div className="configuration-container max-w-lg mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Real-Time Model Configuration</h2>

      <div className="config-item mb-4">
        <label htmlFor="voiceSelect" className="block mb-1 font-medium">
          Select Voice:
        </label>
        <select
          id="voiceSelect"
          className="w-full border rounded p-2"
          value={config.voice}
          onChange={(e) => {
            console.log("Selected voice:", e.target.value);
            setConfig((prev) => ({ ...prev, voice: e.target.value }));
          }}
        >
          {voiceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="config-item mb-4">
        <label htmlFor="instructionInput" className="block mb-1 font-medium">
          Instruction:
        </label>
        <textarea
          id="instructionInput"
          className="w-full border rounded p-2"
          value={config.instructions}
          onChange={(e) => {
            const newInstructions = e.target.value.slice(0, 1000);
            setConfig((prev) => ({ ...prev, instructions: newInstructions }));
          }}
          placeholder="e.g. Speak like a kind young programmer with extensive experience."
        />
      </div>

      <div className="config-item mb-4">
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          onClick={onCreatePrompt}
        >
          Create Prompt
        </button>
      </div>

      <div className="config-item mb-4">
        <label htmlFor="micSelect" className="block mb-1 font-medium">
          Select Microphone:
        </label>
        <select
          id="micSelect"
          className="w-full border rounded p-2"
          value={config.microphoneId}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, microphoneId: e.target.value }))
          }
        >
          {microphones.map((mic) => (
            <option key={mic.deviceId} value={mic.deviceId}>
              {mic.label || "Microphone"}
            </option>
          ))}
        </select>
      </div>

      <div className="config-item mb-4 flex items-center">
        <input
          id="micToggle"
          type="checkbox"
          checked={config.startWithMicDisabled}
          onChange={(e) =>
            setConfig((prev) => ({
              ...prev,
              startWithMicDisabled: e.target.checked,
            }))
          }
          className="mr-2"
        />
        <label htmlFor="micToggle" className="font-medium">
          Start dialogue with microphone disabled
        </label>
      </div>

      <div className="config-item">
        <button
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          onClick={onModelCreate}
        >
          Create Model
        </button>
      </div>
    </div>
    </div>
  );
}
