import { useState, type ReactNode } from 'react'
import './App.css'

type IconName = 'chevron' | 'mute' | 'headphones' | 'settings' | 'browse' | 'check' | 'announce'
type Channel = { label: string; prefix?: string; icon?: IconName; unread?: boolean }

const channelGroups: { name?: string; items: Channel[] }[] = [
  { items: [{ label: 'rules', icon: 'check' }, { label: 'dont-touch-ya', prefix: '😊', icon: 'announce', unread: true }] },
  { name: 'Welcomers!!', items: [{ label: 'welcome-and-leave', prefix: '👋', unread: true }, { label: 'self-intro', prefix: '📄' }] },
  { name: 'AREA LINKS AND ADVERTISING', items: [{ label: 'share-link', prefix: '🔗', unread: true }] },
  { name: 'AREA CHAT LEK DISINI YA', items: [{ label: 'chat-umum', prefix: '☁️', unread: true }, { label: 'roblox-moment', prefix: '🖼️', unread: true }, { label: 'vidio-foto', prefix: '📷', unread: true }] },
]

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const shapes: Record<IconName, ReactNode> = {
    chevron: <path d="m6 9 6 6 6-6" />,
    mute: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="m19 9-6 6M13 9l6 6" /></>,
    headphones: <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M18 19c0 1-1 2-2 2h-1v-7h3v5ZM6 19c0 1 1 2 2 2h1v-7H6v5Z" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56v.08h-3v-.08A1.7 1.7 0 0 0 10.68 18.7a1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7.02 15 1.7 1.7 0 0 0 5.46 14H5.4v-3h.06A1.7 1.7 0 0 0 7.02 10a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06a1.7 1.7 0 0 0 1.88.34A1.7 1.7 0 0 0 11.7 4.78V4.7h3v.08a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06A1.7 1.7 0 0 0 19.4 10 1.7 1.7 0 0 0 20.96 11h.06v3h-.06A1.7 1.7 0 0 0 19.4 15Z" /></>,
    browse: <><path d="M4 5h16M4 10h12M4 15h12M4 20h9" /><circle cx="18" cy="18" r="3" /><path d="m20.3 20.3 1.7 1.7" /></>,
    check: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="m8 11 3 3 5-5" /></>,
    announce: <><path d="M4 11v2a2 2 0 0 0 2 2h2l8 4V5l-8 4H6a2 2 0 0 0-2 2Z" /><path d="M8 15v4" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[name]}</svg>
}

function App() {
  const [activeChannel, setActiveChannel] = useState('welcome-and-leave')
  const [isMuted, setIsMuted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return <main className="app-shell">
    <nav className="server-rail" aria-label="Daftar server"><div className="rail-active" /><div className="server-mark">A</div><button aria-label="Tambah server">+</button></nav>
    <aside className="channel-sidebar" aria-label="Daftar channel">
      <header className="server-header">
        <button className="server-name" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}><span>PEN</span><Icon name="chevron" size={18} /></button>
        <button className="invite-button" aria-label="Undang anggota">♟<b>+</b></button>
        {menuOpen && <div className="server-menu"><button>Pengaturan server</button><button>Buat channel</button><button className="danger">Keluar dari server</button></div>}
      </header>

      <div className="channel-scroll">
        <button className="boost-goal"><strong>Boost Goal</strong><span>0/33 Boosts</span><b>›</b></button>
        <button className="browse-channels"><Icon name="browse" size={24} />Browse Channels</button>
        <div className="divider" />
        {channelGroups.map((group) => <section className="channel-group" key={group.name ?? 'top'}>
          {group.name && <button className="category-name">{group.name}<Icon name="chevron" size={15} /></button>}
          {group.items.map((channel) => <button key={channel.label} onClick={() => setActiveChannel(channel.label)} className={`channel-item ${activeChannel === channel.label ? 'active' : ''} ${channel.unread ? 'unread' : ''}`}>
            {channel.unread && <i className="unread-dot" />}
            {channel.icon ? <Icon name={channel.icon} size={22} /> : <span className="hash">#</span>}
            {channel.prefix && <span className="emoji">{channel.prefix}</span>}
            <span>{channel.label}</span>
          </button>)}
        </section>)}
      </div>

      <footer className="user-panel">
        <button className="profile-button" aria-label="Buka profil"><span className="avatar">A<i /></span><span className="profile-details"><strong>aether</strong><small>{isMuted ? 'Muted' : 'Online'}</small></span></button>
        <div className="user-controls">
          <button className={isMuted ? 'muted' : ''} onClick={() => setIsMuted((muted) => !muted)} aria-label={isMuted ? 'Aktifkan mikrofon' : 'Mute mikrofon'}><Icon name="mute" /></button>
          <button aria-label="Deafen"><Icon name="headphones" /></button>
          <button aria-label="Pengaturan pengguna"><Icon name="settings" /></button>
        </div>
      </footer>
    </aside>
    <section className="chat-area"><div><span>#</span><h1>{activeChannel}</h1><p>Pilih channel untuk mulai mengobrol.</p></div></section>
  </main>
}

export default App
