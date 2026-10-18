import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowLeftRight, Boxes, ChevronDown, ChevronRight, CircleHelp, LayoutDashboard, LogOut, Menu, Package, Settings2, Store, Truck, Users, X } from 'lucide-react'
import { titleCase } from '../../shared/inventory.js'

const navigation = [
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard }, { id: 'inventario', label: 'Inventario', icon: Boxes },
  { id: 'productos', label: 'Productos', icon: Package }, { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight },
  { id: 'transferencias', label: 'Transferencias', icon: Truck }, { id: 'ajustes', label: 'Ajustes', icon: Settings2 },
  { id: 'sucursales', label: 'Sucursales', icon: Store, admin: true }, { id: 'usuarios', label: 'Usuarios', icon: Users, admin: true },
  { id: 'reconocimiento', label: 'Reconocimiento', icon: Activity },
]

export function AppShell({ page, setPage, data, role, userName, branchName, apiReady, apiBaseUrl, notice, setNotice, signOut, children }) {
  const [open, setOpen] = useState(false)
  const menuTriggerRef = useRef(null)
  const drawerRef = useRef(null)
  const wasOpenRef = useRef(false)
  const isAdmin = role === 'administrador'
  const labels = Object.fromEntries(navigation.map(({ id, label }) => [id, label]))
  const title = labels[page] || 'Inicio'

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) menuTriggerRef.current?.focus()
      wasOpenRef.current = false
      return
    }
    wasOpenRef.current = true
    const focusable = () => [...(drawerRef.current?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])') || [])]
    const firstNav = drawerRef.current?.querySelector('.nav-item.active') || drawerRef.current?.querySelector('.nav-item')
    ;(firstNav || focusable()[0])?.focus()
    function onKeyDown(event) {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      if (!items.length) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === items[0] || !drawerRef.current?.contains(document.activeElement))) { event.preventDefault(); items.at(-1).focus() }
      else if (!event.shiftKey && (document.activeElement === items.at(-1) || !drawerRef.current?.contains(document.activeElement))) { event.preventDefault(); items[0].focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  const visibleNav = navigation.filter((item) => !item.admin || isAdmin)
  return <div className="app-shell">
    <aside ref={drawerRef} id="primary-navigation" className={`sidebar ${open ? 'sidebar-open' : ''}`} aria-hidden={!open} inert={!open}>
      <div className="brand"><div className="brand-mark">M</div><div><strong>MANACO</strong><span>GESTIÓN DE INVENTARIO</span></div><button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Cerrar menú"><X size={18} /></button></div>
      <div className="branch-switch"><span className="branch-dot" /><span><small>OPERANDO EN</small><strong>{branchName}</strong></span><ChevronDown size={15} /></div>
      <nav aria-label="Navegación principal"><div className="nav-caption">MENÚ PRINCIPAL</div>
        {visibleNav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setOpen(false) }}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{id === 'ajustes' && data.tablero?.ajustes_pendientes > 0 && <i className="nav-badge">{data.tablero.ajustes_pendientes}</i>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><div><strong>¿Necesitás ayuda?</strong><small>Consultá la guía de uso</small></div><ChevronRight size={15} /></div><div className="user-mini"><div className="avatar">{userName.slice(0, 1).toUpperCase()}</div><div className="user-mini-copy"><strong>{userName}</strong><small>{titleCase(role)}</small></div><button className="icon-button" onClick={() => signOut()} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={17} /></button></div></div>
    </aside>
    {open && <button className="mobile-scrim" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
    <main className="main-area">
      <header className="topbar"><div className="topbar-title"><button ref={menuTriggerRef} className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Abrir menú" aria-controls="primary-navigation" aria-expanded={open}><Menu size={20} /></button><div><div className="eyebrow">MANACO / {title.toUpperCase()}</div><h1>{title}</h1></div></div><div className="topbar-right"><div className="api-status"><span className={`status-dot ${apiReady === false ? 'offline' : ''}`} />{apiReady === false ? 'API desconectada' : 'Sistema conectado'}</div><div className="topbar-date">{new Intl.DateTimeFormat('es-BO', { dateStyle: 'full' }).format(new Date())}</div><button className="avatar top-avatar" onClick={() => signOut()} title={`Cerrar sesión de ${userName}`}>{userName.slice(0, 1).toUpperCase()}</button></div></header>
      {notice && <div className={`toast ${notice.type}`} role="status"><span className="toast-icon">{notice.type === 'success' ? '✓' : '×'}</span>{notice.message}<button onClick={() => setNotice(null)} aria-label="Cerrar notificación"><X size={15} /></button></div>}
      <div className="page-content">{children}</div>
      <footer className="footer"><span>MANACO · Gestión de inventario</span><span><span className="footer-dot" /> API: {apiBaseUrl}</span></footer>
    </main>
  </div>
}
