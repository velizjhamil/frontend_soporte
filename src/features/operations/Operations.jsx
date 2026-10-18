import { Plus, Settings2, Truck } from 'lucide-react'
import { dateValue, findBranch, findVariant, titleCase } from '../../shared/inventory.js'
import { EmptyRow, StatusPill } from '../../components/shared/DataStates.jsx'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Movements({ data, loading, onRefresh, onCreate }) {
  return (
    <>
      <PageHeading
        title="Movimientos"
        subtitle="Historial de entradas y salidas de inventario."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={16} /> Registrar movimiento
          </button>
        }
      />
      <section className="panel data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TIPO</th>
                <th>PRODUCTO / VARIANTE</th>
                <th>SUCURSAL</th>
                <th>CANTIDAD</th>
                <th>MOTIVO</th>
                <th>FECHA</th>
              </tr>
            </thead>
            <tbody>
              {(data.movimientos || []).map((item) => (
                <tr key={item.id_movimiento}>
                  <td>
                    <StatusPill label={titleCase(item.tipo)} tone={item.variacion_cantidad > 0 ? 'success' : 'neutral'} />
                  </td>
                  <td>
                    <strong>{findVariant(data, item.id_variante)}</strong>
                    <small>Variante #{item.id_variante}</small>
                  </td>
                  <td>{findBranch(data, item.id_sucursal)}</td>
                  <td>
                    <span className={`activity-amount ${item.variacion_cantidad > 0 ? 'positive' : ''}`}>
                      {item.variacion_cantidad > 0 ? '+' : ''}{item.variacion_cantidad} pares
                    </span>
                  </td>
                  <td>{item.motivo}</td>
                  <td>{dateValue(item.fecha_creacion)}</td>
                </tr>
              ))}
              {!data.movimientos?.length && (
                <EmptyRow colSpan={6} loading={loading} text="Todavía no hay movimientos registrados." />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export function Transfers({ data, loading, onRefresh, onCreate, onReceive }) {
  return (
    <>
      <PageHeading
        title="Transferencias"
        subtitle="Mové stock entre sucursales y seguí cada envío."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={16} /> Nueva transferencia
          </button>
        }
      />
      <div className="notice-banner">
        <Truck size={18} />
        <span><strong>Importante:</strong> el stock se descuenta al enviar y se suma al confirmar la recepción.</span>
      </div>
      <section className="panel data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TRANSFERENCIA</th>
                <th>ORIGEN → DESTINO</th>
                <th>PRODUCTO / VARIANTE</th>
                <th>CANTIDAD</th>
                <th>ESTADO</th>
                <th>FECHA DE ENVÍO</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data.transferencias || []).map((item) => (
                <tr key={item.id_transferencia}>
                  <td>
                    <strong>TR-{String(item.id_transferencia).padStart(4, '0')}</strong>
                  </td>
                  <td>
                    {findBranch(data, item.id_sucursal_origen)} <span className="muted">→</span> {findBranch(data, item.id_sucursal_destino)}
                  </td>
                  <td>{findVariant(data, item.id_variante)}</td>
                  <td>{item.cantidad} pares</td>
                  <td>
                    <StatusPill label={titleCase(item.estado)} tone={item.estado === 'recibida' ? 'success' : 'info'} />
                  </td>
                  <td>{dateValue(item.fecha_creacion)}</td>
                  <td>
                    {item.estado === 'en_transito' && (
                      <button className="table-action" onClick={() => onReceive(item.id_transferencia)}>
                        Confirmar recepción
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!data.transferencias?.length && (
                <EmptyRow colSpan={7} loading={loading} text="No hay transferencias por mostrar." />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}

export function Adjustments({ data, loading, isAdmin, onRefresh, onCreate, onReview }) {
  const pending = (data.ajustes || []).filter((item) => item.estado === 'pendiente').length

  return (
    <>
      <PageHeading
        title="Ajustes"
        subtitle="Registrá diferencias de conteo y revisá solicitudes."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={onCreate}>
            <Plus size={16} /> Solicitar ajuste
          </button>
        }
      />
      <div className="summary-strip">
        <span className="summary-icon amber">
          <Settings2 size={17} />
        </span>
        <div>
          <strong>{pending} solicitudes pendientes</strong>
          <small>La existencia solo cambia cuando un administrador aprueba el ajuste.</small>
        </div>
      </div>
      <section className="panel data-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SOLICITUD</th>
                <th>PRODUCTO / VARIANTE</th>
                <th>SUCURSAL</th>
                <th>VARIACIÓN</th>
                <th>MOTIVO</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                {isAdmin && <th>ACCIÓN</th>}
              </tr>
            </thead>
            <tbody>
              {(data.ajustes || []).map((item) => (
                <tr key={item.id_ajuste}>
                  <td>
                    <strong>AJ-{String(item.id_ajuste).padStart(4, '0')}</strong>
                  </td>
                  <td>{findVariant(data, item.id_variante)}</td>
                  <td>{findBranch(data, item.id_sucursal)}</td>
                  <td className={item.variacion_cantidad > 0 ? 'positive-text' : ''}>
                    {item.variacion_cantidad > 0 ? '+' : ''}{item.variacion_cantidad} pares
                  </td>
                  <td>{item.motivo}</td>
                  <td>
                    <StatusPill label={titleCase(item.estado)} tone={item.estado === 'aprobado' ? 'success' : item.estado === 'rechazado' ? 'neutral' : 'warning'} />
                  </td>
                  <td>{dateValue(item.fecha_creacion)}</td>
                  {isAdmin && (
                    <td>
                      {item.estado === 'pendiente' && (
                        <div className="inline-actions">
                          <button className="table-action approve" onClick={() => onReview(item.id_ajuste, 'aprobado')}>
                            Aprobar
                          </button>
                          <button className="table-action reject" onClick={() => onReview(item.id_ajuste, 'rechazado')}>
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {!data.ajustes?.length && (
                <EmptyRow colSpan={isAdmin ? 8 : 7} loading={loading} text="Todavía no hay solicitudes de ajuste." />
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
