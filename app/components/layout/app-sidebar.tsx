import { Link, useLocation } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  Brain,
  BookOpen,
  Network,
} from "lucide-react";
import { LogoMark } from "~/components/layout/logo";
import { useUIStore } from "~/stores/ui-store";
import { ThreadList } from "~/components/chat/thread-list";
import type { Thread, WorkflowRun } from "~/services/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  useSidebar,
} from "~/components/ui/sidebar";

// ======== Sidebar Toggle Button ========

/** Toggle button to collapse/expand the sidebar */
function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <button
      onClick={toggleSidebar}
      aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      className="ml-auto flex size-[22px] items-center justify-center rounded-[var(--r-sm)] border border-transparent bg-transparent text-[var(--taupe-3)] transition-all hover:border-[var(--taupe-2)] hover:bg-[rgba(var(--violet-3-rgb),0.08)] hover:text-[var(--violet-3)] active:bg-[rgba(var(--violet-3-rgb),0.14)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] focus-visible:outline-offset-1 dark:hover:border-[var(--taupe-3)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:active:bg-[rgba(var(--violet-3-rgb),0.2)]"
    >
      {isCollapsed ? <ChevronRight className="size-3.5" /> : <ChevronLeft className="size-3.5" />}
    </button>
  );
}

// ======== Logo Row ========

/** Logo area: spheres + title text + collapse toggle */
function LogoRow() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <div className="flex items-center gap-2">
      <LogoMark />
      {!isCollapsed && (
        <>
          <div className="min-w-0 flex-1 overflow-hidden whitespace-nowrap">
            <div className="font-[family-name:var(--pixel)] text-[22px] leading-none tracking-[1px] text-[var(--taupe-1)] [text-shadow:1px_1px_0_rgba(0,0,0,0.4)] dark:text-[var(--taupe-5)] dark:[text-shadow:1px_1px_0_rgba(0,0,0,0.6)]">
              COSIMO
            </div>
            <div className="mt-px font-[family-name:var(--mono)] text-[9px] tracking-[0.1em] text-[var(--taupe-3)]">
              MEDICI &amp; COMPANY
            </div>
          </div>
          <SidebarToggle />
        </>
      )}
    </div>
  );
}

// ======== Brain Nav Section ========

/** Brain navigation buttons in the sidebar footer */
function BrainNav() {
  const brainNavCollapsed = useUIStore((s) => s.brainNavCollapsed);
  const toggleBrainNav = useUIStore((s) => s.toggleBrainNav);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();

  const brainItems = [
    { label: "Memory", icon: Brain, path: "/brain/memory" },
    { label: "Lessons", icon: BookOpen, path: "/brain/lessons" },
    { label: "Graphs", icon: Network, path: "/brain/graph" },
  ] as const;

  if (isCollapsed) {
    return null;
  }

  return (
    <SidebarGroup className="p-2">
      <div className="flex items-center justify-between px-2">
        <div className="font-[family-name:var(--mono)] text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--taupe-3)]">
          Brain
        </div>
        <button
          onClick={toggleBrainNav}
          aria-label={brainNavCollapsed ? "Expand Brain nav" : "Collapse Brain nav"}
          className="flex size-[22px] items-center justify-center rounded-[var(--r-sm)] border border-transparent bg-transparent text-[var(--taupe-3)] hover:border-[var(--taupe-2)] hover:bg-[rgba(var(--violet-3-rgb),0.08)] hover:text-[var(--violet-3)]"
        >
          {brainNavCollapsed ? (
            <ChevronUp className="size-3" />
          ) : (
            <ChevronDown className="size-3" />
          )}
        </button>
      </div>
      {!brainNavCollapsed && (
        <SidebarGroupContent>
          <SidebarMenu>
            {brainItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  tooltip={item.label}
                  render={<Link to={item.path} />}
                  size="sm"
                  className="font-[family-name:var(--mono)] text-[10px] text-[var(--taupe-3)] hover:bg-[rgba(var(--white-pure-rgb),0.04)] hover:text-[var(--taupe-1)] data-active:border data-active:border-solid data-active:border-[var(--chinese-3)] data-active:bg-[var(--chinese-4)] data-active:text-[var(--taupe-1)]"
                >
                  <item.icon className="size-3.5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}

// ======== Main Sidebar Component ========

/** Props for the AppSidebar */
interface AppSidebarProps {
  /** Threads to display in the sidebar list */
  threads?: Thread[];
  /** Workflow runs keyed by runId, for status indicators */
  runs?: Record<string, WorkflowRun>;
}

/** Application sidebar — logo, search, new button, thread list, brain nav */
export function AppSidebar({ threads, runs }: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[var(--surface-1)] dark:border-[var(--surface-0)]"
    >
      {/* Logo area */}
      <SidebarHeader className="px-3 pt-3.5 pb-3">
        <LogoRow />
        {isCollapsed && (
          <div className="flex justify-center">
            <SidebarToggle />
          </div>
        )}
        {/* Search + New button — inside header like the original */}
        {!isCollapsed && (
          <div className="mt-2.5">
            <button className="sidebar-new-btn">
              <Plus className="size-3.5" />
              New Thread
            </button>
            <div className="relative mt-2.5">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)]" />
              <input
                type="text"
                placeholder="Search..."
                className="sidebar-search-input"
              />
            </div>
          </div>
        )}
      </SidebarHeader>

      {/* Thread list area */}
      <SidebarContent>
        <SidebarGroup className="flex-1 px-1.5">
          {!isCollapsed && (
            <div className="sidebar-section-label">Recent</div>
          )}
          <SidebarGroupContent>
            {threads && threads.length > 0 ? (
              <ThreadList threads={threads} runs={runs} />
            ) : (
              <div className="px-2 py-1 font-[family-name:var(--mono)] text-xs text-[var(--taupe-3)]">
                {isCollapsed ? "" : "No threads yet"}
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Brain navigation */}
      <SidebarFooter className="p-0">
        <BrainNav />
      </SidebarFooter>
    </Sidebar>
  );
}

// ======== Sidebar Wrapper ========

/** Wraps the app with SidebarProvider, connecting shadcn sidebar state to UIStore */
export function AppSidebarProvider({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <SidebarProvider
      open={!sidebarCollapsed}
      onOpenChange={(open) => {
        // Only toggle if the state actually differs
        if (open === sidebarCollapsed) {
          toggleSidebar();
        }
      }}
    >
      {children}
    </SidebarProvider>
  );
}
