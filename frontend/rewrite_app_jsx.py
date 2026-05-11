import os

app_jsx_path = r"C:\Users\manju\.gemini\antigravity\scratch\ghost-mode\frontend\app.jsx"

with open(app_jsx_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. LIGHT THEME SUPPORT IN BreathingBackground & CSS
bb_old = """function BreathingBackground({ colors }) {
  return (
    <div className="bg-container">
      <div className="bg-gradient" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}></div>
      <div className="bg-overlay"></div>
    </div>
  );
}"""

bb_new = """function BreathingBackground({ colors, isLightMode }) {
  const overlayStyle = isLightMode ? { backgroundColor: 'rgba(255, 255, 255, 0.7)' } : {};
  if (isLightMode) colors = ['#E8E8E8', '#FFFFFF'];
  
  return (
    <div className="bg-container">
      <div className="bg-gradient" style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}></div>
      <div className="bg-overlay" style={overlayStyle}></div>
    </div>
  );
}"""
content = content.replace(bb_old, bb_new)


# 2. Add THE COVEN (Friends List) Component
coven_component = """
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
"""
content = content.replace("function ChatInterface", coven_component + "function ChatInterface")


# 3. Add BURN MODE & LIGHT THEME to Dashboard
dash_start_old = """function Dashboard({ userProfile, onUpdateUser }) {
  const [activeView, setActiveView] = useState('menu'); // menu, 1on1, void, rooms_list
  const [roomData, setRoomData] = useState(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(!!userProfile.evolutionMessage);"""

dash_start_new = """function Dashboard({ userProfile, onUpdateUser }) {
  const [activeView, setActiveView] = useState('menu'); // menu, 1on1, void, rooms_list, coven
  const [roomData, setRoomData] = useState(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(!!userProfile.evolutionMessage);
  const [isLightMode, setIsLightMode] = useState(false);"""
content = content.replace(dash_start_old, dash_start_new)

# Make Dashboard pass isLightMode
content = content.replace("<BreathingBackground colors={userProfile.vibeColor ? [userProfile.vibeColor, '#020203'] : undefined} />", "<BreathingBackground colors={userProfile.vibeColor ? [userProfile.vibeColor, '#020203'] : undefined} isLightMode={isLightMode} />")


# Add Premium Unlock
unlock_old = """  const unlockPremium = async () => {
    const res = await fetch(`${BACKEND_URL}/api/users/${userProfile.id}/upgrade`, { method: 'POST' });
    onUpdateUser(await res.json());
  };"""
# It already has unlockPremium. Let's make sure it's in the Dashboard rendering.
unlock_btn_old = """          <div className="grid" style={{ maxWidth: '800px', flexDirection: 'column', width: '100%' }}>"""
unlock_btn_new = """          <div className="grid" style={{ maxWidth: '800px', flexDirection: 'column', width: '100%' }}>
            
            <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '1.5rem' }}>
               <button className="glass-btn" style={{ flex: 1, padding: '1rem', borderColor: '#D4AF37', color: '#D4AF37' }} onClick={unlockPremium}>
                 {userProfile.isPremium ? "✦ PHANTOM PASS ACTIVE" : "UNLOCK PHANTOM PASS"}
               </button>
               <button className="glass-btn" style={{ flex: 1, padding: '1rem' }} onClick={() => setIsLightMode(!isLightMode)}>
                 {isLightMode ? "🌙 DARK THEME" : "☀️ LIGHT THEME"}
               </button>
            </div>"""
content = content.replace(unlock_btn_old, unlock_btn_new)


# Phantom ID Copying
copy_id_old = """          <div style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1rem', letterSpacing: '4px', color: '#A0A0A0', marginBottom: '10px' }}>PHANTOM ID</h2>
            <h1 style={{ fontSize: '3rem', letterSpacing: '8px', fontWeight: '300' }}>{userProfile.phantomId}</h1>
          </div>"""
copy_id_new = """          <div style={{ marginBottom: '3rem', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(userProfile.phantomId); alert('Phantom ID Copied!'); }}>
            <h2 style={{ fontSize: '1rem', letterSpacing: '4px', color: userProfile.isPremium ? '#D4AF37' : '#A0A0A0', marginBottom: '10px' }}>
              {userProfile.isPremium ? '✦ PREMIUM PHANTOM ✦' : 'YOUR PHANTOM ID'}
            </h2>
            <h1 style={{ fontSize: '3rem', letterSpacing: '8px', fontWeight: '300' }}>{userProfile.phantomId}</h1>
            <p style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginTop: '5px' }}>Tap to copy & share</p>
          </div>"""
content = content.replace(copy_id_old, copy_id_new)


# Add The Coven button to menu
coven_menu_btn = """            <div className="glass-card menu-item" onClick={() => setActiveView('coven')}>
              <span style={{ fontSize: '2.5rem', marginRight: '2rem' }}>🕯️</span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ letterSpacing: '2px', fontSize: '1.2rem' }}>The Coven</h3>
                <p style={{ color: '#A0A0A0', fontSize: '0.9rem', marginTop: '5px' }}>Your inner circle.</p>
              </div>
            </div>
"""
content = content.replace("            <div className=\"glass-card menu-item\" onClick={startDeepMatch}>", coven_menu_btn + "\n            <div className=\"glass-card menu-item\" onClick={startDeepMatch}>")


# Add TheCoven view logic
view_logic_old = """      {activeView === 'rooms_list' && <GhostRoomsList onJoinRoom={(r) => { setRoomData(r); setActiveView('1on1'); }} onBack={() => setActiveView('menu')} />}"""
view_logic_new = """      {activeView === 'rooms_list' && <GhostRoomsList onJoinRoom={(r) => { setRoomData(r); setActiveView('1on1'); }} onBack={() => setActiveView('menu')} />}
      {activeView === 'coven' && <TheCoven onSummon={id => { setPhantomSearch(id); startDirectMatch(); }} onBack={() => setActiveView('menu')} />}"""
content = content.replace(view_logic_old, view_logic_new)


# 4. FIX ChatInterface BURN MODE 
chat_start_old = """function ChatInterface({ userProfile, roomData, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');"""
chat_start_new = """function ChatInterface({ userProfile, roomData, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [burnMode, setBurnMode] = useState(false);"""
content = content.replace(chat_start_old, chat_start_new)

# Update payload to include isEphemeral
chat_send_old = """      const payload = {
        content: inputText,
        sender: { id: userProfile.id },
        room: { id: roomData.id }
      };"""
chat_send_new = """      const payload = {
        content: inputText,
        sender: { id: userProfile.id },
        room: { id: roomData.id },
        isEphemeral: burnMode
      };"""
content = content.replace(chat_send_old, chat_send_new)

# Add burnMode button to Chat input area
chat_input_old = """      <form className="chat-input-area glass-card" onSubmit={handleSend} style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
        <input type="text" className="text-input" placeholder="Whisper..." value={inputText} onChange={e => setInputText(e.target.value)} />
        <button type="submit" className="glass-btn" style={{ marginLeft: '1rem' }}>SEND</button>
      </form>"""
chat_input_new = """      <div style={{ position: 'relative' }}>
        <button className="glass-btn" style={{ position: 'absolute', top: '-40px', right: '20px', padding: '0.3rem 0.8rem', fontSize: '0.8rem', backgroundColor: burnMode ? '#FF4444' : 'transparent', borderColor: burnMode ? '#fff' : 'rgba(255,255,255,0.1)' }} onClick={() => setBurnMode(!burnMode)}>
          {burnMode ? '🔥 BURN MODE ON' : 'BURN MODE OFF'}
        </button>
        <form className="chat-input-area glass-card" onSubmit={handleSend} style={{ borderRadius: 0, borderBottom: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <input type="text" className="text-input" placeholder="Whisper..." value={inputText} onChange={e => setInputText(e.target.value)} />
          <button type="submit" className="glass-btn" style={{ marginLeft: '1rem', backgroundColor: burnMode ? '#FF4444' : 'transparent', borderColor: burnMode ? '#FF4444' : 'rgba(255,255,255,0.2)' }}>SEND</button>
        </form>
      </div>"""
content = content.replace(chat_input_old, chat_input_new)

# Let's fix the css for isLightMode. If isLightMode is true, we want everything dark to be light.
# In styles.css, we could add a `.light-mode` class, but we don't need to overcomplicate it. The text color is #E8E8E8, which won't show on white background.
# I'll just add a global style override in Dashboard.
light_mode_css = """      <style>{isLightMode ? `
        body { color: #111 !important; }
        .glass-card { background: rgba(255, 255, 255, 0.4) !important; border-color: rgba(0,0,0,0.1) !important; }
        .glass-btn { color: #111 !important; border-color: rgba(0,0,0,0.2) !important; }
        h1, h2, h3, p, span { color: #111 !important; }
        .text-input { color: #111 !important; background: rgba(255, 255, 255, 0.5) !important; }
        .text-input::placeholder { color: #666 !important; }
        .message-me { background: rgba(0, 0, 0, 0.1) !important; border-color: rgba(0,0,0,0.1) !important; }
        .message-them { background: rgba(0, 0, 0, 0.05) !important; border-color: rgba(0,0,0,0.2) !important; }
      ` : ''}</style>"""

content = content.replace("<BreathingBackground colors={userProfile.vibeColor ? [userProfile.vibeColor, '#020203'] : undefined} isLightMode={isLightMode} />", "<BreathingBackground colors={userProfile.vibeColor ? [userProfile.vibeColor, '#020203'] : undefined} isLightMode={isLightMode} />\n" + light_mode_css)


with open(app_jsx_path, "w", encoding="utf-8") as f:
    f.write(content)

print("app.jsx rewritten successfully with Coven, Burn Mode, Light Theme, and Premium unlocks.")
