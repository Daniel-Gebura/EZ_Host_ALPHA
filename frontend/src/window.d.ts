export {};

declare global {
  // Standardized API response type
  type ApiResponse<T = any> = {
    status: 'success' | 'error';
    message: string;
    data?: T;
    error?: string;
  };

  interface Window {
    ipcRenderer: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;
      removeAllListeners: (channel: string) => void;
    };

    api: {
      getIpAddress: () => Promise<ApiResponse>;
      getServers: () => Promise<ApiResponse>;
      getServer: (id: string) => Promise<ApiResponse>;
      addServer: (server: { name: string; directory: string; rconPassword: string; }) => Promise<any>;
      updateServer: (id: string, server: any) => Promise<any>;
      checkServerStatus: () => Promise<void>;
      deleteServer: (id: string) => Promise<void>;
      initServer: (id: string) => Promise<string>;
      startServer: (id: string) => Promise<ApiResponse>;
      saveServer: (id: string) => Promise<ApiResponse>;
      stopServer: (id: string) => Promise<ApiResponse>;
      chooseDirectory: () => Promise<string>;
      checkFileExistence: (dir: string, filename: string) => Promise<boolean>;
      chooseFile: () => Promise<string>;
      getServerProperties: (id: string) => Promise<any>;
      saveServerProperties: (id: string, properties: any) => Promise<void>;
      getRamAllocation: (id: string) => Promise<number>;
      updateRamAllocation: (id: string, ram: number) => Promise<string>;
      sendRconCommand: (id: string, command: string) => Promise<string>;
      getPlayers: (id: string) => Promise<string[]>;
      setPlayerOp: (id: string, playerName: string, op: boolean) => Promise<string>;
    };
  }
}
