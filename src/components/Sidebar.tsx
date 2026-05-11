import { useStore } from '../store/useStore';
import type { ConversionHistory } from '../store/useStore';

interface SidebarProps {
  onNavigateHome: () => void;
  onLoadHistory: (item: ConversionHistory) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigateHome, onLoadHistory }) => {
  const history = useStore((state) => state.history);
  const clearHistory = useStore((state) => state.clearHistory);

  const getLanguageIcon = (lang: string) => {
    if (lang.toLowerCase().includes('python')) return { icon: 'data_object', color: 'text-emerald-400' };
    if (lang.toLowerCase().includes('js') || lang.toLowerCase().includes('javascript')) return { icon: 'javascript', color: 'text-yellow-400' };
    if (lang.toLowerCase().includes('go')) return { icon: 'terminal', color: 'text-cyan-400' };
    return { icon: 'code', color: 'text-blue-400' };
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <nav
      className="hidden md:flex flex-col h-full w-[260px] shrink-0 z-20 border-r transition-colors duration-200"
      style={{
        backgroundColor: 'var(--ws-sidebar)',
        borderColor: 'var(--ws-border)',
      }}
    >
      {/* Logo — clickable, links to homepage */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-2 px-5 py-5 group cursor-pointer transition-colors border-b"
        style={{ borderColor: 'var(--ws-border)' }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
      >
        <span
          className="text-xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-blue-500 to-emerald-400 bg-clip-text text-transparent transition-all duration-300 group-hover:from-blue-300 group-hover:to-emerald-300"
          style={{ fontFamily: "'Geist', sans-serif" }}
        >
          FlowZen
        </span>
        <span className="text-[11px] font-medium tracking-wide ml-1" style={{ color: 'var(--ws-text-muted)' }}>
          workspace
        </span>
      </button>

      {/* History Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--ws-text-secondary)' }}>history</span>
            <span className="text-[13px] font-semibold tracking-wide" style={{ color: 'var(--ws-text)' }}>History</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-[11px] hover:text-red-400 transition-colors"
              style={{ color: 'var(--ws-text-muted)' }}
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50 px-4">
              <span className="material-symbols-outlined text-[36px] mb-3" style={{ color: 'var(--ws-text-muted)' }}>inbox</span>
              <p className="text-[13px] text-center leading-relaxed" style={{ color: 'var(--ws-text-muted)' }}>
                No conversions yet.<br/>Convert some code to see history here.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const langInfo = getLanguageIcon(item.language);
              return (
                <button
                  key={item.id}
                  onClick={() => onLoadHistory(item)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group text-left cursor-pointer"
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${langInfo.color}`}
                    style={{ backgroundColor: 'var(--ws-active)' }}
                  >
                    <span className="material-symbols-outlined text-[14px]">{langInfo.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium truncate" style={{ color: 'var(--ws-text)' }}>{item.filename}</p>
                    <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--ws-text-muted)' }}>
                      <span className={`w-1.5 h-1.5 rounded-full ${langInfo.color.replace('text-', 'bg-')}`} />
                      {item.language} · {item.nodeCount} nodes · {formatTime(item.timestamp)}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--ws-text-muted)' }}>
                    arrow_forward
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </nav>
  );
};
