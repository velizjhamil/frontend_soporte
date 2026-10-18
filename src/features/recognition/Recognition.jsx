import { CircleHelp, Package } from 'lucide-react'
import { titleCase } from '../../shared/inventory.js'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Recognition({ data, loading }) {
  return (
    <>
      <PageHeading title="Reconocimiento visual" subtitle="Estado del modelo de reconocimiento de productos." />
      <div className="recognition-layout">
        <section className="panel recognition-card">
          <div className="recognition-art">
            <div className="scan-frame">
              <div className="scan-line" />
              <Package size={36} strokeWidth={1.25} />
            </div>
            <div className="recognition-orbit recognition-orbit-one" />
            <div className="recognition-orbit recognition-orbit-two" />
          </div>
          <div className="recognition-copy">
            <div className="eyebrow">ESTADO DEL MODELO</div>
            <div className="recognition-title">
              <span className="status-dot offline" />
              {loading ? 'Consultando estado…' : titleCase(data?.estado || 'sin entrenar')}
            </div>
            <p>{data?.detalle || 'El modelo está pendiente de entrenamiento. El catálogo actual se gestiona con selección manual.'}</p>
            <div className="notice-banner">
              <CircleHelp size={17} />
              <span>La API todavía no ofrece predicciones de productos. No se simulan resultados.</span>
            </div>
          </div>
        </section>
        <div className="recognition-side">
          <div className="eyebrow">PARA ACTIVAR EL MODELO</div>
          <h3>De los datos a una operación más ágil.</h3>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Fotografías etiquetadas</strong>
                <small>Preparar imágenes reales de cada producto.</small>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Entrenamiento del modelo</strong>
                <small>Entrenar con un conjunto validado.</small>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Evaluación y despliegue</strong>
                <small>Medir precisión antes de integrar.</small>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </>
  )
}
