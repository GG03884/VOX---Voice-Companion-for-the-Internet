import React from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ 
  isActive, 
  color = 'bg-vox-500', 
  size = 'md' 
}) => {
  const heights = size === 'sm' 
    ? ['h-2', 'h-4', 'h-3', 'h-5', 'h-2'] 
    : ['h-3', 'h-6', 'h-4', 'h-8', 'h-3'];

  return (
    <div className="flex items-center justify-center space-x-1 h-8 px-2" aria-hidden="true">
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-1 rounded-full transition-all duration-300 ${color} ${
            isActive ? `animate-wave ${h}` : 'h-1.5 opacity-40'
          }`}
          style={{
            animationDelay: isActive ? `${i * 0.15}s` : '0s',
            animationDuration: '1.1s',
          }}
        />
      ))}
    </div>
  );
};
