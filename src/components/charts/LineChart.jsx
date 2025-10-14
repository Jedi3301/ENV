import React, { useEffect, useRef } from 'react';
import '../../styles/charts.css';

const LineChart = ({ data, label, color = '#2196F3', unit = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min and max values
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    // Draw grid lines (dark theme)
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)'; // Subtle grid lines
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - padding * 2) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Draw y-axis labels (bright)
      const value = maxValue - (range * i / 5);
      ctx.fillStyle = '#cbd5e1'; // Bright text
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(value.toFixed(1), padding - 5, y + 4);
    }

    // Draw x-axis (bright)
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)'; // Purple axis
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw y-axis (bright)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();

    // Draw line with glow
    if (data.length > 1) {
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      data.forEach((point, index) => {
        const x = padding + (width - padding * 2) * (index / (data.length - 1));
        const normalizedValue = (point.value - minValue) / range;
        const y = height - padding - (height - padding * 2) * normalizedValue;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.restore();

      // Draw points with glow
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      data.forEach((point, index) => {
        const x = padding + (width - padding * 2) * (index / (data.length - 1));
        const normalizedValue = (point.value - minValue) / range;
        const y = height - padding - (height - padding * 2) * normalizedValue;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // White center
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
      });
      ctx.shadowBlur = 0;
    }

    // Draw title (bright)
    ctx.fillStyle = '#e0e7ff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(99, 102, 241, 0.3)';
    ctx.shadowBlur = 5;
    ctx.fillText(label, width / 2, 20);

    // Draw unit label (bright)
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.shadowBlur = 0;
    ctx.fillText(unit, 5, 20);

  }, [data, label, color, unit]);

  return (
    <div className="line-chart">
      <canvas ref={canvasRef} width={500} height={300}></canvas>
    </div>
  );
};

export default LineChart;
