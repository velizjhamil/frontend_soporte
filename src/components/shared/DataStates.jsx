import { Boxes } from 'lucide-react'

export function StatusPill({ label, tone = 'neutral' }) { return <span className={`status-pill ${tone}`}><i />{label}</span> }
export function EmptyRow({ colSpan, loading, text }) { return <tr><td colSpan={colSpan}><EmptyState loading={loading} text={text} /></td></tr> }
export function EmptyState({ loading, text }) { return <div className="empty-state"><span className="empty-icon"><Boxes size={20} /></span><strong>{loading ? 'Cargando datos…' : text}</strong></div> }
