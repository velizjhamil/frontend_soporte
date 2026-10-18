import { Activity, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Boxes, ChevronRight, Package, Settings2, Truck } from 'lucide-react'
import { currency, dateValue, findBranch, getId, titleCase } from '../../shared/inventory.js'
import { EmptyRow, EmptyState, StatusPill } from '../../components/shared/DataStates.jsx'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Dashboard({ data, loading, isAdmin, onNavigate, onRefresh }) {
  const board = data.tablero || {}
  const metrics = [
    { title: 'Pares disponibles', value: Number(board.pares_disponibles || 0).toLocaleString('es-BO'), meta: 'Stock en sucursales', icon: Boxes, accent: 'green' },
    { title: 'Bajo mínimo', value: Number(board.existencias_bajo_minimo || 0).toLocaleString('es-BO'), meta: 'Requieren reposición', icon: Activity, accent: 'amber' },
    { title: 'En tránsito', value: Number(board.pares_en_transito || 0).toLocaleString('es-BO'), meta: 'Pares por recibir', icon: Truck, accent: 'blue' },
    { title: 'Ajustes pendientes', value: Number(board.ajustes_pendientes || 0).toLocaleString('es-BO'), meta: 'Solicitudes por revisar', icon: Settings2, accent: 'violet' },
  ]

  return (
    <>
      <PageHeading
        eyebrow="VISTA GENERAL"
        title="Buen día, equipo"
        subtitle="Este es el estado de tu operación hoy."
        onRefresh={onRefresh}
        actions={
          <span className="date-pill">
            {new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        }
      />
      <div className="metric-grid">
        {metrics.map(({ title, value, meta, icon: Icon, accent }) => (
          <div className="metric-card" key={title}>
            <div className={`metric-icon ${accent}`}><Icon size={19} /></div>
            <div className="metric-meta">{meta}</div>
            <strong className="metric-value">{loading && !data.tablero ? '—' : value}</strong>
            <div className="metric-title">{title}</div>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel stock-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">ATENCIÓN REQUERIDA</div>
              <h3>Stock en nivel crítico</h3>
            </div>
            <button className="text-link" onClick={() => onNavigate('inventario')}>
              Ver inventario <ChevronRight size={15} />
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUCTO / VARIANTE</th>
                  <th>SUCURSAL</th>
                  <th>DISPONIBLE</th>
                  <th>MÍNIMO</th>
                  <th>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {(data.existencias || []).filter((item) => item.bajo_minimo).slice(0, 5).map((item) => (
                  <tr key={getId(item, 'id_existencia')}>
                    <td>
                      <strong>{item.nombre_producto}</strong>
                      <small>{item.codigo_variante} · {item.talla} / {item.color}</small>
                    </td>
                    <td>{findBranch(data, item.id_sucursal)}</td>
                    <td><strong>{item.cantidad} pares</strong></td>
                    <td>{item.cantidad_minima}</td>
                    <td><StatusPill label="Bajo mínimo" tone="warning" /></td>
                  </tr>
                ))}
                {!data.existencias?.some((item) => item.bajo_minimo) && (
                  <EmptyRow colSpan={5} loading={loading} text="Todo bien por acá. No hay posiciones bajo el mínimo." />
                )}
              </tbody>
            </table>
          </div>
        </section>
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">ACTIVIDAD RECIENTE</div>
              <h3>Últimos movimientos</h3>
            </div>
            <button className="icon-button" onClick={() => onNavigate('movimientos')} aria-label="Ver movimientos">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="activity-list">
            {(data.movimientos || []).slice(0, 5).map((item) => (
              <div className="activity-row" key={item.id_movimiento}>
                <div className={`activity-icon ${item.variacion_cantidad > 0 ? 'in' : 'out'}`}>
                  {item.variacion_cantidad > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                </div>
                <div className="activity-description">
                  <strong>{titleCase(item.tipo)}</strong>
                  <small>{item.motivo || 'Movimiento de inventario'} · {dateValue(item.fecha_creacion)}</small>
                </div>
                <span className={`activity-amount ${item.variacion_cantidad > 0 ? 'positive' : ''}`}>
                  {item.variacion_cantidad > 0 ? '+' : ''}{item.variacion_cantidad}
                </span>
              </div>
            ))}
            {!data.movimientos?.length && <EmptyState loading={loading} text="Todavía no hay movimientos recientes." />}
          </div>
        </section>
      </div>
      <div className="quick-row">
        <div className="quick-copy">
          <div className="eyebrow">ACCESOS DIRECTOS</div>
          <strong>¿Qué necesitás hacer?</strong>
        </div>
        <button onClick={() => onNavigate('movimientos')}>
          <span className="quick-icon green"><ArrowLeftRight size={17} /></span>
          <span><strong>Registrar movimiento</strong><small>Entrada o salida</small></span>
          <ChevronRight size={16} />
        </button>
        <button onClick={() => onNavigate('transferencias')}>
          <span className="quick-icon blue"><Truck size={17} /></span>
          <span><strong>Enviar transferencia</strong><small>Entre sucursales</small></span>
          <ChevronRight size={16} />
        </button>
        {isAdmin && (
          <button onClick={() => onNavigate('productos')}>
            <span className="quick-icon amber"><Package size={17} /></span>
            <span><strong>Nuevo producto</strong><small>Ampliar catálogo</small></span>
            <ChevronRight size={16} />
          </button>
        )}
      </div>
      {isAdmin && (
        <div className="valuation-banner">
          <div className="valuation-mark">M</div>
          <div>
            <small>VALOR ESTIMADO DEL INVENTARIO</small>
            <strong>{currency.format(Number(board.valor_estimado_inventario_bob || 0))}</strong>
          </div>
          <span>Estimación referencial en base a costos actuales</span>
        </div>
      )}
    </>
  )
}
