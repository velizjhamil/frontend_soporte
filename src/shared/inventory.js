const dateFormat = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' })
export const currency = new Intl.NumberFormat('es-BO', { style: 'currency', currency: 'BOB', maximumFractionDigits: 0 })
export const dateValue = (value) => value ? dateFormat.format(new Date(value)) : '—'
export const titleCase = (value = '') => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
export const getId = (item, key) => item?.[key] ?? item?.id
export function findBranch(data, id) { return data.sucursales?.find((item) => getId(item, 'id_sucursal') === id)?.nombre || (id ? `Sucursal #${id}` : 'Todas las sucursales') }
export function findVariant(data, id) { const variant = data.variantes?.find((item) => getId(item, 'id_variante') === id); return variant ? `${findProduct(data, variant.id_producto)} · ${variant.talla} / ${variant.color}` : `Variante #${id}` }
export function findProduct(data, id) { return data.productos?.find((item) => getId(item, 'id_producto') === id)?.nombre || `Producto #${id}` }
export function normalizePayload(key, payload) {
  const identifiers = { sucursales: 'id_sucursal', productos: 'id_producto', variantes: 'id_variante', existencias: 'id_existencia', movimientos: 'id_movimiento', transferencias: 'id_transferencia', ajustes: 'id_ajuste', usuarios: 'id_usuario' }
  const idKey = identifiers[key]
  const normalize = (item) => item && typeof item === 'object' && idKey && item[idKey] === undefined && item.id !== undefined ? { ...item, [idKey]: item.id } : item
  return Array.isArray(payload) ? payload.map(normalize) : normalize(payload)
}
