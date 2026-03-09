import { useCallback, useRef } from 'react';
import { debug } from '@/lib/debug';

export type CommandType = 'navigate' | 'setting' | 'mode' | 'action';

export interface AuroraCommand {
  type: CommandType;
  command: string;
  params?: Record<string, string>;
}

export function useAuroraCommands() {
  const commandHandlerRef = useRef<((command: AuroraCommand) => void) | null>(null);

  const executeCommand = useCallback((command: AuroraCommand) => {
    debug.log('Aurora executing command:', command);
    if (commandHandlerRef.current) {
      commandHandlerRef.current(command);
    }
    window.dispatchEvent(new CustomEvent('aurora:command', { detail: command }));
  }, []);

  const registerCommandHandler = useCallback((handler: (command: AuroraCommand) => void) => {
    commandHandlerRef.current = handler;
  }, []);

  return { executeCommand, registerCommandHandler };
}
