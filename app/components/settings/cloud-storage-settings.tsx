import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, Calendar, Check, ChevronDown, ChevronRight, Copy, FolderOpen, Globe, Loader2, Mail, Plus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Switch } from '~/components/ui/switch';
import { cn } from '~/lib/utils';
import { getCloudStorageSettings } from '~/services/cloud-storage';
import { MOCK_SHAREPOINT_SEARCH_RESULTS } from '~/data/mock-cloud-storage';
import type { CloudStorageSettings as CloudStorageSettingsType, CloudProvider, SharePointSite } from '~/services/types';

// ============================================
// Props
// ============================================

interface CloudStorageSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ============================================
// Provider Card Sub-component
// ============================================

/** Header icon for a provider — colored circle with initials */
function ProviderIcon({ provider }: { provider: CloudProvider }) {
  const bgClass = provider.type === 'microsoft' ? 'bg-violet-3' : 'bg-blue-3';
  const initials = provider.type === 'microsoft' ? 'SP' : 'GD';
  return (
    <div
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
        bgClass
      )}
    >
      <span className="font-mono text-[0.625rem] font-bold text-white">
        {initials}
      </span>
    </div>
  );
}

/** Inline type-to-confirm disconnect panel */
function DisconnectConfirm({
  providerName,
  onConfirm,
  onCancel,
}: {
  providerName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmPhrase = 'disconnect';
  const [confirmInput, setConfirmInput] = useState('');
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isMatch = confirmInput.toLowerCase().trim() === confirmPhrase.toLowerCase();
  const hasPartialInput = confirmInput.length > 0 && !isMatch;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleDisconnect = () => {
    if (!isMatch) return;
    setIsDisconnecting(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  // Processing state — centered spinner
  if (isDisconnecting) {
    return (
      <div className="mt-3 rounded-[var(--r-sm)] border border-red/20 bg-[rgba(var(--red-rgb),0.04)] dark:bg-[rgba(var(--red-rgb),0.08)]">
        <div className="flex flex-col items-center gap-2 py-6">
          <Loader2 className="h-5 w-5 animate-spin text-red" />
          <span className="font-mono text-[0.625rem] text-red">
            Disconnecting {providerName}…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-[var(--r-sm)] border border-red/20 bg-[rgba(var(--red-rgb),0.04)] dark:bg-[rgba(var(--red-rgb),0.08)]">
      {/* Warning banner */}
      <div className="flex gap-2.5 border-b border-red/10 px-3 py-2.5 dark:border-red/15">
        <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-red" />
        <p className="font-mono text-[0.625rem] leading-relaxed text-taupe-5 dark:text-taupe-2">
          This will disconnect {providerName} from Cosimo. All synced files and data scopes will become unavailable.
        </p>
      </div>

      {/* Confirm input area */}
      <div className="px-3 pb-3 pt-2.5">
        {/* Label with inline phrase */}
        <div className="mb-1.5 flex items-baseline gap-1.5">
          <span className="font-mono text-[0.5625rem] text-taupe-3">
            Type
          </span>
          <span className="select-all rounded-[var(--r-xs)] bg-taupe-1 px-1.5 py-0.5 font-mono text-[0.625rem] font-semibold text-red dark:bg-surface-1">
            {confirmPhrase}
          </span>
          <span className="font-mono text-[0.5625rem] text-taupe-3">
            to confirm
          </span>
        </div>

        {/* Beveled input */}
        <input
          ref={inputRef}
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder={confirmPhrase}
          className={cn(
            'w-full bg-off-white py-[7px] px-2.5 font-mono text-xs text-taupe-5',
            'border-2 border-b-taupe-1 border-l-taupe-3 border-r-taupe-1 border-t-taupe-3',
            'rounded-none outline-none transition-colors',
            'dark:bg-surface-2 dark:border-surface-0 dark:border-b-surface-3 dark:border-r-surface-3 dark:text-taupe-2',
            'placeholder:text-taupe-3/40',
            hasPartialInput && 'border-red/50 dark:border-red/50',
            isMatch && 'border-green/50 dark:border-green/50'
          )}
        />

        {/* Actions row */}
        <div className="mt-2.5 flex items-center justify-end gap-2">
          {/* Cancel — secondary beveled button */}
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'rounded-[var(--r-md)] border bg-taupe-1 px-3 py-[5px] font-mono text-[0.625rem] font-semibold text-taupe-4',
              'border-b-taupe-3 border-l-white border-r-taupe-3 border-t-white',
              'cursor-pointer transition-all duration-100 hover:bg-berry-1',
              'active:border-b-white active:border-l-taupe-3 active:border-r-white active:border-t-taupe-3',
              'dark:bg-surface-2 dark:text-taupe-3 dark:border-taupe-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
          >
            Cancel
          </button>

          {/* Disconnect — destructive beveled button */}
          <button
            type="button"
            disabled={!isMatch}
            onClick={handleDisconnect}
            className={cn(
              'rounded-[var(--r-md)] border px-3 py-[5px] font-mono text-[0.625rem] font-semibold',
              'transition-all duration-100',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
              isMatch
                ? [
                    'cursor-pointer bg-red text-white',
                    'border-b-[var(--red-lo)] border-l-[var(--red-hi)] border-r-[var(--red-lo)] border-t-[var(--red-hi)]',
                    'hover:bg-[var(--red-hi)]',
                    'active:border-b-[var(--red-hi)] active:border-l-[var(--red-lo)] active:border-r-[var(--red-hi)] active:border-t-[var(--red-lo)]',
                  ]
                : 'cursor-not-allowed border-taupe-2 bg-taupe-1 text-taupe-3 opacity-50 dark:border-surface-3 dark:bg-surface-3'
            )}
          >
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );
}

/** Multi-step SharePoint connect flow shown when disconnected */
function SharePointConnectFlow({ onConnect }: { onConnect: () => void }) {
  const [step, setStep] = useState<'prompt' | 'login' | 'authenticating' | 'success'>('prompt');

  useEffect(() => {
    if (step === 'authenticating') {
      const timer = setTimeout(() => setStep('success'), 1500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  if (step === 'prompt') {
    return (
      <div className="mt-3 space-y-3">
        <p className="font-mono text-[0.625rem] leading-relaxed text-taupe-3">
          SharePoint is not connected to this entity.
        </p>
        <button
          type="button"
          onClick={() => setStep('login')}
          className={cn(
            'w-full rounded-[var(--r-pill)] bg-violet-3 py-2 font-mono text-[0.6875rem] font-semibold text-white',
            'border-none cursor-pointer transition-all duration-100 hover:bg-violet-4',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
          )}
        >
          Connect to SharePoint
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="rounded-[var(--r-sm)] border border-taupe-2 bg-white p-4 dark:border-surface-3 dark:bg-surface-1">
        {step === 'login' && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--r-xs)] bg-violet-3">
                <span className="font-mono text-[0.5rem] font-bold text-white">MS</span>
              </div>
              <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-2">
                Microsoft Sign-In
              </span>
            </div>

            {/* Mock email input */}
            <div className="space-y-1">
              <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
                Account
              </span>
              <input
                type="text"
                readOnly
                value="admin@acmecorp.onmicrosoft.com"
                className={cn(
                  'w-full bg-off-white py-[7px] px-2.5 font-mono text-xs text-taupe-5',
                  'border-2 border-b-taupe-1 border-l-taupe-3 border-r-taupe-1 border-t-taupe-3',
                  'rounded-none outline-none',
                  'dark:bg-surface-2 dark:border-surface-0 dark:border-b-surface-3 dark:border-r-surface-3 dark:text-taupe-2'
                )}
              />
            </div>

            <p className="font-mono text-[0.625rem] italic text-taupe-3">
              You&apos;ll be redirected to Microsoft to authorize access.
            </p>

            {/* Sign in button */}
            <button
              type="button"
              onClick={() => setStep('authenticating')}
              className={cn(
                'w-full rounded-[var(--r-sm)] bg-violet-3 py-1.5 font-mono text-[0.6875rem] font-semibold text-white',
                'border-none cursor-pointer transition-all duration-100 hover:bg-violet-4',
                'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
              )}
            >
              Sign in
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => setStep('prompt')}
              className={cn(
                'w-full bg-transparent border-none cursor-pointer font-mono text-[0.625rem] text-taupe-3 transition-all duration-100',
                'hover:text-taupe-5 dark:hover:text-taupe-2',
                'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
              )}
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'authenticating' && (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="h-5 w-5 animate-spin text-violet-3" />
            <span className="font-mono text-[0.625rem] text-taupe-3">
              Authenticating with Microsoft…
            </span>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-3">
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(var(--green-rgb),0.1)]">
                <Check className="h-4 w-4 text-green" />
              </div>
              <span className="text-center font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-2">
                Successfully connected to Acme Corp&apos;s SharePoint.
              </span>
            </div>
            <button
              type="button"
              onClick={onConnect}
              className={cn(
                'w-full rounded-[var(--r-sm)] bg-violet-3 py-1.5 font-mono text-[0.6875rem] font-semibold text-white',
                'border-none cursor-pointer transition-all duration-100 hover:bg-violet-4',
                'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
              )}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/** SharePoint expanded content — sites with library toggles */
function SharePointContent({
  sites,
  onAddSite,
  onDisconnect,
}: {
  sites: SharePointSite[];
  onAddSite: (site: SharePointSite) => void;
  onDisconnect: () => void;
}) {
  const [libraryStates, setLibraryStates] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const site of sites) {
        for (const lib of site.libraries) {
          initial[lib.id] = lib.enabled;
        }
      }
      return initial;
    }
  );
  const [expandedSites, setExpandedSites] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const site of sites) {
        initial[site.id] = true;
      }
      return initial;
    }
  );

  // Disconnect confirm state
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Site search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    if (searchQuery === '') {
      setDebouncedQuery('');
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Auto-focus search input when shown
  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
    }
  }, [showSearch]);

  // Derive search results
  const connectedSiteIds = new Set(sites.map((s) => s.id));
  const searchResults =
    debouncedQuery === ''
      ? []
      : MOCK_SHAREPOINT_SEARCH_RESULTS.filter(
          (s) =>
            s.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            s.url.toLowerCase().includes(debouncedQuery.toLowerCase())
        );

  const handleCloseSearch = () => {
    setShowSearch(false);
    setSearchQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  };

  const handleSelectSite = (site: SharePointSite) => {
    if (connectedSiteIds.has(site.id)) return;
    onAddSite(site);
    // Expand the newly added site
    setExpandedSites((prev) => ({ ...prev, [site.id]: true }));
    // Initialize library states for the new site
    const newLibStates: Record<string, boolean> = {};
    for (const lib of site.libraries) {
      newLibStates[lib.id] = lib.enabled;
    }
    setLibraryStates((prev) => ({ ...prev, ...newLibStates }));
    handleCloseSearch();
  };

  return (
    <div className="mt-3 space-y-3">
      {sites.map((site) => (
        <div
          key={site.id}
          className="rounded-[var(--r-sm)] border border-taupe-2 bg-white p-3 dark:border-surface-3 dark:bg-surface-1"
        >
          {/* Site header */}
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between bg-transparent border-none cursor-pointer text-left transition-all duration-100',
              'rounded-[var(--r-sm)] hover:bg-[rgba(var(--violet-3-rgb),0.05)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)]',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
            onClick={() =>
              setExpandedSites((prev) => ({
                ...prev,
                [site.id]: !prev[site.id],
              }))
            }
          >
            <div>
              <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-2">
                {site.name}
              </span>
              <span className="ml-2 font-mono text-[0.625rem] text-taupe-3">
                {site.libraries.length} libraries
              </span>
            </div>
            {expandedSites[site.id] ? (
              <ChevronDown className="h-3.5 w-3.5 text-taupe-3" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-taupe-3" />
            )}
          </button>

          {/* Site URL */}
          <p className="mt-0.5 font-mono text-[0.625rem] text-taupe-3">
            {site.url}
          </p>

          {/* Libraries */}
          {expandedSites[site.id] && (
            <div className="mt-2.5 space-y-1.5">
              {site.libraries.map((lib) => (
                <div
                  key={lib.id}
                  className="flex items-center justify-between py-1"
                >
                  <span className="font-mono text-[0.6875rem] text-taupe-4 dark:text-taupe-3">
                    {lib.name}
                  </span>
                  <Switch
                    size="sm"
                    checked={libraryStates[lib.id] ?? lib.enabled}
                    onCheckedChange={(checked: boolean) =>
                      setLibraryStates((prev) => ({
                        ...prev,
                        [lib.id]: checked,
                      }))
                    }
                  />
                </div>
              ))}

              {/* Remove site link */}
              <button
                type="button"
                className={cn(
                  'mt-1 bg-transparent border-none cursor-pointer font-mono text-[0.625rem] text-taupe-3 transition-all duration-100 hover:text-red',
                  'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
                )}
              >
                Remove site
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add site / Search */}
      {!showSearch ? (
        <button
          type="button"
          className={cn(
            'flex items-center gap-1.5 bg-transparent border-none cursor-pointer font-mono text-[0.6875rem] text-violet-3 transition-all duration-100 hover:text-violet-4',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
          )}
          onClick={() => setShowSearch(true)}
        >
          <Plus className="h-3 w-3" />
          Add site
        </button>
      ) : (
        <div className="rounded-[var(--r-sm)] border border-taupe-2 bg-white dark:border-surface-3 dark:bg-surface-1">
          {/* Beveled search input — matches SearchFilterBar retro style */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-taupe-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search SharePoint sites…"
              className={cn(
                'w-full bg-off-white py-[7px] pl-[30px] pr-[32px] font-mono text-xs text-taupe-5',
                'border-2 border-b-taupe-1 border-l-taupe-3 border-r-taupe-1 border-t-taupe-3',
                'rounded-none outline-none transition-colors',
                'focus:border-violet-3',
                'dark:bg-surface-2 dark:border-surface-0 dark:border-b-surface-3 dark:border-r-surface-3 dark:text-taupe-2 dark:focus:border-violet-3',
                'placeholder:text-taupe-3'
              )}
            />
            <div className="absolute right-[8px] top-1/2 -translate-y-1/2">
              {isSearching ? (
                <Loader2 className="size-3.5 animate-spin text-violet-3" />
              ) : (
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={handleCloseSearch}
                  className={cn(
                    'flex items-center justify-center rounded-[var(--r-xs)] border-none bg-transparent p-0.5 text-taupe-3 transition-all duration-100',
                    'hover:text-taupe-5 dark:hover:text-taupe-2',
                    'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
                  )}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Results dropdown area */}
          <div className="px-1.5 py-1.5">
            {/* Empty state — helper text */}
            {debouncedQuery === '' && !isSearching && (
              <p className="px-2 py-2 font-mono text-[0.625rem] leading-relaxed text-taupe-3">
                Enter a site name or URL to find available SharePoint sites.
              </p>
            )}

            {/* Results */}
            {debouncedQuery !== '' && !isSearching && searchResults.length > 0 && (
              <div className="space-y-0.5">
                {searchResults.map((result) => {
                  const alreadyConnected = connectedSiteIds.has(result.id);
                  return (
                    <button
                      key={result.id}
                      type="button"
                      disabled={alreadyConnected}
                      onClick={() => handleSelectSite(result)}
                      className={cn(
                        'flex w-full items-start gap-2.5 rounded-[var(--r-sm)] border-none p-2 text-left transition-all duration-100',
                        alreadyConnected
                          ? 'cursor-default bg-transparent'
                          : 'cursor-pointer bg-transparent hover:bg-[rgba(var(--violet-3-rgb),0.06)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.1)]',
                        'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
                      )}
                    >
                      {/* Site icon */}
                      <div
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[var(--r-xs)]',
                          alreadyConnected
                            ? 'bg-taupe-2 dark:bg-surface-3'
                            : 'bg-[rgba(var(--violet-3-rgb),0.1)] dark:bg-[rgba(var(--violet-3-rgb),0.15)]'
                        )}
                      >
                        {alreadyConnected ? (
                          <Check className="size-2.5 text-taupe-3" />
                        ) : (
                          <Globe className="size-2.5 text-violet-3" />
                        )}
                      </div>

                      {/* Site info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span
                            className={cn(
                              'truncate font-mono text-[0.6875rem] font-semibold',
                              alreadyConnected
                                ? 'text-taupe-3'
                                : 'text-taupe-5 dark:text-taupe-2'
                            )}
                          >
                            {result.name}
                          </span>
                          {alreadyConnected ? (
                            <span className="shrink-0 font-mono text-[0.5625rem] italic text-taupe-3">
                              Connected
                            </span>
                          ) : (
                            <span className="shrink-0 font-mono text-[0.5625rem] text-taupe-3">
                              {result.libraries.length} {result.libraries.length === 1 ? 'library' : 'libraries'}
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'block truncate font-mono text-[0.5625rem]',
                            alreadyConnected ? 'text-taupe-2 dark:text-surface-3' : 'text-taupe-3'
                          )}
                        >
                          {result.url}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No results */}
            {debouncedQuery !== '' && !isSearching && searchResults.length === 0 && (
              <p className="px-2 py-2 font-mono text-[0.625rem] text-taupe-3">
                No sites found matching &lsquo;{debouncedQuery}&rsquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Data scopes */}
      <div className="border-t border-taupe-2 pt-3 dark:border-surface-3">
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Data Scopes
        </span>
        <div className="mt-1.5 space-y-0.5">
          <MicrosoftDataScopes />
        </div>
      </div>

      {/* Disconnect */}
      {showDisconnectConfirm ? (
        <DisconnectConfirm
          providerName="SharePoint"
          onConfirm={onDisconnect}
          onCancel={() => setShowDisconnectConfirm(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setShowDisconnectConfirm(true)}
          className={cn(
            'mt-1 bg-transparent border-none cursor-pointer font-mono text-[0.625rem] text-taupe-3 transition-all duration-100 hover:text-red',
            'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
          )}
        >
          Disconnect SharePoint
        </button>
      )}
    </div>
  );
}

/** Google Drive expanded content — service account + shared folders */
function GoogleDriveContent({
  serviceAccount,
  sharedFolders,
}: {
  serviceAccount: string;
  sharedFolders: { id: string; name: string; fileCount: number; enabled: boolean }[];
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(serviceAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 space-y-3">
      {/* Service account */}
      <div>
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Service Account
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-mono text-[0.625rem] text-taupe-4 dark:text-taupe-3">
            {serviceAccount}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy service account email"
            className={cn(
              'shrink-0 bg-transparent border-none rounded-[var(--r-sm)] p-1 text-taupe-3 transition-all duration-100 hover:bg-berry-1 hover:text-taupe-5',
              'dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:text-taupe-2',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
          >
            <Copy className="h-3 w-3" />
          </button>
          {copied && (
            <span className="font-mono text-[0.5625rem] text-violet-3">
              Copied
            </span>
          )}
        </div>
      </div>

      {/* Shared folders */}
      <div>
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Shared Folders
        </span>
        <div className="mt-1.5 space-y-1">
          {sharedFolders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-2 py-1"
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0 text-taupe-3" />
              <span className="font-mono text-[0.6875rem] text-taupe-4 dark:text-taupe-3">
                {folder.name}
              </span>
              <span className="font-mono text-[0.625rem] text-taupe-3">
                · {folder.fileCount} files
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Data scopes */}
      <div className="border-t border-taupe-2 pt-3 dark:border-surface-3">
        <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3">
          Data Scopes
        </span>
        <div className="mt-1.5 space-y-0.5">
          <GoogleDataScopes />
        </div>
      </div>

      {/* Auto-connect info */}
      <p className="mt-1 font-mono text-[0.625rem] italic text-taupe-3">
        Google Drive connects automatically when files are shared with this service account.
      </p>
    </div>
  );
}

/** Microsoft data scope toggles — Outlook Mail, Outlook Calendar, SharePoint Files */
function MicrosoftDataScopes() {
  const [outlookMail, setOutlookMail] = useState(true);
  const [outlookCalendar, setOutlookCalendar] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Mail className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Outlook Mail
          </span>
        </div>
        <Switch
          size="sm"
          checked={outlookMail}
          onCheckedChange={(checked: boolean) => setOutlookMail(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Calendar className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Outlook Calendar
          </span>
        </div>
        <Switch
          size="sm"
          checked={outlookCalendar}
          onCheckedChange={(checked: boolean) => setOutlookCalendar(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            SharePoint Files
          </span>
        </div>
        <span className="font-mono text-[0.625rem] italic text-taupe-3">
          Managed above
        </span>
      </div>
    </>
  );
}

/** Google data scope toggles — Gmail, Google Calendar, Drive Files */
function GoogleDataScopes() {
  const [gmail, setGmail] = useState(true);
  const [googleCalendar, setGoogleCalendar] = useState(true);

  return (
    <>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Mail className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Gmail
          </span>
        </div>
        <Switch
          size="sm"
          checked={gmail}
          onCheckedChange={(checked: boolean) => setGmail(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <Calendar className="mr-2 h-3.5 w-3.5 text-taupe-3" />
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Google Calendar
          </span>
        </div>
        <Switch
          size="sm"
          checked={googleCalendar}
          onCheckedChange={(checked: boolean) => setGoogleCalendar(checked)}
        />
      </div>
      <div className="flex items-center justify-between py-1.5">
        <div className="flex items-center">
          <span className="font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-2">
            Drive Files
          </span>
        </div>
        <span className="font-mono text-[0.625rem] italic text-taupe-3">
          Managed above
        </span>
      </div>
    </>
  );
}

/** Expandable provider card with connection status and content */
function ProviderCard({
  provider,
  subtitle,
  isDisconnected,
  children,
}: {
  provider: CloudProvider;
  subtitle: string;
  isDisconnected: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(
    provider.status === 'connected' && !isDisconnected
  );

  // Auto-collapse on disconnect, auto-expand on reconnect
  useEffect(() => {
    setExpanded(!isDisconnected);
  }, [isDisconnected]);

  return (
    <div
      data-slot="provider-card"
      className="rounded-[var(--r-md)] border border-taupe-2 bg-off-white p-4 dark:border-surface-3 dark:bg-surface-2"
    >
      {/* Card header */}
      <button
        type="button"
        className={cn(
          'flex w-full items-center gap-3 bg-transparent border-none cursor-pointer text-left transition-all duration-100',
          'rounded-[var(--r-sm)] hover:bg-[rgba(var(--violet-3-rgb),0.05)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)]',
          'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <ProviderIcon provider={provider} />
        <div className="min-w-0 flex-1">
          <span className="font-mono text-sm font-bold text-taupe-5 dark:text-taupe-1">
            {provider.name}
          </span>
          <p className="font-mono text-[0.625rem] text-taupe-3">
            {subtitle}
          </p>
        </div>
        {/* Status badge */}
        {isDisconnected ? (
          <span className="shrink-0 rounded-[var(--r-pill)] border border-red/30 bg-[rgba(var(--red-rgb),0.1)] px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-red">
            Disconnected
          </span>
        ) : provider.status === 'connected' ? (
          <span className="shrink-0 rounded-[var(--r-pill)] border border-green/30 bg-[rgba(var(--green-rgb),0.1)] px-2 py-0.5 font-mono text-[0.625rem] font-semibold text-green">
            Connected
          </span>
        ) : null}
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-taupe-3" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-taupe-3" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && children}
    </div>
  );
}

// ============================================
// Main Component
// ============================================

/** Cloud storage admin settings dialog for managing provider connections */
export function CloudStorageSettings({
  open,
  onOpenChange,
}: CloudStorageSettingsProps) {
  const [settings, setSettings] = useState<CloudStorageSettingsType | null>(null);
  const [spSites, setSpSites] = useState<SharePointSite[]>([]);
  const [disconnectedProviders, setDisconnectedProviders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      getCloudStorageSettings().then(setSettings);
    }
  }, [open]);

  // Sync spSites when settings load
  useEffect(() => {
    if (settings?.sharepoint) {
      setSpSites(settings.sharepoint.sites);
    }
  }, [settings]);

  const handleAddSite = (site: SharePointSite) => {
    setSpSites((prev) => [...prev, site]);
  };

  const handleDisconnect = (providerId: string) => {
    setDisconnectedProviders((prev) => new Set(prev).add(providerId));
  };

  const handleConnect = (providerId: string) => {
    setDisconnectedProviders((prev) => {
      const next = new Set(prev);
      next.delete(providerId);
      return next;
    });
  };

  // Build subtitle strings from settings
  const spDisconnected = disconnectedProviders.has('sharepoint');

  const spSubtitle = spDisconnected
    ? 'Not connected'
    : settings?.sharepoint
      ? `${spSites.length} sites · ${spSites.reduce((acc, s) => acc + s.libraries.filter((l) => l.enabled).length, 0)} libraries shared`
      : '';
  const gdSubtitle = settings?.googleDrive
    ? `${settings.googleDrive.sharedFolders.length} shared folders · ${settings.googleDrive.sharedFolders.reduce((acc, f) => acc + f.fileCount, 0)} files`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-pixel tracking-[0.5px]">
            Cloud Storage
            <span className="rounded-[var(--r-sm)] bg-[rgba(var(--violet-3-rgb),0.08)] px-1.5 py-0.5 font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-violet-3">
              Admin
            </span>
          </DialogTitle>
          <DialogDescription>
            Control which cloud drives your organization shares with Cosimo.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {settings?.providers.map((provider) => {
            if (provider.type === 'microsoft' && settings.sharepoint) {
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  subtitle={spSubtitle}
                  isDisconnected={spDisconnected}
                >
                  {spDisconnected ? (
                    <SharePointConnectFlow onConnect={() => handleConnect(provider.id)} />
                  ) : (
                    <SharePointContent
                      sites={spSites}
                      onAddSite={handleAddSite}
                      onDisconnect={() => handleDisconnect(provider.id)}
                    />
                  )}
                </ProviderCard>
              );
            }
            if (provider.type === 'google' && settings.googleDrive) {
              return (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  subtitle={gdSubtitle}
                  isDisconnected={false}
                >
                  <GoogleDriveContent
                    serviceAccount={settings.googleDrive.serviceAccount}
                    sharedFolders={settings.googleDrive.sharedFolders}
                  />
                </ProviderCard>
              );
            }
            return null;
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
