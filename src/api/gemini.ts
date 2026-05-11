import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// ────────────────────────────────────────────────
// Config — VITE_ vars are bundled client-side.
// TODO: In production, route through a backend proxy
// so the key is NEVER exposed in the client bundle.
// ────────────────────────────────────────────────
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const getAI = () => new GoogleGenAI({ apiKey: apiKey || 'MISSING' });

// ── Rate limiting ──
const RATE_LIMIT_MS = 3000; // 3 seconds between calls
let lastCallTimestamp = 0;

// ── Input constraints ──
const MAX_CODE_LENGTH = 10_000; // 10K characters max

// ── Zod schema for strict AI output validation ──
const NodeDataSchema = z.object({
  label: z.string().min(1).max(200),
  info: z.string().max(500).optional(),
});

const NodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['terminal', 'condition', 'action']),
  position: z.object({ x: z.number(), y: z.number() }),
  data: NodeDataSchema,
});

const EdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().optional(),
  label: z.string().optional(),
});

const FlowchartSchema = z.object({
  nodes: z.array(NodeSchema).min(1).max(100),
  edges: z.array(EdgeSchema).max(200),
});

const SYSTEM_INSTRUCTION = `You are an expert software engineer and architect.
Your task is to analyze the provided code and generate a JSON representation of a flowchart.
The flowchart must use React Flow nodes and edges.
Node Types available: 'terminal' (Start/End), 'condition' (if/else statements, comparisons), 'action' (operations, variable assignments, function calls).
Each node's data object MUST contain:
- "label": A short label text for the node.
- "info": A 1-2 sentence description explaining what this node does in the context of the code.

You must return a valid JSON object strictly matching this schema:
{
  "nodes": [
    { "id": "1", "type": "terminal", "position": { "x": 250, "y": 0 }, "data": { "label": "Start: main()", "info": "Entry point of the program." } },
    { "id": "2", "type": "condition", "position": { "x": 250, "y": 150 }, "data": { "label": "x > 10?", "info": "Checks whether the value of x exceeds 10." } },
    { "id": "3", "type": "action", "position": { "x": 100, "y": 300 }, "data": { "label": "process()", "info": "Calls the process function to handle the data." } }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" },
    { "id": "e2-3", "source": "2", "target": "3", "sourceHandle": "true" }
  ]
}
For 'condition' nodes, use sourceHandle "true" or "false" for outgoing edges.
Ensure the layout (x, y positions) makes logical sense, flowing top to bottom.
- Use y increments of ~150-200px between rows.
- Use x offsets of ~250px for branches.
- Keep the flow centered horizontally around x=350.
Return ONLY valid JSON. Do not wrap in markdown \`\`\` blocks.`;

export const generateFlowchart = async (code: string) => {
  // ── Guard: API key ──
  if (!apiKey || apiKey === 'MISSING') {
    throw new Error('API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  // ── Guard: Rate limit ──
  const now = Date.now();
  const elapsed = now - lastCallTimestamp;
  if (elapsed < RATE_LIMIT_MS) {
    const waitSec = ((RATE_LIMIT_MS - elapsed) / 1000).toFixed(1);
    throw new Error(`Please wait ${waitSec}s before converting again.`);
  }

  // ── Guard: Input validation ──
  const trimmedCode = code.trim();
  if (!trimmedCode) {
    throw new Error('Please enter some code before converting.');
  }
  if (trimmedCode.length > MAX_CODE_LENGTH) {
    throw new Error(`Code exceeds the ${MAX_CODE_LENGTH.toLocaleString()} character limit. Please shorten your input.`);
  }

  lastCallTimestamp = now;
  const ai = getAI();
  const models = ['gemini-3.1-flash-lite', 'gemma-4-31b'];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: `Generate a React Flow JSON for this code:\n\n${trimmedCode}` }] }
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });
      
      const responseText = response.text;
      if (!responseText) throw new Error('Empty model response');
      
      // ── Clean markdown fences if present ──
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();
      
      // ── Parse + validate with Zod ──
      const raw = JSON.parse(jsonStr);
      const validated = FlowchartSchema.parse(raw);
      return validated;

    } catch (error) {
      // Don't expose model names or internal details to the user
      if (import.meta.env.DEV) {
        console.warn(`[FlowZen DEV] Model ${model} failed:`, error);
      }
      if (i === models.length - 1) {
        // Generic user-facing error
        throw new Error('Failed to generate the flowchart. Please check your code and try again.');
      }
    }
  }
};

// ── Book examples — pre-built code snippets ──
export const BOOK_EXAMPLES: { title: string; language: string; code: string }[] = [
  {
    title: 'Binary Search',
    language: 'Python',
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    
    return -1`,
  },
  {
    title: 'Fizz Buzz',
    language: 'JavaScript',
    code: `function fizzBuzz(n) {
  for (let i = 1; i <= n; i++) {
    if (i % 15 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}`,
  },
  {
    title: 'Bubble Sort',
    language: 'Python',
    code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
  },
  {
    title: 'Authentication Flow',
    language: 'JavaScript',
    code: `function authenticate(user) {
  if (!user) {
    return { status: "error", message: "No user provided" };
  }
  
  if (!user.email || !user.password) {
    return { status: "error", message: "Missing credentials" };
  }
  
  if (user.isLocked) {
    return { status: "locked", message: "Account is locked" };
  }
  
  if (verifyPassword(user.password)) {
    return { status: "success", token: generateToken(user) };
  } else {
    return { status: "error", message: "Invalid password" };
  }
}`,
  },
  {
    title: 'Fibonacci',
    language: 'Python',
    code: `def fibonacci(n):
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    else:
        a, b = 0, 1
        for i in range(2, n + 1):
            a, b = b, a + b
        return b`,
  },
];
