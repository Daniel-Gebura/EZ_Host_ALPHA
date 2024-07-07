import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export const ConsoleTab: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const term = useRef<Terminal>(new Terminal());
  const fitAddon = useRef<FitAddon>(new FitAddon());

  useEffect(() => {
    if (terminalRef.current) {
      term.current.loadAddon(fitAddon.current);
      term.current.open(terminalRef.current);
      fitAddon.current.fit();
    }

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.current.fit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      term.current.dispose();
    };
  }, []);

  useEffect(() => {
    const handleLogMessage = (event: any, message: string) => {
      term.current.writeln(message);
    };

    window.ipcRenderer.on('log-message', handleLogMessage);

    return () => {
      window.ipcRenderer.removeListener('log-message', handleLogMessage);
    };
  }, []);

  return <div ref={terminalRef} style={{ height: '100%', width: '100%' }} />;
};
