// Type definitions for Jitsi Meet External API
declare global {
  interface Window {
    JitsiMeetJS?: {
      JitsiMeetExternalAPI: new (
        domain: string,
        options: {
          roomName: string;
          parentNode: HTMLElement | null;
          config?: Record<string, any>;
          interfaceConfig?: Record<string, any>;
          userInfo?: {
            displayName?: string;
            email?: string;
          };
        }
      ) => JitsiMeetExternalAPI;
    };
  }
}

export interface JitsiMeetExternalAPI {
  addEventListener: (event: string, callback: (data?: any) => void) => void;
  removeEventListener: (event: string, callback: (data?: any) => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
  dispose: () => void;
}

