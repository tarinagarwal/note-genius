import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBlackboardStore } from '../store/blackboardStore';
import { Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { generateResponse } from '../lib/groq';
import { ResponseDialog } from './ResponseDialog';
import { AlertDialog } from './AlertDialog';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { ToolsToolbar } from './blackboard/ToolsToolbar';
import { PropertiesToolbar } from './blackboard/PropertiesToolbar';
import { Canvas } from './blackboard/Canvas';

interface AIResponse {
  id: string;
  content: string;
  drawingData: any[];
  timestamp: string;
}

interface NotebookNavigation {
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  notebookTitle: string | null;
}

interface ShapeInProgress {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

const Blackboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const whiteboardId = searchParams.get('id');
  const [title, setTitle] = useState('');
  const [responses, setResponses] = useState<AIResponse[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [shapeInProgress, setShapeInProgress] = useState<ShapeInProgress | null>(null);
  const [textInput, setTextInput] = useState<{ x: number; y: number; text: string } | null>(null);
  const [navigation, setNavigation] = useState<NotebookNavigation>({
    prev: null,
    next: null,
    notebookTitle: null
  });
  const [alert, setAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, title: '', message: '', type: 'info' });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundPicker, setShowBackgroundPicker] = useState(false);
  const navigate = useNavigate();

  const {
    paths,
    currentPath,
    isDrawing,
    currentTool,
    currentColor,
    currentWidth,
    currentOpacity,
    background,
    zoom,
    recentColors,
    textElements,
    shapeElements,
    startDrawing,
    addPoint,
    stopDrawing,
    setTool,
    setColor,
    setWidth,
    setOpacity,
    setBackground,
    setZoom,
    addTextElement,
    addShapeElement,
    saveWhiteboard,
  } = useBlackboardStore();

  React.useEffect(() => {
    if (whiteboardId) {
      loadWhiteboardData();
      loadResponses();
      loadNavigationData();
    }
  }, [whiteboardId]);

  const loadWhiteboardData = async () => {
    try {
      const { data, error } = await supabase
        .from('whiteboards')
        .select('title, drawing_data')
        .eq('id', whiteboardId)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        if (data.drawing_data) {
          useBlackboardStore.getState().loadSavedWhiteboard(data.drawing_data);
        }
      }
    } catch (error) {
      console.error('Error loading whiteboard data:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to load whiteboard data. Please try again.',
        type: 'error',
      });
    }
  };

  const loadNavigationData = async () => {
    try {
      const { data: currentWhiteboard, error: currentError } = await supabase
        .from('whiteboards')
        .select('notebook_id, order_index')
        .eq('id', whiteboardId)
        .single();

      if (currentError) throw currentError;

      if (currentWhiteboard?.notebook_id) {
        const { data: notebook, error: notebookError } = await supabase
          .from('notebooks')
          .select('title')
          .eq('id', currentWhiteboard.notebook_id)
          .single();

        if (notebookError) throw notebookError;

        const { data: whiteboards, error: whiteboardsError } = await supabase
          .from('whiteboards')
          .select('id, title, order_index')
          .eq('notebook_id', currentWhiteboard.notebook_id)
          .order('order_index', { ascending: true });

        if (whiteboardsError) throw whiteboardsError;

        const currentIndex = whiteboards.findIndex(w => w.id === whiteboardId);
        
        setNavigation({
          prev: currentIndex > 0 ? whiteboards[currentIndex - 1] : null,
          next: currentIndex < whiteboards.length - 1 ? whiteboards[currentIndex + 1] : null,
          notebookTitle: notebook.title
        });
      } else {
        setNavigation({
          prev: null,
          next: null,
          notebookTitle: null
        });
      }
    } catch (error) {
      console.error('Error loading navigation data:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to load navigation data. Please try again.',
        type: 'error',
      });
    }
  };

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_responses')
        .select('*')
        .eq('whiteboard_id', whiteboardId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setResponses(data || []);
    } catch (error) {
      console.error('Error loading responses:', error);
      setAlert({
        show: true,
        title: 'Error',
        message: 'Failed to load responses. Please try again.',
        type: 'error',
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (currentTool === 'text') {
      setTextInput({ x, y, text: '' });
      return;
    }

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
      setShapeInProgress({ startX: x, startY: y, currentX: x, currentY: y });
      return;
    }

    startDrawing({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;

    if (shapeInProgress) {
      setShapeInProgress({ ...shapeInProgress, currentX: x, currentY: y });
      return;
    }

    if (isDrawing) {
      addPoint({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (shapeInProgress) {
      const { startX, startY, currentX, currentY } = shapeInProgress;
      
      if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
        addShapeElement({
          type: currentTool,
          x: startX,
          y: startY,
          width: currentX - startX,
          height: currentY - startY,
          color: currentColor,
          strokeWidth: currentWidth,
        });
      }
      
      setShapeInProgress(null);
      return;
    }

    stopDrawing();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput && textInput.text.trim()) {
      addTextElement({
        x: textInput.x,
        y: textInput.y,
        text: textInput.text,
        fontSize: currentWidth * 10,
        fontFamily: 'Arial',
        color: currentColor,
      });
    }
    setTextInput(null);
  };

  const handleAIAnalysis = async () => {
    if (!whiteboardId) {
      setAlert({
        show: true,
        title: 'Save Required',
        message: 'Please save the whiteboard first before analyzing.',
        type: 'warning',
      });
      return;
    }

    if (isAnalyzing) return;

    try {
      setIsAnalyzing(true);
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      
      const imageData = canvas.toDataURL('image/png');
      const response = await generateResponse(imageData);
      
      const newResponse: AIResponse = {
        id: Date.now().toString(),
        content: response,
        drawingData: [...paths],
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_responses')
        .insert([{
          whiteboard_id: whiteboardId,
          content: response,
          drawing_data: paths,
        }]);

      if (error) throw error;
      setResponses([...responses, newResponse]);
    } catch (error) {
      console.error('Error analyzing drawing:', error);
      setAlert({
        show: true,
        title: 'Analysis Failed',
        message: 'Failed to analyze drawing. Please try again.',
        type: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewSnapshot = (drawingData: any[]) => {
    setSelectedDrawing(drawingData);
    setShowDialog(true);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4">
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {navigation.notebookTitle && (
            <div className="text-sm text-gray-500">
              Notebook: {navigation.notebookTitle}
            </div>
          )}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter whiteboard title"
          />
        </div>
        <div className="flex items-center gap-2">
          {navigation.prev && (
            <button
              onClick={() => navigate(`/whiteboard?id=${navigation.prev!.id}&title=${encodeURIComponent(navigation.prev!.title)}`)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md"
              title="Previous whiteboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          )}
          {navigation.next && (
            <button
              onClick={() => navigate(`/whiteboard?id=${navigation.next!.id}&title=${encodeURIComponent(navigation.next!.title)}`)}
              className="flex items-center gap-1 px-3 py-2 text-gray-700 hover:text-blue-600 rounded-md"
              title="Next whiteboard"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => saveWhiteboard(title, whiteboardId)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
      
      <div className="relative w-full aspect-[4/3] bg-white rounded-lg shadow-lg">
        <Canvas
          paths={paths}
          currentPath={currentPath}
          textElements={textElements}
          shapeElements={shapeElements}
          background={background}
          zoom={zoom}
          shapeInProgress={shapeInProgress}
          currentTool={currentTool}
          currentColor={currentColor}
          currentWidth={currentWidth}
          currentOpacity={currentOpacity}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />

        {textInput && (
          <form
            onSubmit={handleTextSubmit}
            className="absolute"
            style={{
              left: textInput.x * zoom,
              top: textInput.y * zoom,
            }}
          >
            <input
              type="text"
              value={textInput.text}
              onChange={(e) => setTextInput({ ...textInput, text: e.target.value })}
              className="px-2 py-1 border border-blue-500 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text"
              autoFocus
              onBlur={handleTextSubmit}
            />
          </form>
        )}
        
        <ToolsToolbar
          currentTool={currentTool}
          background={background}
          setTool={setTool}
          setBackground={setBackground}
          showBackgroundPicker={showBackgroundPicker}
          setShowBackgroundPicker={setShowBackgroundPicker}
        />

        <PropertiesToolbar
          currentColor={currentColor}
          currentWidth={currentWidth}
          currentOpacity={currentOpacity}
          zoom={zoom}
          isAnalyzing={isAnalyzing}
          showColorPicker={showColorPicker}
          setShowColorPicker={setShowColorPicker}
          setWidth={setWidth}
          setOpacity={setOpacity}
          setZoom={setZoom}
          setColor={setColor}
          handleAIAnalysis={handleAIAnalysis}
          recentColors={recentColors}
        />
      </div>

      {responses.length > 0 && (
        <div className="w-full mt-8">
          <h3 className="text-lg font-medium mb-4">AI Responses</h3>
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Response {responses.indexOf(response) + 1}</h4>
                  <button
                    onClick={() => handleViewSnapshot(response.drawingData)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    View Snapshot
                  </button>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{response.content}</ReactMarkdown>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(response.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ResponseDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        drawingData={selectedDrawing}
      />

      <AlertDialog
        isOpen={alert.show}
        onClose={() => setAlert({ ...alert, show: false })}
        title={alert.title}
        message={alert.message}
        type={alert.type}
      />
    </div>
  );
};

export default Blackboard;