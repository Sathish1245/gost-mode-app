const { useState, useEffect, useRef } = React;

const BACKEND_URL = 'http://localhost:8080';

const SYMBOLS = ["🌙", "👻", "🦇", "👁️", "🌌", "🎭", "🕸️", "🥀"];
const VIBES = [
  { id: 'vibe-1', colors: ['#1A2980', '#26D0CE'], name: 'Wraith Blue' },
  { id: 'vibe-2', colors: ['#4B1248', '#F0C27B'], name: 'Spectral Gold' },
  { id: 'vibe-3', colors: ['#870000', '#190A05'], name: 'Crimson Echo' },
  { id: 'vibe-4', colors: ['#1D976C', '#93F9B9'], name: 'Toxic Ectoplasm' },
];

const GHOST_ROOMS = [
  { id: 'heartbreak', name: 'Shattered Mirrors', icon: '🪞' },
  { id: 'midnight', name: 'The Observatory', icon: '🔭' },
  { id: 'coders', name: 'Static Noise', icon: '📻' },
  { id: 'anime', name: 'Fading Memories', icon: '🎞️' }
];


// Global Toast System
window.showToast = (message) => {
  const event = new CustomEvent('show-toast', { detail: message });
  window.dispatchEvent(event);
};

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message: e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('show-toast', handleToast);
    return () => window.removeEventListener('show-toast', handleToast);
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className="toast">{t.message}</div>
      ))}
    </div>
  );
}

function BreathingBackground({ colors, isLightMode }) {
  const overlayStyle = isLightMode ? { backgroundColor: 'rgba(255, 255, 255, 0.7)' } : {};
  if (isLightMode) colors = ['#E8E8E8', '#FFFFFF'];
  
  return (
    <div className="bg-container">
      <div className="bg-gradient" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}></div>
      <div className="bg-overlay" style={overlayStyle}></div>
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
        const response = await fetch(`${BACKEND_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol, vibeColor: vibe.colors[0], musicTaste: 'Unknown', mood: vibe.name, interests: 'N/A' })
        });
        const savedUser = await response.json();
        onComplete(savedUser);
      } catch (error) {
        window.showToast("Failed to connect to backend.");
      }
    }
  };

  return (
    <>
      <BreathingBackground colors={vibe ? vibe.colors : ['#020203', '#0b0c10']} />
      <div className="onboarding-container fade-in">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: '200', letterSpacing: '15px', margin: 0, textShadow: '0 0 20px rgba(255,255,255,0.4)' }}>GHOST</h1>
          <h2 style={{ fontSize: '1.2rem', color: '#888', letterSpacing: '25px', marginTop: '10px', fontWeight: '300' }}>M O D E</h2>
        </div>
        {step === 1 && (
          <div className="fade-in">
            <h1 className="title">Choose Your Form</h1>
            <div className="grid">
              {SYMBOLS.map(s => (
                <div key={s} className={`glass-card grid-item ${symbol === s ? 'selected' : ''}`} onClick={() => setSymbol(s)}>
                  <span style={{ fontSize: '3rem' }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="fade-in">
            <h1 className="title">Reveal Your Frequency</h1>
            <div className="grid">
              {VIBES.map(v => (
                <div key={v.id} className={`glass-card grid-item ${vibe?.id === v.id ? 'selected' : ''}`} style={{ padding: 0 }} onClick={() => setVibe(v)}>
                  <div style={{ background: `linear-gradient(135deg, ${v.colors[0]}, ${v.colors[1]})`, width: '100%', height: '100%', borderRadius: '15px' }}></div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="glass-btn" style={{ marginTop: '2rem' }} onClick={handleNext} disabled={(step === 1 && !symbol) || (step === 2 && !vibe)}>
          {step === 1 ? 'CONTINUE' : 'MANIFEST'}
        </button>
      </div>
    </>
  );
}


function TheCoven({ onSummon, onBack }) {
  const [friends, setFriends] = useState(JSON.parse(localStorage.getItem('coven_friends') || '[]'));
  const [newFriend, setNewFriend] = useState('');

  const addFriend = (e) => {
    e.preventDefault();
    if(!newFriend.trim()) return;
    const updated = [...friends, newFriend.trim()];
    setFriends(updated);
    localStorage.setItem('coven_friends', JSON.stringify(updated));
    setNewFriend('');
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-header glass-card">
        <button className="glass-btn" style={{ padding: '0.5rem 1rem' }} onClick={onBack}>← Back</button>
        <h2 style={{ letterSpacing: '4px' }}>THE COVEN</h2>
      </div>
      <div className="messages-area" style={{ textAlign: 'left', padding: '2rem' }}>
        <form onSubmit={addFriend} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
           <input type="text" className="text-input glass-card" placeholder="Summon a Phantom (G-XXXX)" value={newFriend} onChange={e => setNewFriend(e.target.value)} />
           <button className="glass-btn">ADD</button>
        </form>
        {friends.map((f, i) => (
          <div key={i} className="glass-card menu-item" onClick={() => onSummon(f)}>
             <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>{f}</h3>
             <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Tap to summon</p>
          </div>
        ))}
        {friends.length === 0 && <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>Your coven is empty.</p>}
      </div>
    </div>
  );
}
function ChatInterface({ userProfile, roomData, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [burnMode, setBurnMode] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [burnMode, setBurnMode] = useState(false);
  const [showOracle, setShowOracle] = useState(!!roomData.aiReason);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = new SockJS(`${BACKEND_URL}/ws`);
    const client = Stomp.over(socket);
    client.debug = null;

    client.connect({}, () => {
      setStompClient(client);
      client.subscribe(`/topic/room/${roomData.id}`, (message) => {
        const received = JSON.parse(message.body);
        if (received.sender?.id !== userProfile.id) {
          setMessages(prev => [...prev, { id: Date.now(), text: received.content, sender: 'them', burn: received.burn }]);
          if (received.burn) {
            setTimeout(() => setMessages(prev => prev.filter(m => m.id !== received.id)), 10000);
          }
        }
      });
    });

    return () => { if (client) client.disconnect(); };
  }, [roomData.id, userProfile.id]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const msgId = Date.now();
    setMessages(prev => [...prev, { id: msgId, text: inputText, sender: 'me', burn: burnMode }]);
    if (burnMode) setTimeout(() => setMessages(prev => prev.filter(m => m.id !== msgId)), 10000);

    if (stompClient) {
      stompClient.send(`/app/chat/${roomData.id}`, {}, JSON.stringify({
        content: inputText, sender: { id: userProfile.id }, room: { id: roomData.id }, burn: burnMode
      }));
    }
    setInputText('');
  };

  return (
    <>
      {showOracle && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ borderColor: 'rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>👁️</span>
            <h2>THE ORACLE HAS SPOKEN</h2>
            <p style={{ fontStyle: 'italic', margin: '2rem 0' }}>"{roomData.aiReason}"</p>
            <button className="glass-btn" onClick={() => setShowOracle(false)}>ENTER THE ETHER</button>
          </div>
        </div>
      )}

      <div className="chat-container fade-in">
        <div className="chat-header glass-card">
          <button className="glass-btn" style={{ padding: '0.5rem 1rem' }} onClick={onBack}>← Back</button>
          <div style={{ textAlign: 'right' }}>
             <h2>STRANGER</h2>
             {roomData.passcode && <span style={{ color: '#D4AF37' }}>Passcode: {roomData.passcode}</span>}
          </div>
        </div>

        <div className="messages-area">
          {messages.map(m => (
            <div key={m.id} className={`message-wrapper ${m.sender === 'me' ? 'me' : 'them'} ${m.burn ? 'burn' : ''}`}>
              <div className="message-bubble glass-card">
                {m.burn && <span style={{ marginRight: '8px' }}>🔥</span>}
                {m.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="input-area glass-card" onSubmit={handleSend}>
          <button type="button" className={`glass-btn ${burnMode ? 'burn-active' : ''}`} style={{ marginRight: '1rem', padding: '0.5rem 1rem' }} onClick={() => setBurnMode(!burnMode)}>
            {burnMode ? '🔥 BURN ON' : 'BURN OFF'}
          </button>
          <input type="text" className="text-input" placeholder="Whisper..." value={inputText} onChange={e => setInputText(e.target.value)} />
          <button type="submit" className="glass-btn" style={{ marginLeft: '1rem' }}>SEND</button>
        </form>
      </div>
    </>
  );
}

function TheVoid({ userProfile, onBack }) {
  const [echoes, setEchoes] = useState([]);
  const [inputText, setInputText] = useState('');

  const fetchEchoes = async () => {
    const res = await fetch(`${BACKEND_URL}/api/echoes`);
    setEchoes(await res.json());
  };

  useEffect(() => { fetchEchoes(); }, []);

  const handleDrop = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await fetch(`${BACKEND_URL}/api/echoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: inputText, authorSymbol: userProfile.symbol, authorColor: userProfile.vibeColor })
    });
    setInputText('');
    fetchEchoes();
  };

  return (
    <div className="chat-container fade-in">
      <div className="chat-header glass-card">
        <button className="glass-btn" style={{ padding: '0.5rem 1rem' }} onClick={onBack}>← Back</button>
        <h2 style={{ letterSpacing: '4px' }}>THE VOID</h2>
      </div>

      <div className="messages-area" style={{ alignItems: 'center' }}>
        {echoes.map(e => (
          <div key={e.id} className="glass-card" style={{ width: '80%', padding: '2rem', marginBottom: '1rem' }}>
            <p style={{ fontStyle: 'italic', fontSize: '1.2rem', marginBottom: '1rem' }}>"{e.content}"</p>
            {e.audioUrl && (
              <audio controls src={e.audioUrl} style={{ width: '100%', marginBottom: '1rem', borderRadius: '10px' }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.5rem', color: e.authorColor }}>{e.authorSymbol}</span>
              <button className="glass-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }} onClick={() => fetch(`${BACKEND_URL}/api/echoes/${e.id}/resonate`, { method: 'POST' }).then(fetchEchoes)}>
                Resonate {e.resonanceCount}
              </button>
            </div>
          </div>
        ))}
      </div>

      <form className="input-area glass-card" onSubmit={handleDrop}>
        <input type="text" className="text-input" placeholder="Drop a thought into the void..." value={inputText} onChange={e => setInputText(e.target.value)} />
        <button type="submit" className="glass-btn" style={{ marginLeft: '1rem' }}>DROP</button>
      </form>
function GhostRoomsList({ onJoinRoom, onBack }) {
  return (
    <div className="chat-container fade-in">
      <div className="chat-header glass-card">
        <button className="glass-btn" style={{ padding: '0.5rem 1rem' }} onClick={onBack}>← Back</button>
        <h2 style={{ letterSpacing: '4px' }}>GHOST ROOMS</h2>
      </div>
      <div className="messages-area">
        {GHOST_ROOMS.map(room => (
          <div key={room.id} className="glass-card menu-item" onClick={() => onJoinRoom(room)}>
            <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>{room.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>{room.name}</h3>
              <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Tap to enter...</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ userProfile, onUpdateUser }) {
  const [activeView, setActiveView] = useState('menu'); // menu, 1on1, void
  const [roomData, setRoomData] = useState(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(!!userProfile.evolutionMessage);

  const [phantomSearch, setPhantomSearch] = useState('');
  const [passcodeSearch, setPasscodeSearch] = useState('');

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/${userProfile.id}`);
        const updated = await res.json();
        if (updated.evolutionMessage) {
          onUpdateUser(updated);
          setShowEvolutionModal(true);
        }
      } catch (e) {}
    }, 30000);
    return () => clearInterval(interval);
  }, [userProfile.id]);

  const clearEvolution = async () => {
    const res = await fetch(`${BACKEND_URL}/api/users/${userProfile.id}/clear-evolution`, { method: 'POST' });
    onUpdateUser(await res.json());
    setShowEvolutionModal(false);
  };

  const startDeepMatch = async () => {
    const res = await fetch(`${BACKEND_URL}/api/rooms/match?userId=${userProfile.id}`, { method: 'POST' });
    setRoomData(await res.json());
    setActiveView('1on1');
  };

  const startDirectMatch = async () => {
    if (!phantomSearch.trim()) return;
    try {
      const searchRes = await fetch(`${BACKEND_URL}/api/users/search?phantomId=${phantomSearch.trim()}`);
      if (!searchRes.ok) return window.showToast("Phantom not found.");
      const targetUser = await searchRes.json();
      const roomRes = await fetch(`${BACKEND_URL}/api/rooms/direct?user1Id=${userProfile.id}&user2Id=${targetUser.id}`, { method: 'POST' });
      setRoomData(await roomRes.json());
      setActiveView('1on1');
    } catch(e) { window.showToast("Failed to connect."); }
  };

  const createPrivateRoom = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/private?userId=${userProfile.id}`, { method: 'POST' });
      if (!res.ok) throw new Error("Forbidden");
      setRoomData(await res.json());
      setActiveView('1on1');
    } catch(e) { window.showToast("Requires Phantom Pass"); }
  };

  const joinPrivateRoom = async () => {
    if (!passcodeSearch.trim()) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/join-private?passcode=${passcodeSearch.trim()}`);
      if (!res.ok) throw new Error("Not found");
      setRoomData(await res.json());
      setActiveView('1on1');
    } catch(e) { window.showToast("Invalid passcode"); }
  };

  const unlockPremium = async () => {
    const res = await fetch(`${BACKEND_URL}/api/users/${userProfile.id}/upgrade`, { method: 'POST' });
    onUpdateUser(await res.json());
    window.showToast("Phantom Pass Unlocked!");
  };

  return (
    <>
      <BreathingBackground colors={['#020203', '#0b0c10']} />
      
      {showEvolutionModal && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ borderColor: userProfile.vibeColor }}>
            <span style={{ fontSize: '5rem', marginBottom: '1rem', display: 'block', textShadow: `0 0 20px ${userProfile.vibeColor}` }}>{userProfile.symbol}</span>
            <h2 style={{ textTransform: 'uppercase', letterSpacing: '4px' }}>Your Phantom Evolved</h2>
            <p style={{ fontStyle: 'italic', margin: '2rem 0' }}>"{userProfile.evolutionMessage}"</p>
            <button className="glass-btn" onClick={clearEvolution}>EMBRACE THE CHANGE</button>
          </div>
        </div>
      )}

      {activeView === 'menu' && (
        <div className="onboarding-container fade-in" style={{ justifyContent: 'flex-start', paddingTop: '8vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '200', letterSpacing: '10px', margin: 0, textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>GHOST MODE</h1>
          </div>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ color: userProfile.isPremium ? '#D4AF37' : '#A0A0A0', letterSpacing: '4px', fontSize: '0.8rem' }}>
              {userProfile.isPremium ? '✦ PREMIUM PHANTOM ✦' : 'YOUR PHANTOM ID'}
            </h3>
            <h1 style={{ fontSize: '3.5rem', letterSpacing: '10px', fontWeight: '300', margin: '1rem 0' }}>{userProfile.phantomId}</h1>
          </div>

          <div className="grid" style={{ maxWidth: '800px', flexDirection: 'column', width: '100%' }}>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '1.5rem' }}>
               <button className="glass-btn" style={{ flex: 1, padding: '1rem', borderColor: '#D4AF37', color: '#D4AF37' }} onClick={unlockPremium}>
                 {userProfile.isPremium ? "✦ PHANTOM PASS ACTIVE" : "UNLOCK PHANTOM PASS"}
               </button>
               <button className="glass-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setIsLightMode(!isLightMode)}>
                 {isLightMode ? "🌙 DARK THEME" : "☀️ LIGHT THEME"}
               </button>
            </div>
            
            {/* Direct Summon */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ letterSpacing: '2px', fontSize: '1rem', color: '#A0A0A0', marginBottom: '1rem', textTransform: 'uppercase' }}>Summon Direct</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="text-input glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="Enter ID (G-XXXX)" value={phantomSearch} onChange={e => setPhantomSearch(e.target.value)} />
                <button className="glass-btn" onClick={startDirectMatch}>CONNECT</button>
              </div>
            </div>

            {/* Private Rituals */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'left', borderColor: userProfile.isPremium ? '#D4AF37' : 'rgba(255,255,255,0.1)' }}>
              <h3 style={{ letterSpacing: '2px', fontSize: '1rem', color: userProfile.isPremium ? '#D4AF37' : '#A0A0A0', marginBottom: '1rem', textTransform: 'uppercase' }}>Private Rituals</h3>
              {userProfile.isPremium ? (
                <button className="glass-btn" style={{ width: '100%', marginBottom: '1rem', color: '#D4AF37', borderColor: '#D4AF37', background: 'rgba(212,175,55,0.1)' }} onClick={createPrivateRoom}>+ CREATE PRIVATE RITUAL</button>
              ) : (
                <p style={{ fontStyle: 'italic', color: '#888', marginBottom: '1rem' }}>Pass required to create rooms.</p>
              )}
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="text-input glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }} placeholder="4-Digit Passcode" maxLength="4" value={passcodeSearch} onChange={e => setPasscodeSearch(e.target.value)} />
                <button className="glass-btn" onClick={joinPrivateRoom}>JOIN</button>
              </div>
            </div>
            
            <div className="glass-card menu-item" onClick={() => setActiveView('coven')}>
              <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>🕯️</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>The Coven</h3>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Your inner circle.</p>
              </div>
            </div>

            <div className="glass-card menu-item" onClick={startDeepMatch}>
              <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>🔮</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>Deep Match</h3>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>AI-paired 1-on-1 connection.</p>
              </div>
            </div>

            <div className="glass-card menu-item" onClick={() => setActiveView('void')}>
              <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>🌌</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>The Void</h3>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Drop a fleeting thought into darkness.</p>
              </div>
            </div>

            <div className="glass-card menu-item" onClick={() => setActiveView('rooms_list')}>
              <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>🏰</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>Ghost Rooms</h3>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Enter ephemeral public topics.</p>
              </div>
            </div>

            {!userProfile.isPremium && (
               <div className="glass-card menu-item" style={{ borderColor: '#D4AF37', background: 'rgba(212,175,55,0.05)' }} onClick={unlockPremium}>
                 <div style={{ textAlign: 'center', width: '100%' }}>
                   <h3 style={{ color: '#D4AF37', letterSpacing: '2px' }}>✦ UNLOCK PHANTOM PASS</h3>
                 </div>
               </div>
            )}

          </div>
        </div>
      )}

      {activeView === '1on1' && <ChatInterface userProfile={userProfile} roomData={roomData} onBack={() => setActiveView('menu')} />}
      {activeView === 'void' && <TheVoid userProfile={userProfile} onBack={() => setActiveView('menu')} />}
      {activeView === 'rooms_list' && <GhostRoomsList onJoinRoom={(r) => { setRoomData(r); setActiveView('1on1'); }} onBack={() => setActiveView('menu')} />}
      {activeView === 'coven' && <TheCoven onSummon={id => { setPhantomSearch(id); startDirectMatch(); }} onBack={() => setActiveView('menu')} />}
    </>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  return (
    <div className="app-wrapper">
      <ToastContainer />
      {!profile ? <Onboarding onComplete={setProfile} /> : <Dashboard userProfile={profile} onUpdateUser={setProfile} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
