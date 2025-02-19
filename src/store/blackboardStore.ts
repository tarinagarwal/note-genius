import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Point {
  x: number;
  y: number;
}

export type Tool = 'pen' | 'highlighter' | 'eraser' | 'text' | 'select' | 'rectangle' | 'circle' | 'line';
export type Background = 'blank' | 'grid' | 'ruled' | 'dotted';

interface DrawingPath {
  id: string;
  tool: Tool;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fill?: string;
}

interface BlackboardState {
  paths: DrawingPath[];
  textElements: TextElement[];
  shapeElements: ShapeElement[];
  currentPath: DrawingPath | null;
  selectedElement: string | null;
  isDrawing: boolean;
  currentTool: Tool;
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  background: Background;
  zoom: number;
  recentColors: string[];
  addPoint: (point: Point) => void;
  startDrawing: (point: Point) => void;
  stopDrawing: () => void;
  clearBoard: () => void;
  setTool: (tool: Tool) => void;
  setColor: (color: string) => void;
  setWidth: (width: number) => void;
  setOpacity: (opacity: number) => void;
  setBackground: (background: Background) => void;
  setZoom: (zoom: number) => void;
  addTextElement: (element: Omit<TextElement, 'id'>) => void;
  updateTextElement: (id: string, text: string) => void;
  deleteElement: (id: string) => void;
  addShapeElement: (element: Omit<ShapeElement, 'id'>) => void;
  updateShapeElement: (id: string, updates: Partial<ShapeElement>) => void;
  saveWhiteboard: (title: string, id?: string | null) => Promise<void>;
  loadSavedWhiteboard: (data: any) => void;
}

export const useBlackboardStore = create<BlackboardState>((set, get) => ({
  paths: [],
  textElements: [],
  shapeElements: [],
  currentPath: null,
  selectedElement: null,
  isDrawing: false,
  currentTool: 'pen',
  currentColor: '#000000',
  currentWidth: 2,
  currentOpacity: 1,
  background: 'blank',
  zoom: 1,
  recentColors: [],

  startDrawing: (point: Point) => {
    const { currentTool, currentColor, currentWidth, currentOpacity } = get();
    
    // Don't start drawing if we're using text or select tools
    if (currentTool === 'text' || currentTool === 'select') return;

    const newPath: DrawingPath = {
      id: Date.now().toString(),
      tool: currentTool,
      points: [point],
      color: currentTool === 'eraser' ? '#ffffff' : currentColor,
      width: currentTool === 'highlighter' ? currentWidth * 2 : currentWidth,
      opacity: currentTool === 'highlighter' ? 0.4 : currentOpacity,
    };
    set({ currentPath: newPath, isDrawing: true });
  },

  addPoint: (point: Point) => {
    set((state) => {
      if (!state.currentPath || !state.isDrawing) return state;

      // For eraser, we need to check if we're intersecting with any existing paths
      if (state.currentTool === 'eraser') {
        const eraserX = point.x;
        const eraserY = point.y;
        const eraserRadius = state.currentWidth;

        // Filter out paths that intersect with the eraser
        const remainingPaths = state.paths.filter(path => {
          return !path.points.some(p => {
            const dx = p.x - eraserX;
            const dy = p.y - eraserY;
            return Math.sqrt(dx * dx + dy * dy) < eraserRadius;
          });
        });

        return {
          paths: remainingPaths,
          currentPath: {
            ...state.currentPath,
            points: [...state.currentPath.points, point],
          },
        };
      }

      return {
        currentPath: {
          ...state.currentPath,
          points: [...state.currentPath.points, point],
        },
      };
    });
  },

  stopDrawing: () => {
    set((state) => {
      if (!state.currentPath || !state.isDrawing) return state;

      // Don't save eraser paths
      if (state.currentTool === 'eraser') {
        return { currentPath: null, isDrawing: false };
      }

      return {
        paths: [...state.paths, state.currentPath],
        currentPath: null,
        isDrawing: false,
      };
    });
  },

  clearBoard: () => {
    set({ 
      paths: [], 
      textElements: [], 
      shapeElements: [], 
      currentPath: null, 
      isDrawing: false 
    });
  },

  setTool: (tool: Tool) => {
    set({ currentTool: tool });
  },

  setColor: (color: string) => {
    set((state) => {
      const recentColors = [color, ...state.recentColors.filter(c => c !== color)].slice(0, 10);
      return { currentColor: color, recentColors };
    });
  },

  setWidth: (width: number) => {
    set({ currentWidth: width });
  },

  setOpacity: (opacity: number) => {
    set({ currentOpacity: opacity });
  },

  setBackground: (background: Background) => {
    set({ background });
  },

  setZoom: (zoom: number) => {
    set({ zoom: Math.min(Math.max(0.25, zoom), 4) });
  },

  addTextElement: (element) => {
    const newElement: TextElement = {
      ...element,
      id: Date.now().toString(),
    };
    set((state) => ({
      textElements: [...state.textElements, newElement],
      selectedElement: newElement.id,
    }));
  },

  updateTextElement: (id: string, text: string) => {
    set((state) => ({
      textElements: state.textElements.map((el) =>
        el.id === id ? { ...el, text } : el
      ),
    }));
  },

  addShapeElement: (element) => {
    const newElement: ShapeElement = {
      ...element,
      id: Date.now().toString(),
    };
    set((state) => ({
      shapeElements: [...state.shapeElements, newElement],
      selectedElement: newElement.id,
    }));
  },

  updateShapeElement: (id: string, updates: Partial<ShapeElement>) => {
    set((state) => ({
      shapeElements: state.shapeElements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  deleteElement: (id: string) => {
    set((state) => ({
      textElements: state.textElements.filter((el) => el.id !== id),
      shapeElements: state.shapeElements.filter((el) => el.id !== id),
      selectedElement: null,
    }));
  },

  saveWhiteboard: async (title: string, id?: string | null) => {
    const { paths, textElements, shapeElements, background } = get();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const boardData = {
      paths,
      textElements,
      shapeElements,
      background,
    };

    if (id) {
      const { error } = await supabase
        .from('whiteboards')
        .update({
          title,
          drawing_data: boardData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('whiteboards')
        .insert([
          {
            title,
            drawing_data: boardData,
            user_id: user.id
          },
        ]);
      
      if (error) throw error;
    }
  },

  loadSavedWhiteboard: (data: any) => {
    if (!data) return;
    
    set({
      paths: data.paths || [],
      textElements: data.textElements || [],
      shapeElements: data.shapeElements || [],
      background: data.background || 'blank',
      currentPath: null,
      isDrawing: false,
    });
  },
}));