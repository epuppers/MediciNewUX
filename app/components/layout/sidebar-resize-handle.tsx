// ============================================
// SidebarResizeHandle — Drag handle between sidebar and main content
// ============================================

import { cn } from "~/lib/utils";
import { useIsMobile } from "~/hooks/use-mobile";
import { useUIStore } from "~/stores/ui-store";
import { useResizeSidebar } from "~/hooks/use-resize-sidebar";

/** Resize handle for dragging the sidebar width. Hidden when collapsed or on mobile. */
export function SidebarResizeHandle() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const dragState = useUIStore((s) => s.sidebarDragState);
  const isMobile = useIsMobile();
  const { handleMouseDown } = useResizeSidebar();

  if (sidebarCollapsed || isMobile) return null;

  return (
    <div
      className={cn(
        "resize-handle w-[5px] cursor-col-resize shrink-0 relative z-10 ml-[-3px] mr-[-2px]",
        dragState !== "idle" && "dragging"
      )}
      onMouseDown={handleMouseDown}
    />
  );
}
