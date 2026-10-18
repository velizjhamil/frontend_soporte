import { ChevronRight, ShieldCheck } from 'lucide-react'

export function LoginScreen({ onSubmit, busy, error }) {
  return (
    <main className="login-screen">
      <div className="login-panel">
        <div className="brand login-brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MANACO</strong>
            <span>GESTIÓN DE INVENTARIO</span>
          </div>
        </div>
        <div className="login-intro">
          <div className="login-kicker">
            <span /> CONTROL DE INVENTARIO
          </div>
          <h1>
            Todo en orden.<br />
            <em>En cada sucursal.</em>
          </h1>
          <p>Ingresá a tu espacio de trabajo para administrar existencias, movimientos y mucho más.</p>
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <label>
            Usuario
            <input name="username" autoComplete="username" placeholder="Tu nombre de usuario" required />
          </label>
          <label>
            Contraseña
            <input type="password" name="password" autoComplete="current-password" placeholder="Ingresá tu contraseña" required />
          </label>
          {error && <div className="login-error" role="alert">{error}</div>}
          <button className="button button-primary login-submit" disabled={busy}>
            {busy ? 'Ingresando…' : 'Ingresar'}
            <ChevronRight size={17} />
          </button>
          <div className="login-secure">
            <ShieldCheck size={15} /> Acceso protegido con sesión segura
          </div>
        </form>
        <small className="login-footer">© MANACO · Sistema interno</small>
      </div>
      <div className="login-art">
        <div className="art-topline">
          <span>MANACO / OPERACIONES</span>
          <span>GESTIÓN INTELIGENTE</span>
        </div>
        <div className="art-grid" />
        <div className="art-orbit orbit-one" />
        <div className="art-orbit orbit-two" />
        <div className="art-card floating-card">
          <div className="art-card-label">INVENTARIO TOTAL</div>
          <div className="art-card-number">12.840 <small>pares</small></div>
          <div className="art-card-bottom">
            <span className="art-up">↗ 8,2%</span>
            <span>vs. mes anterior</span>
          </div>
        </div>
        <div className="art-side-label">PENSADO PARA MOVER LO QUE TE MUEVE.</div>
        <div className="art-bottom">
          <span>UNA OPERACIÓN MÁS SIMPLE.</span>
          <span>01 — 09</span>
        </div>
      </div>
    </main>
  )
}
