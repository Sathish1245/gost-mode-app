const { useState, useEffect, useRef } = React;

// --- Mock Data ---
const SYMBOLS = ["🌙", "👻", "🦇", "👁️", "🌌", "🎭", "🕸️", "🥀"];
const VIBES = [
  { id: 'vibe-1', color: 'linear-gradient(135deg, #00f3ff, #0055ff)', name: 'Calm/Deep' },
  { id: 'vibe-2', color: 'linear-gradient(135deg, #bc13fe, #5b00ff)', name: 'Mysterious' },
  { id: 'vibe-3', color: 'linear-gradient(135deg, #ff0055, #ff7700)', name: 'Intense/Late Night' },
  { id: 'vibe-4', color: 'linear-gradient(135deg, #00ff88, #008855)', name: 'Chill/Observing' },
];

const GHOST_ROOMS = [
  { id: 'r1', name: 'Midnight Thoughts', active: 142 },
  { id: 'r2', name: 'Coder Room (Lonely)', active: 89 },
  { id: 'r3', name: 'Heartbreak & Healing', active: 215 },
  { id: 'r4', name: 'The Void', active: 56 },
];

const INITIAL_MESSAGES = [
  { id: 1, text: "anyone else up coding late?", sender: "them", time: "02:14 AM" },
  { id: 2, text: "yeah, hunting a bug that makes no sense.", sender: "me", time: "02:15 AM" },
  { id: 3, text: "the classic. what stack?", sender: "them", time: "02:16 AM" },
];

// --- Components ---

function FogBackground() {
  return (
    <div className="fog-container">
      <div className="fog-img"></div>
      <div className="fog-img layer2"></div>
    </div>
  );
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [symbol, setSymbol] = useState(null);
  const [vibe, setVibe] = useState(null);

  const handleNext = async () => {
    if (step === 1 && symbol) setStep(2);
    else if (step === 2 && vibe) {
      try {
        const response = await fetch('http://localhost:8080/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: symbol,
            vibeColor: vibe.color,
            musicTaste: 'Unknown',
            mood: vibe.name,
            interests: 'N/A'
          })
        });
        const savedUser = await response.json();
        savedUser.vibe = vibe; // keep for UI
        onComplete(savedUser);
      } catch (error) {
        console.error("Backend not running, falling back to local state.", error);
        onComplete({ id: Date.now(), symbol, vibe });
      }
    }
  };

  return (
    <div className="onboarding-container fade-in">
      {step === 1 && (
        <div className="fade-in">
          <h1 className="step-title glowing-text-purple">Choose Your Form</h1>
          <p className="step-subtitle">You are anonymous. Pick a symbol to represent your ghost.</p>
          <div className="symbol-grid">
            {SYMBOLS.map(s => (
              <div 
                key={s} 
                className={`selectable-item ${symbol === s ? 'selected' : ''}`}
                onClick={() => setSymbol(s)}
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fade-in">
          <h1 className="step-title glowing-text-blue">Reveal Your Vibe</h1>
          <p className="step-subtitle">What is your emotional frequency right now?</p>
          <div className="vibe-grid">
            {VIBES.map(v => (
              <div 
                key={v.id} 
                className={`selectable-item ${vibe?.id === v.id ? 'selected' : ''}`}
                onClick={() => setVibe(v)}
                style={{ padding: '10px' }}
              >
                <div className="vibe-color" style={{ background: v.color }}></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem' }}>
        <button 
          className="btn-glowing" 
          onClick={handleNext}
          disabled={(step === 1 && !symbol) || (step === 2 && !vibe)}
          style={{ opacity: ((step === 1 && !symbol) || (step === 2 && !vibe)) ? 0.5 : 1 }}
        >
          {step === 1 ? 'Continue into the Fog' : 'Enter the Void'}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ userProfile }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [currentRoom, setCurrentRoom] = useState(null);
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let client = null;
    const connectToRoom = async () => {
      try {
        const matchResponse = await fetch(`http://localhost:8080/api/rooms/match?userId=${userProfile.id}`, { method: 'POST' });
        if (!matchResponse.ok) throw new Error('Match failed');
        const room = await matchResponse.json();
        setCurrentRoom(room);

        const socket = new SockJS('http://localhost:8080/ws');
        client = Stomp.over(socket);
        client.debug = null;

        client.connect({}, () => {
          setIsConnected(true);
          setStompClient(client);
          
          client.subscribe(`/topic/room/${room.id}`, (message) => {
            const receivedMsg = JSON.parse(message.body);
            if (receivedMsg.sender.id !== userProfile.id) {
               setMessages(prev => [...prev, {
                  id: receivedMsg.id || Date.now(),
                  text: receivedMsg.content,
                  sender: 'them',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
               }]);
            }
          });
        }, (err) => {
          console.error("WebSocket connection failed", err);
        });
      } catch (error) {
        console.error("Failed to connect to backend", error);
        setCurrentRoom({ id: 'demo', name: 'Demo Room' });
      }
    };

    if (userProfile && userProfile.id) {
       connectToRoom();
    } else {
       setCurrentRoom({ id: 'demo', name: 'Demo Room' });
    }

    return () => {
       if (client) client.disconnect();
    };
  }, [userProfile]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMsg = {
      id: Date.now(),
      text: inputText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMsg]);
    
    if (isConnected && stompClient && currentRoom && currentRoom.id !== 'demo') {
       const payload = {
          content: inputText,
          sender: { id: userProfile.id },
          room: { id: currentRoom.id }
       };
       stompClient.send(`/app/chat/${currentRoom.id}`, {}, JSON.stringify(payload));
    } else {
       setTimeout(() => {
         setMessages(prev => [...prev, {
           id: Date.now() + 1, text: "typing...", sender: 'them', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isTyping: true
         }]);
         setTimeout(() => {
           setMessages(prev => {
             const filtered = prev.filter(m => !m.isTyping);
             return [...filtered, { id: Date.now() + 2, text: "I feel that. Sometimes the code writes you.", sender: 'them', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
           });
         }, 2000);
       }, 1000);
    }
    setInputText('');
  };

  return (
    <div className="dashboard-container fade-in">
      <div className="sidebar">
        <h2 className="glowing-text-purple" style={{ marginBottom: '2rem' }}>Ghost Rooms</h2>
        <div className="rooms-list">
          {GHOST_ROOMS.map(room => (
            <div key={room.id} className="ghost-room-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#fff' }}>{room.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--neon-blue)' }}>{room.active} ghosts drifting</span>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>{userProfile.symbol}</div>
            <div>
              <div style={{ color: 'white' }}>Anonymous</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vibe: {userProfile.vibe.name}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-area">
        <div className="chat-header">
          <div>
            <h2 className="glowing-text-blue">Stranger</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Matched 12 mins ago • Fog lifting slightly</div>
          </div>
          <button className="btn-glowing" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Reveal Identity? (0/2)
          </button>
        </div>

        <div className="chat-messages">
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            This chat will vanish in 24 hours. Connect on a deeper level.
          </div>
          {messages.map(msg => (
            <div key={msg.id} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`} style={{ fontStyle: msg.isTyping ? 'italic' : 'normal', opacity: msg.isTyping ? 0.6 : 1 }}>
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-container" onSubmit={handleSend}>
          <input 
            type="text" 
            className="chat-input"
            placeholder="Send a thought into the void..." 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" className="btn-glowing" style={{ background: 'transparent', border: 'none' }}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);

  return (
    <div className="app-wrapper">
      <FogBackground />
      {!profile ? (
        <Onboarding onComplete={setProfile} />
      ) : (
        <Dashboard userProfile={profile} />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
