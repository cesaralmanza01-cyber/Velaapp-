import React from 'react';

interface GaugeMeterProps {
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  title: string;
  subtitle?: string;
  statusText?: string;
  isAlert?: boolean;
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  min = 0,
  max = 100,
  unit = '',
  title,
  subtitle,
  statusText,
  isAlert = false,
}) => {
  // Normalize value to 0..100 percentage range for visual angle
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  
  // Angle from -90 deg to +90 deg
  const angle = -90 + percentage * 180;
  
  // Colors: Trust Blue (#8FAFD1) for standard data, Coral (#F2A488) if alert
  const primaryColor = isAlert ? '#F2A488' : '#8FAFD1';
  const trackColor = '#E3ECE8';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur rounded-2xl border border-[#AEC9C0]/40 shadow-xs">
      <h4 className="text-xs font-semibold tracking-wider uppercase text-[#2E3A36]/70 mb-1">{title}</h4>
      
      <div className="relative w-44 h-24 flex items-end justify-center my-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 55">
          {/* Background Track Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={trackColor}
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Value Arc */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={primaryColor}
            strokeWidth="10"
            strokeDasharray="125.6"
            strokeDashoffset={125.6 * (1 - percentage)}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Pointer and Value Display */}
        <div className="absolute bottom-0 flex flex-col items-center text-center">
          <span className="text-2xl font-bold text-[#2E3A36] tracking-tight">
            {value} <span className="text-sm font-normal text-[#2E3A36]/70">{unit}</span>
          </span>
          {statusText && (
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${
                isAlert
                  ? 'bg-[#F2A488]/20 text-[#2E3A36] border border-[#F2A488]/40'
                  : 'bg-[#AEC9C0]/30 text-[#2E3A36] border border-[#6E9E93]/30'
              }`}
            >
              {statusText}
            </span>
          )}
        </div>
      </div>

      {subtitle && <p className="text-xs text-[#2E3A36]/80 text-center mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
};
