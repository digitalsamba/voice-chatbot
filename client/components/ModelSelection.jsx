// client/components/ModelSelection.jsx
import React, { useState } from "react";

export default function ModelSelection({ onSelectRealTime }) {
  const [hoveredModel, setHoveredModel] = useState(null);

  const tooltips = {
    other: (
      <div className="max-w-xs p-2 bg-white border rounded shadow-lg">
        <h3 className="font-bold mb-1">Regular Model</h3>
        <p className="text-sm">
          Provides consistent responses with no delay, ideal for structured conversations.
        </p>
      </div>
    ),
    realtime: (
      <div className="max-w-xs p-2 bg-white border rounded shadow-lg">
        <h3 className="font-bold mb-1">Real-Time Model</h3>
        <p className="text-sm">
          Responds instantly, adapting tone and speed as you speak, perfect for dynamic, conversational interactions.
        </p>
      </div>
    ),
  };

  return (
    <div className="menu-container flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-8">Select Model</h1>
      <div className="menu-options flex gap-4 relative">
        {/* Other Models Button */}
        <div className="relative">
          <button
            className="menu-button px-6 py-3 bg-gray-400 text-white rounded cursor-not-allowed"
            disabled
          >
            Other Models
          </button>
          <div
            className="absolute -top-0.5 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors"
            onMouseEnter={() => setHoveredModel('other')}
            onMouseLeave={() => setHoveredModel(null)}
          >
            <span className="text-gray-600 text-xs">i</span>
          </div>
        </div>

        {/* Real-Time Button */}
        <div className="relative">
          <button
            className="menu-button px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-500"
            onClick={onSelectRealTime}
          >
            Real-Time Model
          </button>
          <div
            className="absolute -top-0.5 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors"
            onMouseEnter={() => setHoveredModel('realtime')}
            onMouseLeave={() => setHoveredModel(null)}
          >
            <span className="text-gray-600 text-xs">i</span>
          </div>
        </div>
        {/* Tooltips */}
        {hoveredModel && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
            {tooltips[hoveredModel]}
          </div>
        )}
      </div>
    </div>
  );
}