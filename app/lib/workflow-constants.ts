// ============================================
// Workflow Constants — Shared trigger configuration
// ============================================

import type { ElementType } from 'react';
import { FolderOpen, Hand, Clock, Mail, MessageSquare, Link } from 'lucide-react';
import type { TriggerType } from '~/services/types';

/** Canonical mapping of trigger type to icon component and display label */
export const TRIGGER_CONFIG: Record<TriggerType, { icon: ElementType; label: string }> = {
  'folder-watch': { icon: FolderOpen, label: 'Folder Watch' },
  manual: { icon: Hand, label: 'Manual' },
  schedule: { icon: Clock, label: 'Schedule' },
  email: { icon: Mail, label: 'Email' },
  'chat-command': { icon: MessageSquare, label: 'Chat Command' },
  chained: { icon: Link, label: 'Chained' },
};
