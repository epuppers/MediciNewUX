import { FolderOpen, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { useChatStore } from "~/stores/chat-store";
import type { Thread } from "~/services/types";

/** Chat thread header — title + action buttons (Files, Export, Share) */
export function ChatHeader({ thread }: { thread: Thread }) {
  const openFilePanel = useChatStore((s) => s.openFilePanel);
  const hasFiles = !!thread.hasFiles;

  return (
    <div className="main-header">
      <span className="header-title">{thread.title}</span>
      <div className="header-actions">
        <Button
          variant="ghost"
          size="icon-sm"
          className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 icon-btn"
          disabled={!hasFiles}
          title="Files"
          aria-label="Files"
          data-label="Files"
          onClick={() => hasFiles && openFilePanel('folder')}
        >
          <FolderOpen size={14} />
          <span className="a11y-label">Files</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 icon-btn"
          title="Export"
          aria-label="Export"
          data-label="Export"
          onClick={() => toast("Thread exported to clipboard")}
        >
          <Download size={14} />
          <span className="a11y-label">Export</span>
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 icon-btn"
          title="Share"
          aria-label="Share"
          data-label="Share"
          onClick={() => toast("Share link copied")}
        >
          <Share2 size={14} />
          <span className="a11y-label">Share</span>
        </Button>
      </div>
    </div>
  );
}
