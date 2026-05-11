import { useState, useRef, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { CodeEditor } from './CodeEditor';
import { FlowCanvas } from './FlowCanvas';
import { useStore } from '../store/useStore';
import { generateFlowchart, BOOK_EXAMPLES } from '../api/gemini';
import type { ConversionHistory } from '../store/useStore';

export const Workspace: React.FC<{ onNavigateHome: () => void }> = ({ onNavigateHome }) => {
  const { code, setCode, setNodes, setEdges, addHistory, loadHistory, nodes, edges } = useStore();
  const toggleTheme = useStore(state => state.toggleTheme);
  const theme = useStore(state => state.theme);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'examples'>('code');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const howItWorksTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect language from code
  const detectLanguage = (src: string) => {
    if (src.includes('def ') || src.includes('import ') || src.includes('elif ')) return 'Python';
    if (src.includes('function ') || src.includes('const ') || src.includes('let ') || src.includes('=>')) return 'JavaScript';
    if (src.includes('func ') && src.includes('fmt.')) return 'Go';
    if (src.includes('public static') || src.includes('System.out')) return 'Java';
    return 'Code';
  };

  const handleConvert = async () => {
    if (!code.trim()) return;
    
    setIsConverting(true);
    setError(null);
    try {
        const result = await generateFlowchart(code);
        setNodes(result.nodes);
        setEdges(result.edges);
        
        addHistory({
            filename: detectFunctionName(code),
            language: detectLanguage(code),
            code: code,
            nodeCount: result.nodes.length,
            nodes: result.nodes,
            edges: result.edges,
        });
    } catch (err: any) {
        setError(err.message);
    } finally {
        setIsConverting(false);
    }
  };

  // Extract function/class name from code
  const detectFunctionName = (src: string): string => {
    const pyMatch = src.match(/def\s+(\w+)/);
    if (pyMatch) return `${pyMatch[1]}.py`;
    const jsMatch = src.match(/function\s+(\w+)/);
    if (jsMatch) return `${jsMatch[1]}.js`;
    const constMatch = src.match(/const\s+(\w+)\s*=/);
    if (constMatch) return `${constMatch[1]}.js`;
    return 'snippet.code';
  };

  const handleClear = () => {
      setNodes([]);
      setEdges([]);
      setCode('');
      setError(null);
  };

  const handleLoadExample = (example: typeof BOOK_EXAMPLES[0]) => {
    setCode(example.code);
    setActiveTab('code');
  };

  const handleLoadHistory = (item: ConversionHistory) => {
    loadHistory(item);
    setActiveTab('code');
  };

  // Close how-it-works on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (howItWorksRef.current && !howItWorksRef.current.contains(e.target as Node)) {
        setShowHowItWorks(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div
      className="font-body-base antialiased flex h-screen overflow-hidden w-full transition-colors duration-200"
      style={{ backgroundColor: 'var(--ws-bg)', color: 'var(--ws-text)' }}
    >
      <Sidebar onNavigateHome={onNavigateHome} onLoadHistory={handleLoadHistory} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Bar ── */}
        <header
          className="flex justify-between items-center h-14 px-4 sm:px-6 shrink-0 z-10 border-b transition-colors duration-200"
          style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
        >
          <div className="flex items-center gap-4">
            <button className="md:hidden transition-colors" style={{ color: 'var(--ws-text-secondary)' }} aria-label="Menu">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--ws-text)' }}>Code to Flowchart</h2>
          </div>
          <div className="flex items-center gap-2">
            {/* How it works — hover tooltip */}
            <div
              className="relative"
              ref={howItWorksRef}
              onMouseEnter={() => {
                howItWorksTimerRef.current = setTimeout(() => setShowHowItWorks(true), 500);
              }}
              onMouseLeave={() => {
                if (howItWorksTimerRef.current) clearTimeout(howItWorksTimerRef.current);
                setShowHowItWorks(false);
              }}
            >
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[13px]"
                style={{ color: 'var(--ws-text-secondary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ws-hover)'; e.currentTarget.style.color = 'var(--ws-text)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ws-text-secondary)'; }}
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="hidden sm:inline">How it works</span>
              </button>

              {showHowItWorks && (
                <div
                  className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-2xl z-50 p-5 border"
                  style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
                >
                  <h4 className="text-[14px] font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--ws-text)' }}>
                    <span className="material-symbols-outlined text-[18px] text-blue-400">auto_awesome</span>
                    How FlowZen Works
                  </h4>
                  <div className="space-y-3">
                    {[
                      { step: '1', icon: 'code', title: 'Write Code', desc: 'Paste any code snippet in the editor' },
                      { step: '2', icon: 'bolt', title: 'Convert', desc: 'AI parses your logic into a flowchart' },
                      { step: '3', icon: 'visibility', title: 'Visualize', desc: 'Interactive, colorful flowchart appears' },
                      { step: '4', icon: 'download', title: 'Export', desc: 'Download as PNG or PDF with summary' },
                    ].map(s => (
                      <div key={s.step} className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-blue-400">{s.step}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium" style={{ color: 'var(--ws-text)' }}>{s.title}</p>
                          <p className="text-[11px]" style={{ color: 'var(--ws-text-muted)' }}>{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] mt-4 pt-3 border-t" style={{ color: 'var(--ws-text-muted)', borderColor: 'var(--ws-border)' }}>
                    💡 Click on flowchart nodes to see what each block does.
                  </p>
                </div>
              )}
            </div>

            <div className="h-5 w-px mx-1" style={{ backgroundColor: 'var(--ws-border)' }} />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md transition-all"
              style={{ color: 'var(--ws-text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ws-hover)'; e.currentTarget.style.color = 'var(--ws-text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ws-text-secondary)'; }}
              aria-label="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[18px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>
        </header>

        {/* ── Scrollable Workspace ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col gap-2">
            <div
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-lg border transition-colors duration-200"
              style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
            >
              {/* Tab switcher */}
              <div
                className="flex items-center gap-1 p-1 rounded-lg border"
                style={{ backgroundColor: 'var(--ws-panel-secondary)', borderColor: 'var(--ws-border)' }}
              >
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'code'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : ''
                  }`}
                  style={activeTab !== 'code' ? { color: 'var(--ws-text-secondary)' } : undefined}
                >
                  <span className="material-symbols-outlined text-[16px]">code</span>
                  Code Input
                </button>
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`px-4 py-1.5 rounded-md text-[13px] font-medium flex items-center gap-2 transition-all ${
                    activeTab === 'examples'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : ''
                  }`}
                  style={activeTab !== 'examples' ? { color: 'var(--ws-text-secondary)' } : undefined}
                >
                  <span className="material-symbols-outlined text-[16px]">library_books</span>
                  Book Examples
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-md border transition-all text-[13px] flex items-center gap-1.5"
                  style={{ borderColor: 'var(--ws-border)', color: 'var(--ws-text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ws-hover)'; e.currentTarget.style.color = 'var(--ws-text)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ws-text-secondary)'; }}
                >
                  <span className="material-symbols-outlined text-[16px]">clear_all</span>
                  Clear
                </button>
                <button 
                  onClick={handleConvert}
                  disabled={isConverting}
                  className={`px-5 py-1.5 rounded-md text-[13px] font-bold flex items-center gap-1.5 transition-all ${
                    isConverting
                      ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[16px] ${isConverting ? 'animate-spin' : ''}`}>
                    {isConverting ? 'sync' : 'bolt'}
                  </span>
                  {isConverting ? 'Converting...' : 'CONVERT'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-[13px] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
          </div>

          {/* Core Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
            {/* Left panel — Code or Examples */}
            {activeTab === 'code' ? (
              <CodeEditor />
            ) : (
              <div
                className="flex flex-col rounded-lg border overflow-hidden h-full transition-colors duration-200"
                style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
              >
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'var(--ws-border)' }}>
                  <span className="text-[13px] font-medium" style={{ color: 'var(--ws-text)' }}>📚 Book Examples</span>
                  <span className="text-[11px]" style={{ color: 'var(--ws-text-muted)' }}>{BOOK_EXAMPLES.length} snippets</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {BOOK_EXAMPLES.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadExample(example)}
                      className="w-full text-left p-4 rounded-lg border transition-all group cursor-pointer"
                      style={{ borderColor: 'var(--ws-border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ws-hover)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[14px] font-medium group-hover:text-blue-400 transition-colors" style={{ color: 'var(--ws-text)' }}>
                          {example.title}
                        </h4>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          example.language === 'Python'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {example.language}
                        </span>
                      </div>
                      <pre className="text-[11px] font-code-base leading-relaxed line-clamp-3 overflow-hidden" style={{ color: 'var(--ws-text-muted)' }}>
                        {example.code.slice(0, 120)}...
                      </pre>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Right panel — Flowchart */}
            <FlowCanvas />
          </div>
        </div>
      </main>
    </div>
  );
};
