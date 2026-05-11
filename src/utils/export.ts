import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useStore } from '../store/useStore';

const getFlowElement = () => document.querySelector('.react-flow') as HTMLElement;

const getNodeSummary = (): string => {
  const state = useStore.getState();
  const nodes = state.nodes;
  if (!nodes.length) return '';
  
  const lines = ['FlowZen — Flowchart Summary', '═'.repeat(40), ''];
  nodes.forEach((node, i) => {
    const type = node.type === 'terminal' ? '⬤ Terminal' 
      : node.type === 'condition' ? '◆ Condition' 
      : '■ Action';
    lines.push(`${i + 1}. [${type}] ${node.data?.label || 'Unnamed'}`);
    if (node.data?.info) lines.push(`   → ${node.data.info}`);
  });
  lines.push('', `Total: ${nodes.length} nodes, ${state.edges.length} connections`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  return lines.join('\n');
};

const captureOptions = {
  backgroundColor: '#0d1117',
  pixelRatio: 2,
  filter: (node: any) => {
    if (
      node?.classList?.contains('react-flow__minimap') ||
      node?.classList?.contains('react-flow__controls')
    ) return false;
    return true;
  },
};

export const downloadImage = async (withInfo = false) => {
  const element = getFlowElement();
  if (!element) return;

  try {
    const dataUrl = await toPng(element, captureOptions);
    
    if (!withInfo) {
      // Direct download
      const a = document.createElement('a');
      a.setAttribute('download', 'flowzen-chart.png');
      a.setAttribute('href', dataUrl);
      a.click();
    } else {
      // Draw chart + summary text onto a canvas
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => { img.onload = resolve; });

      const summary = getNodeSummary();
      const summaryLines = summary.split('\n');
      const lineHeight = 20;
      const padding = 40;
      const summaryHeight = summaryLines.length * lineHeight + padding * 2;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height + summaryHeight;
      const ctx = canvas.getContext('2d')!;

      // Background
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Chart
      ctx.drawImage(img, 0, 0);

      // Divider
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, img.height + 10);
      ctx.lineTo(canvas.width - padding, img.height + 10);
      ctx.stroke();

      // Summary text
      ctx.fillStyle = '#c9d1d9';
      ctx.font = '14px "JetBrains Mono", monospace';
      summaryLines.forEach((line, i) => {
        if (i === 0) {
          ctx.fillStyle = '#58a6ff';
          ctx.font = 'bold 16px "JetBrains Mono", monospace';
        } else {
          ctx.fillStyle = '#8b949e';
          ctx.font = '13px "JetBrains Mono", monospace';
        }
        ctx.fillText(line, padding, img.height + padding + i * lineHeight);
      });

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.download = 'flowzen-chart-with-info.png';
        a.href = url;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error('[FlowZen DEV] Export image error:', error);
  }
};

export const downloadPDF = async (withInfo = false) => {
  const element = getFlowElement();
  if (!element) return;

  try {
    const dataUrl = await toPng(element, captureOptions);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [element.offsetWidth, element.offsetHeight + (withInfo ? 300 : 0)]
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, element.offsetWidth, element.offsetHeight);

    if (withInfo) {
      const summary = getNodeSummary();
      const lines = summary.split('\n');
      let y = element.offsetHeight + 30;

      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(88, 166, 255); // blue
      pdf.text(lines[0] || '', 30, y);
      y += 20;

      // Body
      pdf.setFont('courier', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(139, 148, 158); // gray
      for (let i = 2; i < lines.length; i++) {
        pdf.text(lines[i], 30, y);
        y += 16;
      }
    }

    pdf.save(withInfo ? 'flowzen-chart-with-info.pdf' : 'flowzen-chart.pdf');
  } catch (error) {
    if (import.meta.env.DEV) console.error('[FlowZen DEV] Export PDF error:', error);
  }
};
