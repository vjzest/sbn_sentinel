import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

const threadKey = (a: string, b: string) =>
  [a, b].map((s) => s.toLowerCase().trim()).sort().join('|');

const STORAGE_PREFIX = 'sentinel_msg_thread_';

interface Message {
  from: string;
  to: string;
  text: string;
  time: string;
  isMe: boolean;
}

function loadThread(me: string, other: string): Message[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + threadKey(me, other)) || '[]'); }
  catch { return []; }
}

function saveThread(me: string, other: string, messages: Message[]) {
  localStorage.setItem(STORAGE_PREFIX + threadKey(me, other), JSON.stringify(messages));
}

export const TeamMessagingView: React.FC<{ currentUser?: any }> = ({ currentUser }) => {
  const myName: string = currentUser?.full_name || 'Clinic Admin';

  const allContacts = [
    { name: 'Clinic Admin', role: 'System Administrator', status: 'online' },
    { name: 'Vijay Maurya', role: 'Operations Manager', status: 'online' },
    { name: 'City Heart - Dr Jenkins', role: 'Attending Physician', status: 'online' },
    { name: 'Dr. Sarah Mitchell', role: 'Cardiology', status: 'away' },
    { name: 'Front Desk / Reception', role: 'Staff', status: 'online' },
    { name: 'Billing Department', role: 'Finance', status: 'offline' },
  ].filter((c) => c.name.toLowerCase() !== myName.toLowerCase());

  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [newMessageText, setNewMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WebSocket | null>(null);
  const activeContactRef = useRef<string | null>(null);
  const myNameRef = useRef<string>(myName);

  useEffect(() => { activeContactRef.current = activeContact; }, [activeContact]);
  useEffect(() => { myNameRef.current = myName; }, [myName]);

  useEffect(() => {
    if (activeContact) {
      setActiveMessages(loadThread(myName, activeContact));
      setUnreadMap((prev) => ({ ...prev, [activeContact]: 0 }));
    } else {
      setActiveMessages([]);
    }
  }, [activeContact, myName]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeMessages]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/api/v1/pasme/chat/ws');
    ws.current = socket;

    socket.onmessage = (event) => {
      try {
        const payload: { from: string; to: string; text: string; time: string } = JSON.parse(event.data);
        const me = myNameRef.current;
        if (payload.to.toLowerCase() !== me.toLowerCase()) return;
        if (payload.from.toLowerCase() === me.toLowerCase()) return;

        const newMsg: Message = { from: payload.from, to: payload.to, text: payload.text, time: payload.time, isMe: false };
        const thread = loadThread(me, payload.from);
        thread.push(newMsg);
        saveThread(me, payload.from, thread);

        if (activeContactRef.current?.toLowerCase() === payload.from.toLowerCase()) {
          setActiveMessages([...thread]);
        } else {
          setUnreadMap((prev) => ({ ...prev, [payload.from]: (prev[payload.from] || 0) + 1 }));
        }
      } catch (e) { console.error('WS parse error', e); }
    };

    return () => socket.close();
  }, []);

  const handleSendMessage = () => {
    if (!newMessageText.trim() || !activeContact) return;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = { from: myName, to: activeContact, text: newMessageText, time: timeNow, isMe: true };
    const thread = [...activeMessages, newMsg];
    setActiveMessages(thread);
    saveThread(myName, activeContact, thread);
    setNewMessageText('');
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ from: myName, to: activeContact, text: newMsg.text, time: timeNow }));
    }
  };

  const filteredContacts = allContacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in duration-500 max-w-[1600px] mx-auto space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex-shrink-0">
        <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-400" />
          Team Messaging (PASME)
        </h2>
        <p className="text-sm text-white/60 mt-1 font-medium">Secure, real-time clinical communication and operational alerts.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        <div className="w-80 bg-white/5 border border-white/10 rounded-[20px] premium-shadow flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search staff or departments..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-[12px] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredContacts.map((contact) => {
              const isActive = activeContact === contact.name;
              const unread = unreadMap[contact.name] || 0;
              const thread = loadThread(myName, contact.name);
              const lastMsg = thread[thread.length - 1];
              return (
                <button key={contact.name} onClick={() => setActiveContact(contact.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-[12px] transition-all text-left ${isActive ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-blue-500/30 text-blue-400' : 'bg-white/10 text-white/70'}`}>
                      {contact.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#120524] ${contact.status === 'online' ? 'bg-emerald-400' : contact.status === 'away' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-white' : 'text-white/90'}`}>{contact.name}</p>
                      {unread > 0 && <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full font-bold">{unread}</span>}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">
                      {lastMsg ? `${lastMsg.isMe ? 'You: ' : ''}${lastMsg.text}` : contact.role}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white/5 border border-white/10 rounded-[20px] premium-shadow flex flex-col min-w-0 relative overflow-hidden">
          {activeContact ? (
            <>
              <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-[#120524]/50 backdrop-blur-md z-10">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">{activeContact.charAt(0)}</div>
                <div>
                  <h3 className="text-base font-bold text-white">{activeContact}</h3>
                  <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online now</p>
                </div>
              </div>

              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/40">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">No messages yet.</p>
                    <p className="text-xs">Start a secure conversation with {activeContact}.</p>
                  </div>
                ) : activeMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-[16px] ${msg.isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-[#1a0b2e] border border-white/10 text-white/90 rounded-bl-sm'}`}>
                      {!msg.isMe && <p className="text-[10px] text-white/40 font-semibold mb-1">{msg.from}</p>}
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 flex items-center gap-1 ${msg.isMe ? 'text-white/70 justify-end' : 'text-white/40'}`}>
                        {msg.time}{msg.isMe && <CheckCircle2 className="w-3 h-3 text-white/70" />}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-[#120524]/50 backdrop-blur-md">
                <div className="flex items-end gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-[16px] p-1 flex items-center">
                    <input type="text" value={newMessageText} onChange={(e) => setNewMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder={`Message ${activeContact}...`}
                      className="w-full bg-transparent border-none px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none" />
                  </div>
                  <button onClick={handleSendMessage} disabled={!newMessageText.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-[14px] transition-colors">
                    <Send className="w-5 h-5 ml-0.5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Team Messaging</h3>
              <p className="text-sm text-center max-w-sm">Select a contact from the sidebar to start an encrypted secure conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
