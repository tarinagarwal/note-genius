import React, { useRef, useEffect } from 'react';
import { Tool, Background } from '../../store/blackboardStore';

interface CanvasProps {
  paths: any[];
  currentPath: any;
  textElements: any[];
  shapeElements: any[];
  background: Background;
  zoom: number;
  shapeInProgress: any;
  currentTool: Tool;
  currentColor: string;
  currentWidth: number;
  currentOpacity: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  paths,
  currentPath,
  textElements,
  shapeElements,
  background,
  zoom,
  shapeInProgress,
  currentTool,
  currentColor,
  currentWidth,
  currentOpacity,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    switch (background) {
      case 'grid':
        const gridSize = 20;
        for (let x = 0; x <= width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y <= height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      
      case 'ruled':
        const lineSpacing = 25;
        for (let y = lineSpacing; y <= height; y += lineSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      
      case 'dotted':
        const dotSpacing = 20;
        const dotSize = 2;
        ctx.fillStyle = '#e5e7eb';
        for (let x = dotSpacing; x <= width; x += dotSpacing) {
          for (let y = dotSpacing; y <= height; y += dotSpacing) {
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply zoom transformation
    ctx.save();
    ctx.scale(zoom, zoom);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / zoom, canvas.height / zoom);

    // Set white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width / zoom, canvas.height / zoom);

    // Draw background pattern
    drawBackground(ctx, canvas.width / zoom, canvas.height / zoom);

    // Draw all completed paths
    paths.forEach((path) => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.slice(1).forEach((point: any) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.globalAlpha = path.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
      }
      
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    });

    // Draw current path
    if (currentPath?.points.length) {
      ctx.beginPath();
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
      currentPath.points.slice(1).forEach((point: any) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = currentPath.width;
      ctx.globalAlpha = currentPath.opacity;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentPath.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
      }
      
      ctx.stroke();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
    }

    // Draw shape in progress
    if (shapeInProgress && (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line')) {
      ctx.beginPath();
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentWidth;
      ctx.globalAlpha = currentOpacity;

      if (currentTool === 'rectangle') {
        const width = shapeInProgress.currentX - shapeInProgress.startX;
        const height = shapeInProgress.currentY - shapeInProgress.startY;
        ctx.strokeRect(shapeInProgress.startX, shapeInProgress.startY, width, height);
      } else if (currentTool === 'circle') {
        const radius = Math.sqrt(
          Math.pow(shapeInProgress.currentX - shapeInProgress.startX, 2) +
          Math.pow(shapeInProgress.currentY - shapeInProgress.startY, 2)
        );
        ctx.beginPath();
        ctx.arc(shapeInProgress.startX, shapeInProgress.startY, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (currentTool === 'line') {
        ctx.beginPath();
        ctx.moveTo(shapeInProgress.startX, shapeInProgress.startY);
        ctx.lineTo(shapeInProgress.currentX, shapeInProgress.currentY);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }

    // Draw shapes
    shapeElements.forEach((shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.globalAlpha = currentOpacity;

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === 'circle') {
        const radius = Math.sqrt(Math.pow(shape.width, 2) + Math.pow(shape.height, 2)) / 2;
        ctx.arc(shape.x, shape.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape.type === 'line') {
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    });

    // Draw text elements
    textElements.forEach((element) => {
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      ctx.fillStyle = element.color;
      ctx.fillText(element.text, element.x, element.y);
    });

    ctx.restore();
  }, [paths, currentPath, background, zoom, shapeInProgress, textElements, shapeElements]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="w-full h-full border border-gray-200 rounded-lg"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  );
};