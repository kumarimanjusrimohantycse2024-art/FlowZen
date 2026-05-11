import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Node, Edge } from 'reactflow';

export interface ConversionHistory {
  id: string;
  filename: string;
  language: string;
  nodeCount: number;
  timestamp: number;
  code: string;
  nodes: Node[];
  edges: Edge[];
}

interface AppState {
  // Code Editor State
  code: string;
  setCode: (code: string) => void;
  
  // React Flow State
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nds: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((eds: Edge[]) => Edge[])) => void;
  
  // History State
  history: ConversionHistory[];
  addHistory: (record: Omit<ConversionHistory, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  loadHistory: (item: ConversionHistory) => void;
  
  // Theme State
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DEFAULT_CODE = `def calculate_discount(price, is_member):
    # Check membership status
    if is_member:
        discount = 0.20
    else:
        if price > 100:
            discount = 0.10
        else:
            discount = 0.0
            
    final_price = price - (price * discount)
    return final_price

result = calculate_discount(120, False)`;

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      code: DEFAULT_CODE,
      setCode: (code) => set({ code }),
      
      nodes: [],
      edges: [],
      setNodes: (nodes) => set((state) => ({ 
        nodes: typeof nodes === 'function' ? nodes(state.nodes) : nodes 
      })),
      setEdges: (edges) => set((state) => ({ 
        edges: typeof edges === 'function' ? edges(state.edges) : edges 
      })),
      
      history: [],
      addHistory: (record) => set((state) => ({
        history: [
          {
            ...record,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
          },
          ...state.history,
        ].slice(0, 50), // Keep last 50 items
      })),
      clearHistory: () => set({ 
        history: [], 
        code: DEFAULT_CODE, 
        nodes: [], 
        edges: [] 
      }),
      loadHistory: (item) => set({
        code: item.code,
        nodes: item.nodes,
        edges: item.edges,
      }),
      
      theme: 'dark',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
    }),
    {
      name: 'flowzen-storage',
    }
  )
);
