import os
import re

app_jsx_path = r"C:\Users\manju\.gemini\antigravity\scratch\ghost-mode\frontend\app.jsx"

with open(app_jsx_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Toast state and function to the main App component
# Let's find where function App() is. Wait, `app.jsx` doesn't have a main `App` component that wraps everything, it has `App` which renders Dashboard or Onboarding.
# Let's look for `function App() {`
app_start_old = """function App() {
  const [userProfile, setUserProfile] = useState(null);"""

app_start_new = """function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (message) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };
"""
content = content.replace(app_start_old, app_start_new)

# 2. Add Toast container to the return of App
app_return_old = """  return (
    <div className="app-wrapper">
      {!userProfile ? (
        <Onboarding onComplete={setUserProfile} />
      ) : (
        <Dashboard userProfile={userProfile} onUpdateUser={setUserProfile} />
      )}
    </div>
  );"""

app_return_new = """  return (
    <div className="app-wrapper">
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">{t.message}</div>
        ))}
      </div>
      {!userProfile ? (
        <Onboarding onComplete={setUserProfile} showToast={showToast} />
      ) : (
        <Dashboard userProfile={userProfile} onUpdateUser={setUserProfile} showToast={showToast} />
      )}
    </div>
  );"""
content = content.replace(app_return_old, app_return_new)


# Now we need to pass `showToast` to the components that need it.
content = content.replace("function Onboarding({ onComplete }) {", "function Onboarding({ onComplete, showToast }) {")
content = content.replace("function Dashboard({ userProfile, onUpdateUser }) {", "function Dashboard({ userProfile, onUpdateUser, showToast }) {")

# In Dashboard, we also render GhostRoomsList, TheCoven, ChatInterface, TheVoid.
# GhostRoomsList doesn't use alert. 
# TheCoven uses alert? No, we didn't add alert to Coven. 
# TheVoid uses alert: `alert('Voice echo captured! (Ready for backend upload)');` Wait, earlier I checked Web app.jsx, TheVoid didn't have voice capture, just `alert("Voice dropped into the fog.");` maybe?
# ChatInterface might use alert.
# Let's just do a regex replace for alert(...) inside the components, except we don't have access to showToast in all of them unless we pass it.

# To simplify, we can just replace `alert(` with `showToast(` IF we pass showToast down.
# Or, even better, create a global event listener for toasts! That way we don't have to prop drill.
# Let's revert the App() changes and use a Global event approach.

content = content.replace(app_start_new, app_start_old)
content = content.replace(app_return_new, app_return_old)
content = content.replace("function Onboarding({ onComplete, showToast }) {", "function Onboarding({ onComplete }) {")
content = content.replace("function Dashboard({ userProfile, onUpdateUser, showToast }) {", "function Dashboard({ userProfile, onUpdateUser }) {")

global_toast_logic = """
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

"""

content = content.replace("function BreathingBackground", global_toast_logic + "function BreathingBackground")

# Now add <ToastContainer /> inside <div className="app-wrapper">
app_return_old2 = """  return (
    <div className="app-wrapper">"""
app_return_new2 = """  return (
    <div className="app-wrapper">
      <ToastContainer />"""
content = content.replace(app_return_old2, app_return_new2)

# Finally, replace ALL instances of `alert(` with `window.showToast(`
content = content.replace("alert(", "window.showToast(")

with open(app_jsx_path, "w", encoding="utf-8") as f:
    f.write(content)

print("app.jsx toast updates complete.")
