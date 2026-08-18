import React, { useState, useRef } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { WaveformDescriptor, VesselCategory, findWaveformDescriptor, WAVEFORM_DESCRIPTORS } from '../data/waveformDescriptors';
import { WaveformSchematicSvg } from './WaveformSchematicSvg';

interface WaveformHoverCardProps {
  descriptorIdOrValue: string;
  category?: VesselCategory;
  onOpenFullGuide?: (descriptorId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const WaveformHoverCard: React.FC<WaveformHoverCardProps> = ({
  descriptorIdOrValue,
  category = 'ica',
  onOpenFullGuide,
  children,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const descriptor: WaveformDescriptor = WAVEFORM_DESCRIPTORS[descriptorIdOrValue] || findWaveformDescriptor(descriptorIdOrValue, category);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 180);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 120);
  };

  if (descriptor.id === 'not_assessed' || descriptor.id === 'other') {
    return <div className={`inline-block ${className}`}>{children}</div>;
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className="absolute z-40 left-0 bottom-full mb-2 w-72 p-3.5 rounded-xl bg-[#090f1f]/95 backdrop-blur-md border border-slate-700 shadow-2xl shadow-black/80 pointer-events-auto animate-fadeIn"
          style={{ minWidth: '280px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-100">
                {descriptor.label}
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {category.toUpperCase()}
              </span>
            </div>
            {descriptor.severity === 'warning' && (
              <span className="text-[9px] font-bold text-amber-400">Warning</span>
            )}
            {descriptor.severity === 'alert' && (
              <span className="text-[9px] font-bold text-rose-400">Critical</span>
            )}
          </div>

          {/* Mini Waveform Graphic */}
          <div className="my-2">
            <WaveformSchematicSvg
              descriptorId={descriptor.id}
              category={category}
              height={85}
              compact={true}
              showAnnotations={false}
            />
          </div>

          {/* Core definition */}
          <p className="text-[11px] text-slate-300 leading-snug">
            {descriptor.shortDefinition}
          </p>

          {/* Action button */}
          {onOpenFullGuide && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                onOpenFullGuide(descriptor.id);
              }}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>View full guide & criteria</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
