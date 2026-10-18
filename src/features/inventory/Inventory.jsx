import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Check, Search } from 'lucide-react'
import { findBranch, getId } from '../../shared/inventory.js'
import { EmptyRow, StatusPill } from '../../components/shared/DataStates.jsx'
import { PageHeading } from '../../components/shared/PageHeading.jsx'

export function Inventory({ data, loading, showLow, setShowLow, isAdmin, session, onRefresh, onMinimum, onRegister }) {
  const rows = data.existencias || []
  const [search, setSearch] = useState('')
  const [scanCode, setScanCode] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [registering, setRegistering] = useState(false)
  const [branchId, setBranchId] = useState(String(session?.usuario?.id_sucursal || ''))
  const [reason, setReason] = useState('Registro por escaneo')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const registeringRef = useRef(false)
  const variant = (data.variantes || []).find((item) => String(item.codigo_variante).trim().toLowerCase() === scanCode.trim().toLowerCase())
  const product = variant && (data.productos || []).find((item) => getId(item, 'id_producto') === variant.id_producto)

  const stopCamera = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOpen(false)
  }, [])

  useEffect(() => () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop())
  }, [])

  async function startCamera() {
    setCameraError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador no permite acceder a la cámara. Ingresá el código manualmente.')
      return
    }
    if (!('BarcodeDetector' in window)) {
      setCameraError('El escaneo automático no está disponible en este navegador. Ingresá el código manualmente.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      streamRef.current = stream
      setCameraOpen(true)
      requestAnimationFrame(async () => {
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] })
        const scan = async () => {
          if (!streamRef.current || !videoRef.current) return
          try {
            const hits = await detector.detect(videoRef.current)
            if (hits[0]?.rawValue) {
              setScanCode(hits[0].rawValue)
              setScanMessage(`Código detectado: ${hits[0].rawValue}`)
              stopCamera()
              return
            }
          } catch { /* keep scanning; the manual entry remains available */ }
          if (streamRef.current) window.setTimeout(scan, 300)
        }
        scan()
      })
    } catch {
      setCameraError('No se pudo abrir la cámara. Revisá el permiso del navegador o ingresá el código manualmente.')
    }
  }

  async function registerScannedItem(event) {
    event.preventDefault()
    if (registeringRef.current || !variant || !branchId || !Number(quantity) || Number(quantity) < 1 || !reason.trim()) return
    registeringRef.current = true
    setRegistering(true)
    try {
      const succeeded = await onRegister({ id_sucursal: Number(branchId), id_variante: getId(variant, 'id_variante'), tipo: 'entrada', cantidad: Number(quantity), motivo: reason.trim() })
      if (!succeeded) return
      setScanCode('')
      setScanMessage('')
      setQuantity('1')
    } finally {
      registeringRef.current = false
      setRegistering(false)
    }
  }

  const visible = rows.filter((item) => `${item.nombre_producto} ${item.codigo_variante} ${item.color} ${item.talla}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <PageHeading
        title="Inventario"
        subtitle="Controlá existencias y registrá ingresos escaneando el código de cada variante."
        onRefresh={onRefresh}
        actions={
          <button className="button button-primary" onClick={startCamera}>
            <Camera size={16} /> Escanear producto
          </button>
        }
      />
      <section className="scan-workspace panel">
        <div className="scan-copy">
          <div className="eyebrow">REGISTRO RÁPIDO</div>
          <h3>Sumá stock con un escaneo</h3>
          <p>Escaneá el código de barras o QR, verificá la variante y confirmá el ingreso. El stock solo cambia cuando confirmás el registro.</p>
          <div className="scan-form-row">
            <div className="search-box scan-code-input">
              <Search size={16} />
              <input
                aria-label="Código de producto"
                placeholder="Ingresá o escaneá el código de variante"
                value={scanCode}
                onChange={(event) => { setScanCode(event.target.value); setScanMessage('') }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    setScanMessage('Código ingresado. Verificá la variante antes de registrar.')
                  }
                }}
              />
            </div>
            <button
              className="button button-secondary"
              onClick={() => {
                setScanMessage(scanCode ? 'Código ingresado. Verificá la variante antes de registrar.' : 'Ingresá un código para buscar la variante.')
              }}
            >
              <Search size={15} /> Buscar código
            </button>
          </div>
          {scanMessage && <div className="scan-feedback" role="status">{scanMessage}</div>}
          {cameraError && <div className="scan-warning" role="status">{cameraError}</div>}
          {cameraOpen && (
            <div className="camera-frame">
              <video ref={videoRef} muted playsInline />
              <div className="camera-reticle" />
              <button className="button button-secondary camera-stop" onClick={stopCamera}>Detener cámara</button>
            </div>
          )}
          {scanCode && (variant ? (
            <form className="scan-confirm" onSubmit={registerScannedItem} aria-busy={registering}>
              <div className="scan-match">
                <span className="scan-match-mark"><Check size={17} /></span>
                <div>
                  <strong>{product?.nombre || `Variante ${variant.codigo_variante}`}</strong>
                  <small>{variant.codigo_variante} · Talla {variant.talla} · {variant.color}</small>
                </div>
                <span className="scan-match-tag">Código reconocido</span>
              </div>
              <div className="scan-fields">
                {isAdmin && (
                  <label>
                    Sucursal
                    <select value={branchId} onChange={(event) => setBranchId(event.target.value)} required disabled={registering}>
                      <option value="">Elegí una sucursal</option>
                      {(data.sucursales || []).filter((item) => item.activo).map((item) => (
                        <option key={getId(item, 'id_sucursal')} value={getId(item, 'id_sucursal')}>{item.nombre}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label>
                  Cantidad de pares
                  <input type="number" min="1" max="1000000" value={quantity} onChange={(event) => setQuantity(event.target.value)} required disabled={registering} />
                </label>
                <label className="scan-reason">
                  Motivo
                  <input value={reason} onChange={(event) => setReason(event.target.value)} minLength="3" maxLength="500" required disabled={registering} />
                </label>
                <button className="button button-primary" type="submit" disabled={registering}>
                  <Check size={15} /> {registering ? 'Registrando…' : 'Confirmar ingreso'}
                </button>
              </div>
            </form>
          ) : (
            <div className="scan-not-found" role="status">
              No encontramos una variante con el código <strong>{scanCode}</strong>. Revisá el código o cargá primero el producto y su variante.
            </div>
          ))}
        </div>
        <div className="scan-steps">
          <span className="scan-step-number">01</span>
          <strong>Escaneá</strong>
          <small>Usá la cámara o escribí el código.</small>
          <span className="scan-step-number">02</span>
          <strong>Verificá</strong>
          <small>Confirmá producto, talla y color.</small>
          <span className="scan-step-number">03</span>
          <strong>Registrá</strong>
          <small>El movimiento actualiza el stock.</small>
        </div>
      </section>
      <section className="panel data-panel">
        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input placeholder="Buscar producto o variante…" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <label className="toggle-filter">
            <input type="checkbox" checked={showLow} onChange={(event) => setShowLow(event.target.checked)} />
            <span className="toggle-track" />
            <span>Solo bajo mínimo</span>
          </label>
          <span className="result-count">{visible.length} posiciones</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PRODUCTO / VARIANTE</th>
                <th>SUCURSAL</th>
                <th>DISPONIBLE</th>
                <th>CANTIDAD MÍNIMA</th>
                <th>ESTADO</th>
                {isAdmin && <th />}
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.id_existencia}>
                  <td className="product-cell">
                    <div className="product-thumb">{row.nombre_producto?.slice(0, 1)}</div>
                    <div>
                      <strong>{row.nombre_producto}</strong>
                      <small>{row.codigo_variante} · {row.talla} / {row.color}</small>
                    </div>
                  </td>
                  <td>{findBranch(data, row.id_sucursal)}</td>
                  <td><strong>{row.cantidad} pares</strong></td>
                  <td>{row.cantidad_minima} pares</td>
                  <td>
                    <StatusPill label={row.bajo_minimo ? 'Bajo mínimo' : 'En stock'} tone={row.bajo_minimo ? 'warning' : 'success'} />
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="table-action" onClick={() => onMinimum(row)}>Ajustar mínimo</button>
                    </td>
                  )}
                </tr>
              ))}
              {!visible.length && <EmptyRow colSpan={isAdmin ? 6 : 5} loading={loading} text="No encontramos posiciones de inventario." />}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
