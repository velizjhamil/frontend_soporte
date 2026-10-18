import { ChevronRight, X } from 'lucide-react'
import { findProduct, getId } from '../../shared/inventory.js'

export function ActionModal({ modal, data, busy, onClose, onSubmit }) {
  const form = {
    product: {
      title: 'Nuevo producto',
      subtitle: 'Sumá un producto al catálogo.',
      fields: [
        ['codigo', 'Código', 'text', true],
        ['nombre', 'Nombre del producto', 'text', true],
        ['categoria', 'Categoría', 'text', true],
        ['descripcion', 'Descripción', 'textarea'],
        ['url_foto', 'URL de foto', 'url'],
      ],
    },
    productEdit: {
      title: 'Editar producto',
      subtitle: 'Actualizá los datos del catálogo.',
      fields: [
        ['nombre', 'Nombre del producto', 'text', true],
        ['categoria', 'Categoría', 'text', true],
        ['descripcion', 'Descripción', 'textarea'],
        ['url_foto', 'URL de foto', 'url'],
        ['activo', 'Disponibilidad', 'selectActive', true],
      ],
    },
    variant: {
      title: 'Nueva variante',
      subtitle: 'Definí la talla y color para un producto.',
      fields: [
        ['id_producto', 'Producto', 'selectProduct', true],
        ['codigo_variante', 'Código de variante', 'text', true],
        ['talla', 'Talla', 'text', true],
        ['color', 'Color', 'text', true],
        ['costo_referencia', 'Costo de referencia (BOB)', 'number'],
        ['precio_venta', 'Precio de venta (BOB)', 'number'],
      ],
    },
    movement: {
      title: 'Registrar movimiento',
      subtitle: 'Confirmá variante, sucursal y cantidad antes de guardar.',
      fields: [
        ['id_sucursal', 'Sucursal', 'selectBranch', true],
        ['id_variante', 'Variante', 'selectVariant', true],
        ['tipo', 'Tipo de movimiento', 'selectMovement', true],
        ['cantidad', 'Cantidad de pares', 'number', true],
        ['motivo', 'Motivo', 'textarea', true],
      ],
    },
    transfer: {
      title: 'Nueva transferencia',
      subtitle: 'El stock se descontará del origen al enviar.',
      fields: [
        ['id_sucursal_origen', 'Sucursal de origen', 'selectBranch', true],
        ['id_sucursal_destino', 'Sucursal de destino', 'selectBranch', true],
        ['id_variante', 'Variante', 'selectVariant', true],
        ['cantidad', 'Cantidad de pares', 'number', true],
        ['observacion', 'Observación', 'textarea'],
      ],
    },
    adjustment: {
      title: 'Solicitar ajuste',
      subtitle: 'El cambio queda pendiente hasta que lo revise un administrador.',
      fields: [
        ['id_sucursal', 'Sucursal', 'selectBranch', true],
        ['id_variante', 'Variante', 'selectVariant', true],
        ['variacion_cantidad', 'Variación de pares (+ / −)', 'number', true],
        ['motivo', 'Motivo', 'textarea', true],
      ],
    },
    branch: {
      title: 'Nueva sucursal',
      subtitle: 'Agregá un nuevo punto de operación.',
      fields: [
        ['nombre', 'Nombre de sucursal', 'text', true],
        ['direccion', 'Dirección', 'text'],
      ],
    },
    user: {
      title: 'Nuevo usuario',
      subtitle: 'Creá una cuenta para un integrante del equipo.',
      fields: [
        ['nombre_usuario', 'Nombre de usuario', 'text', true],
        ['nombre_completo', 'Nombre completo', 'text', true],
        ['contrasena', 'Contraseña (mínimo 12 caracteres)', 'password', true],
        ['rol', 'Rol', 'selectRole', true],
        ['id_sucursal', 'Sucursal', 'selectBranch'],
      ],
    },
    minimum: {
      title: 'Configurar cantidad mínima',
      subtitle: `${modal.row?.nombre_producto} · ${modal.row?.codigo_variante}`,
      fields: [
        ['cantidad_minima', 'Cantidad mínima (pares)', 'number', true],
      ],
    },
  }[modal.type]

  const products = data.productos || []
  const values = { product: 'id_producto', variant: 'id_variante' }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form
        className="modal-card"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit(Object.fromEntries(new FormData(event.currentTarget)))
        }}
      >
        <div className="modal-header">
          <div>
            <div className="eyebrow">GESTIÓN DE INVENTARIO</div>
            <h2>{form.title}</h2>
            <p>{form.subtitle}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar">
            <X size={19} />
          </button>
        </div>
        <div className="modal-fields">
          {form.fields.map(([name, label, type, required]) => (
            <label className="form-field" key={name}>
              {label}
              {type === 'textarea' ? (
                <textarea
                  name={name}
                  rows={3}
                  required={required}
                  defaultValue={modal.product?.[name] || ''}
                  placeholder={name === 'motivo' ? 'Contanos el motivo…' : 'Opcional'}
                />
              ) : (
                <FormControl
                  name={name}
                  type={type}
                  required={required}
                  defaultValue={
                    modal.type === 'minimum'
                      ? modal.row?.cantidad_minima
                      : modal.type === 'user' && name === 'rol'
                      ? 'operador'
                      : modal.product?.[name] ?? ''
                  }
                  data={data}
                  products={products}
                  values={values}
                />
              )}
            </label>
          ))}
        </div>
        <div className="modal-footer">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="button button-primary" disabled={busy}>
            {busy ? 'Guardando…' : 'Guardar cambios'}
            <ChevronRight size={16} />
          </button>
        </div>
      </form>
    </div>
  )
}

function FormControl({ name, type, required, defaultValue, data, products }) {
  if (type === 'selectBranch') {
    return (
      <select name={name} required={required} defaultValue={defaultValue}>
        <option value="">Elegí una sucursal</option>
        {(data.sucursales || []).filter((item) => item.activo).map((item) => (
          <option value={getId(item, 'id_sucursal')} key={getId(item, 'id_sucursal')}>
            {item.nombre}
          </option>
        ))}
      </select>
    )
  }
  if (type === 'selectProduct') {
    return (
      <select name={name} required={required} defaultValue="">
        <option value="">Elegí un producto</option>
        {products.filter((item) => item.activo).map((item) => (
          <option key={getId(item, 'id_producto')} value={getId(item, 'id_producto')}>
            {item.nombre}
          </option>
        ))}
      </select>
    )
  }
  if (type === 'selectVariant') {
    return (
      <select name={name} required={required} defaultValue="">
        <option value="">Elegí una variante</option>
        {(data.variantes || []).filter((item) => item.activo).map((item) => (
          <option key={getId(item, 'id_variante')} value={getId(item, 'id_variante')}>
            {findProduct(data, item.id_producto)} · {item.talla} / {item.color}
          </option>
        ))}
      </select>
    )
  }
  if (type === 'selectMovement') {
    return (
      <select name={name} required defaultValue="entrada">
        <option value="entrada">Entrada</option>
        <option value="salida">Salida</option>
      </select>
    )
  }
  if (type === 'selectRole') {
    return (
      <select name={name} required defaultValue="operador">
        <option value="operador">Operador</option>
        <option value="administrador">Administrador</option>
      </select>
    )
  }
  if (type === 'selectActive') {
    return (
      <select name={name} required defaultValue={String(defaultValue)}>
        <option value="true">Disponible</option>
        <option value="false">Inactivo</option>
      </select>
    )
  }
  return (
    <input
      name={name}
      type={type}
      required={required}
      min={type === 'number' ? (name === 'variacion_cantidad' ? undefined : 0) : undefined}
      step={type === 'number' && (name.includes('referencia') || name === 'precio_venta') ? '0.01' : '1'}
      defaultValue={defaultValue}
      placeholder={type === 'number' ? '0' : ''}
    />
  )
}
