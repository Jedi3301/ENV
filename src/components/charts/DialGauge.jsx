import React, { useEffect, useRef, useState } from 'react';
import '../../styles/charts.css';

const DialGauge = ({ value, min, max, label, unit, thresholds }) => {
  const canvasRef = useRef(null);
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef(null);

  // Animate value changes
  useEffect(() => {
    const startValue = displayValue;
    const endValue = value;
    const duration = 800; // 800ms animation
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, displayValue]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate angle based on displayValue (animated)
    const percentage = (displayValue - min) / (max - min);
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const angle = startAngle + (endAngle - startAngle) * percentage;

    // Determine color based on thresholds (use actual value, not animated)
    let color = '#22c55e'; // Green (good)
    let glowColor = 'rgba(34, 197, 94, 0.4)';
    if (thresholds) {
      if (value >= thresholds.danger) {
        color = '#ef4444'; // Red (danger)
        glowColor = 'rgba(239, 68, 68, 0.4)';
      } else if (value >= thresholds.warning) {
        color = '#fb923c'; // Orange (warning)
        glowColor = 'rgba(251, 146, 60, 0.4)';
      }
    }

    // Draw outer circle (background arc)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.3)'; // Dark gray for background
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw value arc with glow
    ctx.save();
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    // Draw center circle (dark background)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 40, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'; // Dark center
    ctx.fill();
    
    // Add subtle border to center circle
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw value text (bright, animated)
    ctx.fillStyle = '#e0e7ff'; // Bright text
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(99, 102, 241, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(displayValue.toFixed(1), centerX, centerY - 10);

    // Draw unit text (bright)
    ctx.font = '16px Arial';
    ctx.fillStyle = '#94a3b8'; // Lighter gray
    ctx.shadowBlur = 0;
    ctx.fillText(unit, centerX, centerY + 20);

    // Draw min and max labels (bright)
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = '#cbd5e1'; // Bright labels
    ctx.textAlign = 'left';
    ctx.fillText(min.toString(), 20, canvas.height - 10);
    ctx.textAlign = 'right';
    ctx.fillText(max.toString(), canvas.width - 20, canvas.height - 10);

  }, [displayValue, min, max, unit, thresholds, value]);

  return (
    <div className="dial-gauge">
      <canvas ref={canvasRef} width={250} height={250}></canvas>
      <div className="dial-label">{label}</div>
    </div>
  );
};

export default DialGauge;
