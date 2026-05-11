import type React from 'react';
import { useStore } from '../store/useStore';
import { useMemo } from 'react';

// Escape HTML entities
const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Simple token-based syntax highlighter
const highlightLine = (rawLine: string): string => {
  const tokens: { type: string; text: string }[] = [];
  let i = 0;
  const line = rawLine;

  while (i < line.length) {
    // Comments: # (Python) or // (JS)
    if (line[i] === '#' || (line[i] === '/' && line[i + 1] === '/')) {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // Strings: single or double quoted
    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== quote) {
        if (line[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', text: line.slice(i, j + 1) });
      i = j + 1;
      continue;
    }

    // Numbers
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d.]/.test(line[j])) j++;
      tokens.push({ type: 'number', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /\w/.test(line[j])) j++;
      const word = line.slice(i, j);

      const afterWord = line.slice(j).trimStart();
      const isFunc = afterWord.startsWith('(');

      const keywords = new Set([
        'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from',
        'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda', 'pass', 'break',
        'continue', 'and', 'or', 'not', 'in', 'is', 'raise', 'del', 'global', 'nonlocal',
        'function', 'const', 'let', 'var', 'export', 'new', 'this', 'async', 'await',
        'catch', 'throw', 'switch', 'case', 'default', 'typeof', 'instanceof', 'void',
      ]);

      const builtins = new Set([
        'True', 'False', 'None', 'print', 'self', 'len', 'range', 'int', 'str', 'float',
        'list', 'dict', 'set', 'tuple', 'type', 'super', 'map', 'filter', 'zip',
        'true', 'false', 'null', 'undefined', 'console', 'Math', 'Array', 'Object',
        'String', 'Number', 'Boolean', 'Promise', 'JSON', 'window', 'document',
      ]);

      if (keywords.has(word)) {
        tokens.push({ type: 'keyword', text: word });
      } else if (builtins.has(word)) {
        tokens.push({ type: 'builtin', text: word });
      } else if (isFunc) {
        tokens.push({ type: 'func', text: word });
      } else {
        tokens.push({ type: 'plain', text: word });
      }
      i = j;
      continue;
    }

    // Operators
    if ('=!<>+-*/%&|^~'.includes(line[i])) {
      let j = i;
      while (j < line.length && '=!<>+-*/%&|^~'.includes(line[j])) j++;
      tokens.push({ type: 'op', text: line.slice(i, j) });
      i = j;
      continue;
    }

    // Everything else
    tokens.push({ type: 'plain', text: line[i] });
    i++;
  }

  return tokens.map(t => {
    const escaped = escapeHtml(t.text);
    switch (t.type) {
      case 'keyword': return `<span class="syn-keyword">${escaped}</span>`;
      case 'builtin': return `<span class="syn-builtin">${escaped}</span>`;
      case 'string': return `<span class="syn-string">${escaped}</span>`;
      case 'comment': return `<span class="syn-comment">${escaped}</span>`;
      case 'number': return `<span class="syn-number">${escaped}</span>`;
      case 'func': return `<span class="syn-func">${escaped}</span>`;
      case 'op': return `<span class="syn-op">${escaped}</span>`;
      default: return escaped;
    }
  }).join('');
};

const highlightCode = (code: string): string => {
  return code.split('\n').map(highlightLine).join('\n');
};

export const CodeEditor: React.FC = () => {
  const { code, setCode } = useStore();
  const lineCount = code.split('\n').length;
  const highlighted = useMemo(() => highlightCode(code), [code]);

  return (
    <div
      className="flex flex-col rounded-lg border overflow-hidden shadow-sm h-full transition-colors duration-200"
      style={{ borderColor: 'var(--ws-border)' }}
    >
        {/* Title bar */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200"
          style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
        >
            <span className="text-[13px] font-medium font-code-base" style={{ color: 'var(--ws-text-secondary)' }}>input.py</span>
            <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                <div className="w-3 h-3 rounded-full bg-[#febc2e]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
            </div>
        </div>

        {/* Editor body */}
        <div
          className="flex-1 flex overflow-hidden relative min-h-[300px] transition-colors duration-200"
          style={{ backgroundColor: 'var(--ws-editor-bg)' }}
        >
            {/* Line numbers */}
            <div
              className="w-12 py-4 flex flex-col items-end pr-3 border-r font-code-base text-code-base select-none shrink-0 leading-[22px] transition-colors duration-200"
              style={{ backgroundColor: 'var(--ws-editor-gutter)', borderColor: 'var(--ws-border)', color: 'var(--ws-editor-line-nr)' }}
            >
                {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                    <span key={i}>{i + 1}</span>
                ))}
            </div>

            {/* Overlaid syntax highlighting + editable textarea */}
            <div className="flex-1 relative overflow-auto">
              {/* Highlighted layer */}
              <pre
                className="absolute inset-0 p-4 font-code-base text-code-base pointer-events-none whitespace-pre-wrap break-words leading-[22px] m-0"
                style={{ color: 'var(--ws-editor-text)' }}
                aria-hidden="true"
                dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
              />
              {/* Editable transparent layer */}
              <textarea
                  className="relative w-full h-full p-4 font-code-base text-code-base text-transparent bg-transparent resize-none focus:outline-none whitespace-pre-wrap break-words leading-[22px] min-h-full"
                  style={{ caretColor: 'var(--ws-editor-caret)' }}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
              />
            </div>
        </div>

        {/* Status bar */}
        <div
          className="px-4 py-1.5 border-t flex items-center gap-2 transition-colors duration-200"
          style={{ backgroundColor: 'var(--ws-panel)', borderColor: 'var(--ws-border)' }}
        >
            <span className="material-symbols-outlined text-[14px] text-emerald-500">check_circle</span>
            <span className="text-[12px] font-code-base" style={{ color: 'var(--ws-text-secondary)' }}>Ready</span>
            <span className="ml-auto text-[11px] font-code-base" style={{ color: 'var(--ws-text-muted)' }}>
              Ln {lineCount}, Col {(code.split('\n').pop()?.length || 0) + 1}
            </span>
        </div>
    </div>
  );
};
