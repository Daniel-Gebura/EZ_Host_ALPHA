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
      chooseDirectory: () => Promise<string>;
      checkFileExistence: (dir: string, filename: string) => Promise<boolean>;
      chooseFile: () => Promise<string>;
    };

    api: {
      getIpAddress: () => Promise<ApiResponse>;
      getServers: () => Promise<ApiResponse>;
      getServer: (id: string) => Promise<ApiResponse>;
      addServer: (server: { name: string; directory: string; rconPassword: string; }) => Promise<ApiResponse>;
      updateServer: (id: string, server: any) => Promise<ApiResponse>;
      checkServerStatus: () => Promise<ApiResponse>;
      deleteServer: (id: string) => Promise<ApiResponse>;
      initServer: (id: string) => Promise<ApiResponse>;
      startServer: (id: string) => Promise<ApiResponse>;
      getServerProperties: (id: string) => Promise<ApiResponse>;
      saveServerProperties: (id: string, properties: any) => Promise<ApiResponse>;
      getRamAllocation: (id: string) => Promise<ApiResponse>;
      updateRamAllocation: (id: string, ram: number) => Promise<ApiResponse>;
      sendRconCommand: (id: string, command: string) => Promise<ApiResponse>;
      getPlayers: (id: string) => Promise<ApiResponse>;
      setPlayerOp: (id: string, playerName: string, op: boolean) => Promise<string>;
    };
  }
}
