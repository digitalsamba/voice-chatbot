/**
 * ModelSelection.js
 *
 * This component renders the model selection menu with tooltips for each model option.
 * All comments are in British English.
 */

import React, { useState } from "react";

export default function ModelSelection({ onSelectRealTime }) {
  const [hoveredModel, setHoveredModel] = useState(null);

  // Define tooltip content for different model options
  const tooltips = {
    other: (
      <div className="max-w-xs p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
        <h3 className="font-semibold mb-1 text-gray-800">Regular Model</h3>
        <p className="text-gray-600">
          Provides consistent responses with no delay, ideal for structured conversations.
        </p>
      </div>
    ),
    realtime: (
      <div className="max-w-xs p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-sm">
        <h3 className="font-semibold mb-1 text-gray-800">Real-Time Model</h3>
        <p className="text-gray-600">
          Responds instantly, adapting tone and speed as you speak, perfect for dynamic interactions.
        </p>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#ffc3a0] to-[#ffafbd] p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Select Model
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Other Models Button (disabled) */}
          <div className="relative flex-1 group">
            <button
              className="w-full px-4 py-3 text-sm sm:text-base
                bg-gray-50 text-gray-600 rounded-lg
                hover:bg-gray-100 transition-colors duration-200
                border border-gray-200 cursor-not-allowed"
              disabled
            >
              Other Models
            </button>
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-100
                rounded-full flex items-center justify-center cursor-help
                hover:bg-blue-200 transition-colors"
              onMouseEnter={() => setHoveredModel("other")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <span className="text-blue-600 text-xs font-medium">i</span>
            </div>
            {hoveredModel === "other" && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                {tooltips.other}
              </div>
            )}
          </div>

          {/* Real-Time Model Button */}
          <div className="relative flex-1 group">
            <button
              className="w-full px-4 py-3 text-sm sm:text-base
                bg-blue-600 text-white rounded-lg
                hover:bg-blue-500 transition-colors duration-200
                shadow-sm hover:shadow-md"
              onClick={onSelectRealTime}
            >
              Real-Time
            </button>
            <div
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-100
                rounded-full flex items-center justify-center cursor-help
                hover:bg-blue-200 transition-colors"
              onMouseEnter={() => setHoveredModel("realtime")}
              onMouseLeave={() => setHoveredModel(null)}
            >
              <span className="text-blue-600 text-xs font-medium">i</span>
            </div>
            {hoveredModel === "realtime" && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10">
                {tooltips.realtime}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
