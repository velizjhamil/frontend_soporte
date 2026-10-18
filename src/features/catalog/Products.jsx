import { Package, Plus, Search } from 'lucide-react'
import { currency, getId } from '../../shared/inventory.js'
import { EmptyState, StatusPill } from '../../components/shared/DataStates.jsx'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Products({ data, loading, query, setQuery, onRefresh, isAdmin, onAddProduct, onEditProduct, onAddVariant }) {
  const products = data.productos || []
  const variants = data.variantes || []

  return (
    <>
      <PageHeading
        title="Productos"
        subtitle="Administrá el catálogo y las variantes disponibles."
        onRefresh={onRefresh}
        actions={
          isAdmin && (
            <>
              <button className="button button-secondary" onClick={onAddVariant}>
                <Plus size={15} /> Nueva variante
              </button>
              <button className="button button-primary" onClick={onAddProduct}>
                <Plus size={16} /> Nuevo producto
              </button>
            </>
          )
        }
      />
      <section className="panel data-panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Buscar por nombre o código…" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <span className="result-count">{products.length} productos</span>
        </div>
        <div className="product-grid">
          {products.map((product) => {
            const productVariants = variants.filter((item) => item.id_producto === getId(product, 'id_producto'))
            return (
              <article className="product-card" key={getId(product, 'id_producto')}>
                <div className="product-photo">
                  {product.url_foto ? (
                    <img src={product.url_foto} alt={product.nombre} />
                  ) : (
                    <span>{product.nombre?.slice(0, 1)}</span>
                  )}
                  <StatusPill label={product.activo ? 'Activo' : 'Inactivo'} tone={product.activo ? 'success' : 'neutral'} />
                </div>
                <div className="product-info">
                  <div className="product-category">{product.categoria}</div>
                  <h3>{product.nombre}</h3>
                  <div className="product-code">{product.codigo}</div>
                  <div className="product-divider" />
                  <div className="variant-caption">
                    VARIANTES <strong>{productVariants.length}</strong>
                  </div>
                  {productVariants.length ? (
                    <div className="variant-chips">
                      {productVariants.slice(0, 4).map((variant) => (
                        <span key={variant.id_variante}>{variant.talla} · {variant.color}</span>
                      ))}
                      {productVariants.length > 4 && <span>+{productVariants.length - 4}</span>}
                    </div>
                  ) : (
                    <small className="muted">Sin variantes registradas</small>
                  )}
                  {isAdmin && productVariants[0] && (
                    <div className="product-price">
                      Precio de referencia <strong>{currency.format(Number(productVariants[0].precio_venta || 0))}</strong>
                    </div>
                  )}
                  {isAdmin && (
                    <button className="table-action product-edit" onClick={() => onEditProduct(product)}>
                      Editar producto
                    </button>
                  )}
                </div>
              </article>
            )
          })}
          {!products.length && (
            <div className="product-empty">
              <EmptyState loading={loading} text="No hay productos para mostrar." />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
