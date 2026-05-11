import { Handle, Position } from 'reactflow';
import { useState } from 'react';

// ── Start / End node — Green rounded pill ──
export const TerminalNode = ({ data }: { data: { label: string; info?: string } }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="relative px-8 py-3 rounded-full font-medium text-sm text-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl min-w-[160px] text-center"
      style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}
      onClick={() => data.info && setShowInfo(!showInfo)}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-white !border-2 !border-green-600" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-white !border-2 !border-green-600" />
      
      {/* Info tooltip */}
      {showInfo && data.info && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-slate-900 text-slate-100 text-xs p-3 rounded-lg shadow-xl border border-slate-700 max-w-[250px] whitespace-normal">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700" />
          {data.info}
        </div>
      )}
    </div>
  );
};

// ── Condition node — Blue diamond ──
export const ConditionNode = ({ data }: { data: { label: string; info?: string } }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="relative">
      <div
        className="w-[130px] h-[130px] rotate-45 flex items-center justify-center shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border-2"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderColor: '#1d4ed8' }}
        onClick={() => data.info && setShowInfo(!showInfo)}
      >
        <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-white !border-2 !border-blue-600" />
        <span className="-rotate-45 text-white text-sm font-medium text-center leading-tight px-2 block max-w-[100px]">
          {data.label}
        </span>
        <Handle type="source" position={Position.Bottom} id="true" className="w-2.5 h-2.5 !bg-emerald-400 !border-2 !border-white" style={{ left: '25%' }} />
        <Handle type="source" position={Position.Bottom} id="false" className="w-2.5 h-2.5 !bg-red-400 !border-2 !border-white" style={{ left: '75%' }} />
      </div>

      {/* True / False labels */}
      <span className="absolute -bottom-1 left-0 -translate-x-full text-[10px] font-bold text-emerald-500 tracking-wider">TRUE</span>
      <span className="absolute -bottom-1 right-0 translate-x-full text-[10px] font-bold text-red-400 tracking-wider">FALSE</span>

      {/* Info tooltip */}
      {showInfo && data.info && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 z-50 bg-slate-900 text-slate-100 text-xs p-3 rounded-lg shadow-xl border border-slate-700 max-w-[250px] whitespace-normal">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700" />
          {data.info}
        </div>
      )}
    </div>
  );
};

// ── Action / Process node — Orange rounded rectangle ──
export const ActionNode = ({ data }: { data: { label: string; info?: string } }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      className="relative px-6 py-3 rounded-lg font-medium text-sm text-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl min-w-[140px] text-center border-2"
      style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', borderColor: '#c2410c' }}
      onClick={() => data.info && setShowInfo(!showInfo)}
    >
      <Handle type="target" position={Position.Top} className="w-2.5 h-2.5 !bg-white !border-2 !border-orange-600" />
      {data.label}
      <Handle type="source" position={Position.Bottom} className="w-2.5 h-2.5 !bg-white !border-2 !border-orange-600" />

      {/* Info tooltip */}
      {showInfo && data.info && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-slate-900 text-slate-100 text-xs p-3 rounded-lg shadow-xl border border-slate-700 max-w-[250px] whitespace-normal">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-t border-slate-700" />
          {data.info}
        </div>
      )}
    </div>
  );
};

export const nodeTypes = {
  terminal: TerminalNode,
  condition: ConditionNode,
  action: ActionNode,
};
