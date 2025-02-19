import React from 'react';
import { Tool, Background } from '../../store/blackboardStore';
import { Pen, Highlighter, Eraser, Type, MousePointer, Square, Circle, Minus, Grid } from 'lucide-react';

interface ToolsToolbarProps {
  currentTool: Tool;
  background: Background;
  setTool: (tool: Tool) => void;
  setBackground: (background: Background) => void;
  showBackgroundPicker: boolean;
  setShowBackgroundPicker: (show: boolean) => void;
}

const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'pen', icon: <Pen className="w-5 h-5" />, label: 'Pen' },
  { id: 'highlighter', icon: <Highlighter className="w-5 h-5" />, label: 'Highlighter' },
  { id: 'eraser', icon: <Eraser className="w-5 h-5" />, label: 'Eraser' },
  { id: 'text', icon: <Type className="w-5 h-5" />, label: 'Text' },
  { id: 'select', icon: <MousePointer className="w-5 h-5" />, label: 'Select' },
  { id: 'rectangle', icon: <Square className="w-5 h-5" />, label: 'Rectangle' },
  { id: 'circle', icon: <Circle className="w-5 h-5" />, label: 'Circle' },
  { id: 'line', icon: <Minus className="w-5 h-5" />, label: 'Line' },
];

const backgrounds: { id: Background; icon: React.ReactNode; label: string }[] = [
  { id: 'blank', icon: <Square className="w-5 h-5" />, label: 'Blank' },
  { id: 'grid', icon: <Grid className="w-5 h-5" />, label: 'Grid' },
  { id: 'ruled', icon: <Minus className="w-5 h-5" />, label: 'Ruled' },
  { id: 'dotted', icon: <Circle className="w-5 h-5 scale-25" />, label: 'Dotted' },
];

export const ToolsToolbar: React.FC<ToolsToolbarProps> = ({
  currentTool,
  background,
  setTool,
  setBackground,
  showBackgroundPicker,
  setShowBackgroundPicker,
}) => {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-2">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setTool(tool.id)}
          className={`p-2 rounded-lg ${
            currentTool === tool.id
              ? 'bg-blue-100 text-blue-600'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={tool.label}
        >
          {tool.icon}
        </button>
      ))}
      <div className="h-px bg-gray-200 my-1" />
      <button
        onClick={() => setShowBackgroundPicker(!showBackgroundPicker)}
        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        title="Change background"
      >
        <Grid className="w-5 h-5" />
      </button>
      {showBackgroundPicker && (
        <div className="absolute left-full ml-2 bg-white rounded-lg shadow-lg p-2">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => {
                setBackground(bg.id);
                setShowBackgroundPicker(false);
              }}
              className={`flex items-center gap-2 w-full p-2 rounded-lg ${
                background === bg.id
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {bg.icon}
              <span className="text-sm">{bg.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};