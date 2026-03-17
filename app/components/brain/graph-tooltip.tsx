import { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { cn } from '~/lib/utils';

// ============================================
// Graph Tooltip — hover info above nodes
// ============================================

export interface TooltipHandle {
  show: (text: string, svgX: number, svgY: number) => void;
  hide: () => void;
}

interface TooltipState {
  text: string;
  x: number;
  y: number;
  visible: boolean;
}

interface GraphTooltipProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  viewBox: { x: number; y: number; w: number; h: number };
}

/** Tooltip that appears above graph nodes on hover. Uses SVG-to-screen coordinate mapping. */
export const GraphTooltip = forwardRef<TooltipHandle, GraphTooltipProps>(
  function GraphTooltip({ svgRef, viewBox }, ref) {
    const [state, setState] = useState<TooltipState>({
      text: '',
      x: 0,
      y: 0,
      visible: false,
    });

    const show = useCallback(
      (text: string, svgX: number, svgY: number) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svg.getBoundingClientRect();
        const scaleX = rect.width / viewBox.w;
        const scaleY = rect.height / viewBox.h;

        // Convert SVG coords to screen coords
        const screenX = rect.left + (svgX - viewBox.x) * scaleX;
        const screenY = rect.top + (svgY - viewBox.y) * scaleY - 40;

        // Clamp to viewport
        const clampedX = Math.max(60, Math.min(window.innerWidth - 60, screenX));

        setState({ text, x: clampedX, y: screenY, visible: true });
      },
      [svgRef, viewBox]
    );

    const hide = useCallback(() => {
      setState((prev) => ({ ...prev, visible: false }));
    }, []);

    useImperativeHandle(ref, () => ({ show, hide }), [show, hide]);

    return (
      <div
        className={cn(
          'absolute -translate-x-1/2 bg-[rgba(var(--surface-tooltip-rgb),0.92)] text-taupe-5 font-mono text-[0.6875rem] px-2.5 py-[5px] rounded-r-md pointer-events-none z-10 whitespace-nowrap backdrop-blur-[4px] border border-[rgba(var(--white-pure-rgb),0.08)] transition-[opacity,transform] duration-150 ease-out',
          state.visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-1'
        )}
        style={{
          left: state.x,
          top: state.y,
        }}
      >
        {state.text}
      </div>
    );
  }
);
