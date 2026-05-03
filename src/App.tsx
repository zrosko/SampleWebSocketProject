import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, Wifi, WifiOff, Radio } from 'lucide-react';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [lastSent, setLastSent] = useState('');
  const clientRef = useRef<Client | null>(null);

  const connect = useCallback(() => {
    setStatus('connecting');

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 3000,
      onConnect: () => {
        setStatus('connected');
        client.subscribe('/topic/output', (message) => {
          setOutputText(message.body);
        });
      },
      onDisconnect: () => {
        setStatus('disconnected');
      },
      onStompError: () => {
        setStatus('disconnected');
      },
    });

    client.activate();
    clientRef.current = client;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clientRef.current?.deactivate();
    };
  }, [connect]);

  const handleSubmit = () => {
    if (!inputText.trim() || status !== 'connected') return;
    clientRef.current?.publish({
      destination: '/app/receiveInput',
      body: inputText.trim(),
    });
    setLastSent(inputText.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const statusConfig = {
    disconnected: { icon: WifiOff, color: 'text-red-500', bg: 'bg-red-50', label: 'Disconnected', dot: 'bg-red-500' },
    connecting: { icon: Radio, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Connecting...', dot: 'bg-amber-500' },
    connected: { icon: Wifi, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Connected', dot: 'bg-emerald-500' },
  };

  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 mb-4">
            <Radio className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">WebSocket Demo</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time messaging with Spring Boot</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Connection status bar */}
          <div className={`flex items-center gap-2.5 px-5 py-3 border-b border-slate-100 ${cfg.bg}`}>
            <span className={`w-2 h-2 rounded-full ${cfg.dot} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
            <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
            <span className={`text-sm font-medium ${cfg.color}`}>{cfg.label}</span>
            {status === 'disconnected' && (
              <button
                onClick={connect}
                className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2"
              >
                Reconnect
              </button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Input field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Message Input
              </label>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={status !== 'connected' || !inputText.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-sm hover:shadow-md disabled:shadow-none active:scale-[0.98]"
            >
              <Send className="w-4 h-4" />
              Send to Server
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400 font-medium">Live Server Output</span>
              </div>
            </div>

            {/* Output field */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Server Response
                {status === 'connected' && (
                  <span className="ml-2 text-emerald-500 normal-case font-normal">• broadcasting every 5s</span>
                )}
              </label>
              <div
                className={`w-full min-h-[72px] px-4 py-3 rounded-xl border text-sm font-mono leading-relaxed transition-all ${
                  outputText
                    ? 'border-emerald-200 bg-emerald-50 text-slate-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400'
                }`}
              >
                {outputText || 'Waiting for server messages...'}
              </div>
            </div>

            {/* Last sent indicator */}
            {lastSent && (
              <p className="text-xs text-slate-400 text-center">
                Last sent: <span className="text-slate-600 font-medium">"{lastSent}"</span>
              </p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Backend running at <span className="font-mono text-slate-500">localhost:8080</span>
        </p>
      </div>
    </div>
  );
}

export default App;
