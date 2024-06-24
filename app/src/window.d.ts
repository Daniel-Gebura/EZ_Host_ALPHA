export {};

declare global {
  interface Window {
    api: {
      getServers: () => Promise<any>;
      addServer: (server: any) => Promise<any>;
      deleteServer: (id: string) => Promise<void>;
    };
  }
}
