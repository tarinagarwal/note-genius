import React from 'react';
import {
  MinusCircle,
  PlusCircle,
  ZoomOut,
  ZoomIn,
  RotateCcw,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useBlackboardStore } from '../../store/blackboardStore';

interface PropertiesToolbarProps {
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  zoom: number;
  isAnalyzing: boolean;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  setWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setZoom: (zoom: number) => void;
  setColor: (color: string) => void;
  handleAIAnalysis: () => void;
  recentColors: string[];
}

const colors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
];

export const PropertiesToolbar: React.FC<PropertiesToolbarProps> = ({
  currentColor,
  currentWidth,
  currentOpacity,
  zoom,
  isAnalyzing,
  showColorPicker,
  setShowColorPicker,
  setWidth,
  setOpacity,
  setZoom,
  setColor,
  handleAIAnalysis,
  recentColors,
}) => {
  const { paths, setState } = useBlackboardStore();

  return (
    <div className="absolute bottom-4 left-4 flex gap-2 bg-white rounded-lg shadow-lg p-2">
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="p-2 rounded-lg hover:bg-gray-100"
          title="Change color"
        >
          <div
            className="w-5 h-5 rounded-full border border-gray-300"
            style={{ backgroundColor: currentColor }}
          />
        </button>
        {showColorPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg p-2">
            <div className="grid grid-cols-5 gap-1 mb-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setColor(color);
                    setShowColorPicker(false);
                  }}
                  className="w-6 h-6 rounded-full border border-gray-200"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {recentColors.length > 0 && (
              <>
                <div className="h-px bg-gray-200 my-1" />
                <div className="grid grid-cols-5 gap-1">
                  {recentColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setColor(color);
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded-full border border-gray-200"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 p-2">
        <button
          onClick={() => setWidth(Math.max(1, currentWidth - 1))}
          className="hover:text-blue-600"
          title="Decrease size"
        >
          <MinusCircle className="w-4 h-4" />
        </button>
        <span className="w-4 text-center text-sm">{currentWidth}</span>
        <button
          onClick={() => setWidth(Math.min(20, currentWidth + 1))}
          className="hover:text-blue-600"
          title="Increase size"
        >
          <PlusCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 p-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentOpacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
          className="w-20"
          title="Opacity"
        />
      </div>

      <div className="h-full w-px bg-gray-200 mx-1" />

      <button
        onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Zoom out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
      <span className="flex items-center text-sm">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={() => setZoom(Math.min(4, zoom + 0.25))}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Zoom in"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="h-full w-px bg-gray-200 mx-1" />

      <button
        onClick={() => {
          setState({ paths: paths.slice(0, -1) });
        }}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Undo"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
      <button
        onClick={() => setState({ paths: [], textElements: [], shapeElements: [] })}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Clear board"
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <button
        onClick={handleAIAnalysis}
        disabled={isAnalyzing}
        className={`p-2 rounded-lg text-gray-600 hover:bg-gray-100 ${
          isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="Analyze with AI"
      >
        <MessageSquare className={`w-4 h-4 ${isAnalyzing ? 'animate-pulse' : ''}`} />
      </button>
    </div>
  );
};