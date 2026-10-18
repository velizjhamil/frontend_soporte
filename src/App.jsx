import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiBaseUrl, request } from './services/api.js'
import { AppShell } from './components/layout/AppShell.jsx'
import { LoginScreen, Dashboard, Inventory, Products, Movements, Transfers, Adjustments, Branches, UsersPage, Recognition, ActionModal } from './features/pages.jsx'
import { getId, normalizePayload } from './shared/inventory.js'

const labels = { inicio: 'Inicio', inventario: 'Inventario', productos: 'Productos', movimientos: 'Movimientos', transferencias: 'Transferencias', ajustes: 'Ajustes', sucursales: 'Sucursales', usuarios: 'Usuarios', reconocimiento: 'Reconocimiento' }

function App() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem('manaco-session') || 'null') } catch { return null }
  })
  const [page, setPage] = useState('inventario')
  const [notice, setNotice] = useState(null)
  const [modal, setModal] = useState(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [showLow, setShowLow] = useState(false)
  const [data, setData] = useState({})
  const [loginError, setLoginError] = useState('')
  const [apiReady, setApiReady] = useState(null)

  const role = session?.usuario?.rol
  const isAdmin = role === 'administrador'
  const userName = session?.usuario?.nombre_completo || session?.usuario?.nombre_usuario || 'Usuario'
  const branchName = useMemo(() => {
    const list = Array.isArray(data.sucursales) ? data.sucursales : []
    const branch = list.find((item) => getId(item, 'id_sucursal') === session?.usuario?.id_sucursal)
    return branch?.nombre || (isAdmin ? 'Todas las sucursales' : 'Mi sucursal')
  }, [data.sucursales, isAdmin, session?.usuario?.id_sucursal])

  const signOut = useCallback(async (revoke = true) => {
    if (revoke && session?.token) {
      try { await request('/autenticacion/cerrar-sesion', { token: session.token, method: 'POST' }) } catch { /* local sign-out still succeeds */ }
    }
    localStorage.removeItem('manaco-session')
    setSession(null)
    setData({})
    setPage('inventario')
  }, [session])

  const refresh = useCallback(async (which = page) => {
    if (!session?.token) return
    setLoading(true)
    setNotice(null)
    const idSucursal = !isAdmin ? session.usuario.id_sucursal : undefined
    try {
      const calls = {
        inicio: [
          ['tablero', request('/tablero', { token: session.token, query: { id_sucursal: idSucursal } })],
          ['existencias', request('/existencias', { token: session.token, query: { id_sucursal: idSucursal, limite: 8 } })],
          ['movimientos', request('/movimientos', { token: session.token, query: { id_sucursal: idSucursal, limite: 6 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
        ],
        inventario: [
          ['existencias', request('/existencias', { token: session.token, query: { id_sucursal: idSucursal, solo_bajo_minimo: showLow || undefined, limite: 200 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
          ['variantes', request('/variantes', { token: session.token, query: { limite: 200 } })],
          ['productos', request('/productos', { token: session.token, query: { limite: 200 } })],
        ],
        productos: [
          ['productos', request('/productos', { token: session.token, query: { buscar: query || undefined, limite: 200 } })],
          ['variantes', request('/variantes', { token: session.token, query: { limite: 200 } })],
        ],
        movimientos: [
          ['movimientos', request('/movimientos', { token: session.token, query: { id_sucursal: idSucursal, limite: 200 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
          ['variantes', request('/variantes', { token: session.token, query: { limite: 200 } })],
        ],
        transferencias: [
          ['transferencias', request('/transferencias', { token: session.token, query: { limite: 200 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
          ['variantes', request('/variantes', { token: session.token, query: { limite: 200 } })],
        ],
        ajustes: [
          ['ajustes', request('/ajustes', { token: session.token, query: { limite: 200 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
          ['variantes', request('/variantes', { token: session.token, query: { limite: 200 } })],
        ],
        sucursales: [['sucursales', request('/sucursales', { token: session.token })]],
        usuarios: [
          ['usuarios', request('/usuarios', { token: session.token, query: { limite: 200 } })],
          ['sucursales', request('/sucursales', { token: session.token })],
        ],
        reconocimiento: [['reconocimiento', request('/reconocimiento/estado', { token: session.token })]],
      }
      const entries = calls[which] || []
      const results = await Promise.all(entries.map(async ([key, req]) => [key, await req]))
      const normalized = results.map(([key, value]) => [key, normalizePayload(key, value)])
      setData((current) => ({ ...current, ...Object.fromEntries(normalized) }))
      setApiReady(true)
    } catch (error) {
      if (error.status === 401) {
        await signOut(false)
        setLoginError('Tu sesión venció. Iniciá sesión de nuevo.')
      } else {
        setNotice({ type: 'error', message: error.message })
        if (which === 'inicio') setApiReady(false)
      }
    } finally { setLoading(false) }
  }, [isAdmin, page, query, session, showLow, signOut])

  useEffect(() => { if (session?.token) refresh(page) }, [session?.token, page, showLow])
  async function login(event) {
    event.preventDefault()
    setBusy(true)
    setLoginError('')
    const form = new FormData(event.currentTarget)
    try {
      const result = await request('/autenticacion/iniciar-sesion', {
        method: 'POST', body: { nombre_usuario: form.get('username'), contrasena: form.get('password') },
      })
      const nextSession = { token: result.token_acceso, usuario: result.usuario }
      localStorage.setItem('manaco-session', JSON.stringify(nextSession))
      setPage('inventario')
      setSession(nextSession)
    } catch (error) { setLoginError(error.message) }
    finally { setBusy(false) }
  }

  async function submitAction(action) {
    setBusy(true)
    try {
      await action()
      setModal(null)
      setNotice({ type: 'success', message: 'Cambios guardados correctamente.' })
      await refresh(page)
      return true
    } catch (error) { setNotice({ type: 'error', message: error.message }); return false }
    finally { setBusy(false) }
  }

  useEffect(() => {
    if (page !== 'productos' || !session?.token) return
    const timer = window.setTimeout(() => refresh('productos'), 280)
    return () => window.clearTimeout(timer)
  }, [query])
  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(null), notice.type === 'error' ? 7000 : 3600)
    return () => window.clearTimeout(timer)
  }, [notice])

  if (!session) return <LoginScreen onSubmit={login} busy={busy} error={loginError} />

  const pageContent = <>
    {page === 'inicio' && <Dashboard data={data} loading={loading} isAdmin={isAdmin} onNavigate={setPage} onRefresh={() => refresh('inicio')} />}
    {page === 'inventario' && <Inventory data={data} loading={loading} showLow={showLow} setShowLow={setShowLow} isAdmin={isAdmin} session={session} onRefresh={() => refresh('inventario')} onMinimum={(row) => setModal({ type: 'minimum', row })} onRegister={(values) => submitAction(() => request('/movimientos', { token: session.token, method: 'POST', body: values }))} />}
    {page === 'productos' && <Products data={data} loading={loading} query={query} setQuery={setQuery} onRefresh={() => refresh('productos')} isAdmin={isAdmin} onAddProduct={() => setModal({ type: 'product' })} onEditProduct={(product) => setModal({ type: 'productEdit', product })} onAddVariant={() => setModal({ type: 'variant' })} />}
    {page === 'movimientos' && <Movements data={data} loading={loading} onRefresh={() => refresh('movimientos')} onCreate={() => setModal({ type: 'movement' })} />}
    {page === 'transferencias' && <Transfers data={data} loading={loading} onRefresh={() => refresh('transferencias')} onCreate={() => setModal({ type: 'transfer' })} onReceive={(id) => submitAction(() => request(`/transferencias/${id}/recibir`, { token: session.token, method: 'POST' }))} />}
    {page === 'ajustes' && <Adjustments data={data} loading={loading} isAdmin={isAdmin} onRefresh={() => refresh('ajustes')} onCreate={() => setModal({ type: 'adjustment' })} onReview={(id, decision) => submitAction(() => request(`/ajustes/${id}/revisar`, { token: session.token, method: 'POST', body: { decision } }))} />}
    {page === 'sucursales' && <Branches data={data} loading={loading} onRefresh={() => refresh('sucursales')} onCreate={() => setModal({ type: 'branch' })} />}
    {page === 'usuarios' && <UsersPage data={data} loading={loading} onRefresh={() => refresh('usuarios')} onCreate={() => setModal({ type: 'user' })} onToggle={(user) => submitAction(() => request(`/usuarios/${getId(user, 'id_usuario')}/activo`, { token: session.token, method: 'PATCH', body: { activo: !user.activo } }))} />}
    {page === 'reconocimiento' && <Recognition data={data.reconocimiento} loading={loading} />}
  </>
  const overlay = modal && <ActionModal modal={modal} data={data} busy={busy} onClose={() => setModal(null)} onSubmit={(values) => {
    const token = session.token
    const actions = {
      product: () => request('/productos', { token, method: 'POST', body: { ...values, url_foto: values.url_foto || null } }),
      productEdit: () => request(`/productos/${getId(modal.product, 'id_producto')}`, { token, method: 'PUT', body: { ...values, url_foto: values.url_foto || null, activo: values.activo === 'true' } }),
      variant: () => request('/variantes', { token, method: 'POST', body: { ...values, id_producto: Number(values.id_producto), costo_referencia: Number(values.costo_referencia || 0), precio_venta: Number(values.precio_venta || 0) } }),
      movement: () => request('/movimientos', { token, method: 'POST', body: { ...values, id_sucursal: Number(values.id_sucursal), id_variante: Number(values.id_variante), cantidad: Number(values.cantidad) } }),
      transfer: () => request('/transferencias', { token, method: 'POST', body: { ...values, id_sucursal_origen: Number(values.id_sucursal_origen), id_sucursal_destino: Number(values.id_sucursal_destino), id_variante: Number(values.id_variante), cantidad: Number(values.cantidad) } }),
      adjustment: () => request('/ajustes', { token, method: 'POST', body: { ...values, id_sucursal: Number(values.id_sucursal), id_variante: Number(values.id_variante), variacion_cantidad: Number(values.variacion_cantidad) } }),
      branch: () => request('/sucursales', { token, method: 'POST', body: values }),
      user: () => request('/usuarios', { token, method: 'POST', body: { ...values, id_sucursal: values.id_sucursal ? Number(values.id_sucursal) : null } }),
      minimum: () => request(`/existencias/${modal.row.id_sucursal}/${modal.row.id_variante}/minimo`, { token, method: 'PUT', body: { cantidad_minima: Number(values.cantidad_minima) } }),
    }
    return submitAction(actions[modal.type])
  }} />
  return <AppShell page={page} setPage={setPage} data={data} role={role} userName={userName} branchName={branchName} apiReady={apiReady} apiBaseUrl={apiBaseUrl} notice={notice} setNotice={setNotice} signOut={signOut}>{pageContent}{overlay}</AppShell>
}

export default App
