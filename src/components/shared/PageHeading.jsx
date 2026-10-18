import { useCallback, useEffect, useRef, useState } from 'react'
import { Activity, ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Boxes, Camera, Check, ChevronLeft, ChevronRight, Package, Plus, Search, Settings2, ShieldCheck, Store, Truck, X } from 'lucide-react'
import { currency, dateValue, findBranch, findProduct, findVariant, getId, titleCase } from '../../shared/inventory.js'
import { EmptyRow, EmptyState, StatusPill } from '../../components/shared/DataStates.jsx'

export function PageHeading({ eyebrow = 'RESUMEN OPERATIVO', title, subtitle, actions, onRefresh }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div><div className="heading-actions">{onRefresh && <button className="button button-secondary" onClick={onRefresh}><Activity size={15} /> Actualizar</button>}{actions}</div></div>
}
