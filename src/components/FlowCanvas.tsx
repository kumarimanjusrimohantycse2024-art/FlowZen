import type React from 'react';
import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, { 
    Background, 
    Controls, 
    MiniMap,
    ConnectionMode,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    useReactFlow,
    ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import { nodeTypes } from './FlowNodes';
import { downloadImage, downloadPDF } from '../utils/export';

const FlowCanvasInner: React.FC = () => {
    const { nodes, edges, setNodes, setEdges } = useStore();
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);
    const reactFlowInstance = useReactFlow();

    const onNodesChange = useCallback(
        (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );

    const onEdgesChange = useCallback(
        (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
        [setEdges]
    );

    // Auto-fit when nodes change
    useEffect(() => {
        if (nodes.length > 0 && reactFlowInstance) {
            // Small delay to let the layout settle
            const timer = setTimeout(() => {
                reactFlowInstance.fitView({ padding: 0.15, duration: 400 });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [nodes, reactFlowInstance]);

    // Close export menu on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const handleExport = (type: 'image' | 'pdf', withInfo: boolean) => {
        if (type === 'image') downloadImage(withInfo);
        else downloadPDF(withInfo);
        setShowExportMenu(false);
    };

    return (
        <div
            className="flex flex-col rounded-lg border overflow-hidden shadow-sm relative h-full transition-colors duration-200"
            style={{ backgroundColor: 'var(--ws-flow-bg)', borderColor: 'var(--ws-border)' }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
                style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
            >
                <span className="text-[13px] font-medium" style={{ color: 'var(--ws-text)' }}>Flowchart Output</span>
                
                {/* Export dropdown */}
                <div className="relative" ref={exportRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all text-[13px]"
                        style={{ color: 'var(--ws-text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--ws-hover)'; e.currentTarget.style.color = 'var(--ws-text)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--ws-text-secondary)'; }}
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        Export
                        <span className="material-symbols-outlined text-[14px]">expand_more</span>
                    </button>

                    {showExportMenu && (
                        <div
                            className="absolute right-0 top-full mt-1 w-56 rounded-lg shadow-xl z-50 overflow-hidden border"
                            style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
                        >
                            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--ws-border)' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ws-text-muted)' }}>Download as Image</p>
                            </div>
                            <button onClick={() => handleExport('image', false)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                                style={{ color: 'var(--ws-text)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="material-symbols-outlined text-[16px] text-emerald-400">image</span>
                                PNG — Chart only
                            </button>
                            <button onClick={() => handleExport('image', true)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                                style={{ color: 'var(--ws-text)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="material-symbols-outlined text-[16px] text-blue-400">description</span>
                                PNG — With summary
                            </button>

                            <div className="px-3 py-2 border-t border-b" style={{ borderColor: 'var(--ws-border)' }}>
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ws-text-muted)' }}>Download as PDF</p>
                            </div>
                            <button onClick={() => handleExport('pdf', false)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                                style={{ color: 'var(--ws-text)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="material-symbols-outlined text-[16px] text-red-400">picture_as_pdf</span>
                                PDF — Chart only
                            </button>
                            <button onClick={() => handleExport('pdf', true)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[13px] transition-colors"
                                style={{ color: 'var(--ws-text)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--ws-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="material-symbols-outlined text-[16px] text-purple-400">summarize</span>
                                PDF — With summary
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Canvas Area — fills remaining height */}
            <div className="flex-1 relative" style={{ minHeight: '0' }}>
                {nodes.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40 relative z-10 dot-grid">
                        <span className="material-symbols-outlined text-[48px] mb-4" style={{ color: 'var(--ws-text-muted)' }}>account_tree</span>
                        <p className="text-[15px]" style={{ color: 'var(--ws-text-muted)' }}>Enter your code and click Convert to generate a flowchart.</p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        nodeTypes={nodeTypes}
                        connectionMode={ConnectionMode.Loose}
                        fitView
                        fitViewOptions={{ padding: 0.15 }}
                        minZoom={0.1}
                        maxZoom={2}
                        style={{ width: '100%', height: '100%', background: 'var(--ws-flow-bg)' }}
                        defaultEdgeOptions={{
                          style: { stroke: '#3b82f6', strokeWidth: 2 },
                          animated: true,
                        }}
                    >
                        <Background color="var(--ws-flow-grid)" gap={20} size={1} />
                        <Controls />
                        <MiniMap 
                            nodeStrokeColor="#3b82f6" 
                            nodeColor="var(--ws-flow-grid)" 
                            maskColor="rgba(0, 0, 0, 0.2)"
                            style={{ 
                                backgroundColor: 'var(--ws-panel)',
                                border: '1px solid var(--ws-border)',
                            }}
                        />
                    </ReactFlow>
                )}
            </div>
        </div>
    );
};

// Wrap with ReactFlowProvider so useReactFlow hook works
export const FlowCanvas: React.FC = () => (
    <ReactFlowProvider>
        <FlowCanvasInner />
    </ReactFlowProvider>
);
