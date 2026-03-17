import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Citation } from '~/services/types';

// ============================================
// Citations — inline refs, footnotes, tooltip
// ============================================

// ------------------------------------------
// Footnotes — numbered source list below msg
// ------------------------------------------

interface FootnotesProps {
  citations: Citation[];
}

/** Renders a numbered list of citation sources below the message body */
export function Footnotes({ citations }: FootnotesProps) {
  return (
    <div className="mt-3 ml-[30px]">
      <div className="border-t border-taupe-2 mb-2 w-16" />
      <ol className="list-none p-0 m-0 space-y-0.5">
        {citations.map((cite) => (
          <li key={cite.id}>
            <a
              href={cite.url}
              target="_blank"
              rel="noopener noreferrer"
              className="footnote-link font-[family-name:var(--mono)] text-[10px] text-taupe-3 hover:text-violet-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 rounded-sm transition-colors no-underline"
              data-cite-id={cite.id}
            >
              [{cite.id}] {cite.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ------------------------------------------
// CitationTooltip — event-delegated hover tip
// ------------------------------------------

interface TooltipState {
  visible: boolean;
  text: string;
  x: number;
  y: number;
}

interface CitationTooltipProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  citations: Citation[];
}

/** Event-delegated tooltip for .cite-ref and .footnote-link elements */
export function CitationTooltip({ containerRef, citations }: CitationTooltipProps) {
  const [state, setState] = useState<TooltipState>({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });

  const findCitation = useCallback(
    (el: HTMLElement): Citation | undefined => {
      const id = el.getAttribute('data-cite-id');
      if (!id) return undefined;
      return citations.find((c) => c.id === Number(id));
    },
    [citations]
  );

  const show = useCallback(
    (el: HTMLElement) => {
      const cite = findCitation(el);
      if (!cite) return;

      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top - 6;

      setState({ visible: true, text: cite.title, x, y });
    },
    [findCitation]
  );

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function getTarget(e: Event): HTMLElement | null {
      const target = e.target as HTMLElement;
      if (target.matches('.cite-ref, .footnote-link')) return target;
      return target.closest('.cite-ref, .footnote-link') as HTMLElement | null;
    }

    function onOver(e: Event) {
      const el = getTarget(e);
      if (el) show(el);
    }

    function onOut(e: Event) {
      const el = getTarget(e);
      if (el) hide();
    }

    container.addEventListener('mouseover', onOver);
    container.addEventListener('mouseout', onOut);
    container.addEventListener('focusin', onOver);
    container.addEventListener('focusout', onOut);

    return () => {
      container.removeEventListener('mouseover', onOver);
      container.removeEventListener('mouseout', onOut);
      container.removeEventListener('focusin', onOver);
      container.removeEventListener('focusout', onOut);
    };
  }, [containerRef, show, hide]);

  if (!state.visible) return null;

  return createPortal(
    <div
      className="fixed z-50 px-2.5 py-1 rounded-[var(--r-md)] bg-taupe-5 text-off-white text-xs font-[family-name:var(--mono)] shadow-md pointer-events-none max-w-[240px] whitespace-nowrap overflow-hidden text-ellipsis"
      style={{
        left: state.x,
        top: state.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      {state.text}
    </div>,
    document.body
  );
}

// ------------------------------------------
// useCitationClick — open URL on click
// ------------------------------------------

/** Event-delegated click handler for .cite-ref <sup> elements */
export function useCitationClick(
  containerRef: React.RefObject<HTMLDivElement | null>,
  citations: Citation[]
) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const citeEl = target.matches('.cite-ref')
        ? target
        : target.closest('.cite-ref');

      if (!citeEl) return;

      const id = citeEl.getAttribute('data-cite-id');
      if (!id) return;

      const cite = citations.find((c) => c.id === Number(id));
      if (cite) {
        window.open(cite.url, '_blank', 'noopener,noreferrer');
      }
    }

    container.addEventListener('click', onClick);
    return () => container.removeEventListener('click', onClick);
  }, [containerRef, citations]);
}
