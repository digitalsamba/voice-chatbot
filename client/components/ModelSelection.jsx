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
    <div className="menu-container flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Select Model
        </h1>
        <div className="menu-options flex flex-col sm:flex-row gap-4 relative">
          {/* Other Models Button */}
          <div className="relative flex-1">
            <button
              className="menu-button w-full px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
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
            {/* Info icon и tooltip остаются без изменений */}
          </div>

          {/* Real-Time Button */}
          <div className="relative flex-1">
            <button
              className="menu-button w-full px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200"
              onClick={onSelectRealTime}
            >
              Real-Time
            </button>
            <div
              className="absolute -top-0.5 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center cursor-help hover:bg-gray-400 transition-colors"
              onMouseEnter={() => setHoveredModel('realtime')}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <span className="text-gray-600 text-xs">i</span>
            </div>
          </div>
        </div>
        {/* Tooltip container */}
        {hoveredModel && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2">
            {tooltips[hoveredModel]}
          </div>
        )}
      </div>
    </div>
  );
}