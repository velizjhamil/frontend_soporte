import { Plus, ShieldCheck, Store, ChevronRight } from 'lucide-react'
import { findBranch, getId, titleCase } from '../../shared/inventory.js'
import { EmptyRow, EmptyState, StatusPill } from '../../components/shared/DataStates.jsx'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Branches({ data, loading, onRefresh, onCreate }) {
  return (
    <>
      <PageHeading
        title="Sucursales"
        subtitle="Consultá y administrá los puntos de operación."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={16} /> Nueva sucursal
          </button>
        }
      />
      <div className="branch-grid">
        {(data.sucursales || []).map((branch) => (
          <article className="branch-card" key={getId(branch, 'id_sucursal')}>
            <div className="branch-card-top">
              <div className="branch-card-icon"><Store size={19} /></div>
              <StatusPill label={branch.activo ? 'Activa' : 'Inactiva'} tone={branch.activo ? 'success' : 'neutral'} />
            </div>
            <div className="eyebrow">SUCURSAL #{String(getId(branch, 'id_sucursal')).padStart(3, '0')}</div>
            <h3>{branch.nombre}</h3>
            <p>{branch.direccion || 'Sin dirección registrada'}</p>
            <div className="branch-card-footer">
              <span><span className="branch-dot" /> Operación activa</span>
              <ChevronRight size={16} />
            </div>
          </article>
        ))}
        {!data.sucursales?.length && (
          <div className="panel branch-empty">
            <EmptyState loading={loading} text="No hay sucursales registradas." />
          </div>
        )}
      </div>
    </>
  )
}

export function UsersPage({ data, loading, onRefresh, onCreate, onToggle }) {
  return (
    <>
      <PageHeading
        title="Usuarios"
        subtitle="Gestioná accesos y roles del equipo."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={16} /> Nuevo usuario
          </button>
        }
      />
      <div className="notice-banner">
        <ShieldCheck size={18} />
        <span>Las cuentas las crea un administrador. No hay registro público.</span>
      </div>
      <section className="panel data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>ROL</th>
                <th>SUCURSAL</th>
                <th>ESTADO</th>
                <th>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {(data.usuarios || []).map((user) => (
                <tr key={user.id_usuario}>
                  <td className="user-cell">
                    <div className="avatar avatar-table">{user.nombre_completo?.slice(0, 1).toUpperCase()}</div>
                    <div>
                      <strong>{user.nombre_completo}</strong>
                      <small>@{user.nombre_usuario}</small>
                    </div>
                  </td>
                  <td>
                    <StatusPill label={titleCase(user.rol)} tone={user.rol === 'administrador' ? 'info' : 'neutral'} />
                  </td>
                  <td>{findBranch(data, user.id_sucursal)}</td>
                  <td>
                    <StatusPill label={user.activo ? 'Activo' : 'Inactivo'} tone={user.activo ? 'success' : 'neutral'} />
                  </td>
                  <td>
                    <button className="table-action" onClick={() => onToggle(user)}>
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {!data.usuarios?.length && (
                <EmptyRow colSpan={5} loading={loading} text="No hay usuarios para mostrar." />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
