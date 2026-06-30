'use client';

export interface AuditLogRow {
  id: string
  admin_email: string | null
  target_company_name: string | null
  action: string
  old_value: string | null
  new_value: string
  created_at: string
}

const PLAN_COLOR: Record<string, string> = {
  trial: '#d97706',
  starter: '#2563eb',
  professional: '#7c3aed',
  enterprise: '#059669',
  expired: '#b91c1c',
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span style={{ color: '#9ca3af' }}>—</span>
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-semibold"
      style={{ background: `${PLAN_COLOR[plan] ?? '#6b7280'}18`, color: PLAN_COLOR[plan] ?? '#6b7280' }}
    >
      {plan}
    </span>
  )
}

export default function AuditLogTable({ rows }: { rows: AuditLogRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: '#9ca3af' }}>
        Belum ada aktivitas perubahan plan.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            {['Waktu', 'Admin', 'Perusahaan', 'Sebelum', '', 'Sesudah'].map((h) => (
              <th key={h} className="text-left pb-2 pr-4 text-xs font-semibold" style={{ color: '#9ca3af' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <td className="py-2.5 pr-4 text-xs whitespace-nowrap" style={{ color: '#6b7280' }}>
                {new Date(row.created_at).toLocaleString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>
              <td className="py-2.5 pr-4 text-xs" style={{ color: '#374151' }}>
                {row.admin_email ?? '—'}
              </td>
              <td className="py-2.5 pr-4 text-xs font-medium" style={{ color: '#1a2e1b' }}>
                {row.target_company_name ?? '—'}
              </td>
              <td className="py-2.5 pr-3">
                <PlanBadge plan={row.old_value} />
              </td>
              <td className="py-2.5 pr-3 text-xs" style={{ color: '#9ca3af' }}>→</td>
              <td className="py-2.5">
                <PlanBadge plan={row.new_value} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
