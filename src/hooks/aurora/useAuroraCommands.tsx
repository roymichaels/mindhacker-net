import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

export type CommandType = 'navigate' | 'setting' | 'mode' | 'action';

export interface AuroraCommand {
  type: CommandType;
  command: string;
  params?: Record<string, string>;
}

interface CommandResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

// Parse action tags like [navigate:dashboard] or [setting:theme:dark]
export const parseCommandTag = (tag: string): AuroraCommand | null => {
  // Remove brackets if present
  const cleanTag = tag.replace(/^\[|\]$/g, '');
  const parts = cleanTag.split(':');
  
  if (parts.length < 2) return null;
  
  const [type, command, ...rest] = parts;
  
  if (!['navigate', 'setting', 'mode', 'action'].includes(type)) {
    return null;
  }
  
  return {
    type: type as CommandType,
    command,
    params: rest.length > 0 ? { value: rest.join(':') } : undefined,
  };
};

// Extract all command tags from a message
export const extractCommandTags = (message: string): AuroraCommand[] => {
  const tagRegex = /\[(navigate|setting|mode|action):[^\]]+\]/g;
  const matches = message.match(tagRegex) || [];
  
  return matches
    .map(parseCommandTag)
    .filter((cmd): cmd is AuroraCommand => cmd !== null);
};

export const useAuroraCommands = () => {
  const navigate = useNavigate();
  const { setTheme, theme } = useTheme();

  // Navigation commands
  const navigationCommands = useMemo(() => ({
    dashboard: () => navigate('/dashboard'),
    home: () => navigate('/'),
    hypnosis: (goal?: string) => navigate(goal ? `/hypnosis?goal=${goal}` : '/hypnosis'),
    health: () => navigate('/health'),
    business: () => navigate('/business'),
    life_plan: () => navigate('/life-plan'),
    launchpad: () => navigate('/launchpad'),
    community: () => navigate('/community'),
    settings: () => navigate('/settings'),
    profile: () => navigate('/profile'),
    aurora: () => navigate('/dashboard'), // Opens dashboard with chat
    tasks: () => navigate('/dashboard?tab=tasks'),
    habits: () => navigate('/dashboard?tab=habits'),
  }), [navigate]);

  // Setting commands
  const settingCommands = useMemo(() => ({
    theme: (value: string) => {
      if (['light', 'dark', 'system'].includes(value)) {
        setTheme(value);
        return true;
      }
      return false;
    },
    toggle_theme: () => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
      return true;
    },
  }), [setTheme, theme]);

  // Mode commands (these emit events that other components can listen to)
  const modeCommands = useMemo(() => ({
    focus: (value: string) => {
      const enabled = value === 'on' || value === 'true' || value === '1';
      window.dispatchEvent(new CustomEvent('aurora:focus-mode', { detail: { enabled } }));
      toast(enabled ? '🎯 Focus mode enabled' : '🎯 Focus mode disabled');
      return true;
    },
    voice: (value: string) => {
      const enabled = value === 'on' || value === 'true' || value === '1';
      window.dispatchEvent(new CustomEvent('aurora:voice-mode', { detail: { enabled } }));
      return true;
    },
    quiet: (value: string) => {
      const enabled = value === 'on' || value === 'true' || value === '1';
      window.dispatchEvent(new CustomEvent('aurora:quiet-mode', { detail: { enabled } }));
      toast(enabled ? '🔇 Quiet mode enabled' : '🔔 Notifications enabled');
      return true;
    },
  }), []);

  // Action commands (trigger specific actions in the app)
  const actionCommands = useMemo(() => ({
    new_chat: () => {
      window.dispatchEvent(new CustomEvent('aurora:new-chat'));
      return true;
    },
    search: (query?: string) => {
      window.dispatchEvent(new CustomEvent('aurora:search', { detail: { query } }));
      return true;
    },
    refresh: () => {
      window.location.reload();
      return true;
    },
    scroll_top: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    },
  }), []);

  // Execute a single command
  const executeCommand = useCallback((command: AuroraCommand): CommandResult => {
    try {
      switch (command.type) {
        case 'navigate': {
          const navFn = navigationCommands[command.command as keyof typeof navigationCommands];
          if (navFn) {
            navFn(command.params?.value);
            return { success: true, message: `Navigating to ${command.command}` };
          }
          return { success: false, message: `Unknown navigation: ${command.command}` };
        }
        
        case 'setting': {
          const settingFn = settingCommands[command.command as keyof typeof settingCommands];
          if (settingFn) {
            const result = settingFn(command.params?.value || '');
            return { 
              success: result, 
              message: result ? `Setting ${command.command} updated` : `Invalid setting value` 
            };
          }
          return { success: false, message: `Unknown setting: ${command.command}` };
        }
        
        case 'mode': {
          const modeFn = modeCommands[command.command as keyof typeof modeCommands];
          if (modeFn) {
            const result = modeFn(command.params?.value || 'toggle');
            return { 
              success: result, 
              message: result ? `${command.command} mode updated` : `Failed to update mode` 
            };
          }
          return { success: false, message: `Unknown mode: ${command.command}` };
        }
        
        case 'action': {
          const actionFn = actionCommands[command.command as keyof typeof actionCommands];
          if (actionFn) {
            const result = actionFn(command.params?.value);
            return { 
              success: result, 
              message: result ? `Action ${command.command} executed` : `Failed to execute action` 
            };
          }
          return { success: false, message: `Unknown action: ${command.command}` };
        }
        
        default:
          return { success: false, message: `Unknown command type: ${command.type}` };
      }
    } catch (error) {
      console.error('Command execution error:', error);
      return { success: false, message: `Error executing command: ${error}` };
    }
  }, [navigationCommands, settingCommands, modeCommands, actionCommands]);

  // Execute multiple commands from a message
  const executeMessageCommands = useCallback((message: string): CommandResult[] => {
    const commands = extractCommandTags(message);
    return commands.map(cmd => executeCommand(cmd));
  }, [executeCommand]);

  // Get available commands for AI context
  const getAvailableCommands = useCallback((): string => {
    return `
Available Aurora commands:
- [navigate:dashboard] - Open dashboard
- [navigate:hypnosis] or [navigate:hypnosis:sleep] - Open hypnosis page
- [navigate:health] - Open health journey
- [navigate:business] - Open business journey
- [navigate:life_plan] - Open life plan
- [navigate:community] - Open community
- [navigate:settings] - Open settings
- [setting:theme:dark] or [setting:theme:light] - Change theme
- [setting:toggle_theme] - Toggle between light/dark
- [mode:focus:on] or [mode:focus:off] - Toggle focus mode
- [mode:voice:on] - Enable voice mode
- [mode:quiet:on] - Mute notifications
- [action:new_chat] - Start a new conversation
- [action:refresh] - Refresh the page
`.trim();
  }, []);

  return {
    executeCommand,
    executeMessageCommands,
    parseCommandTag,
    extractCommandTags,
    getAvailableCommands,
    navigationCommands,
  };
};
