import { Switch } from '@/components/ui/switch'

type NotificationToggleRowProps = {
  label: string
  status: string
  checked: boolean
  disabled?: boolean
  busy?: boolean
  onCheckedChange: (checked: boolean) => void
  reasonText?: string | null
}

export function NotificationToggleRow({
  label,
  status,
  checked,
  disabled,
  busy,
  onCheckedChange,
  reasonText,
}: NotificationToggleRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-white px-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-500">{status}</p>
        </div>
        <Switch checked={checked} disabled={disabled || busy} onCheckedChange={onCheckedChange} aria-label={label} />
      </div>
      {reasonText ? <p className="text-xs text-rose-700">{reasonText}</p> : null}
    </div>
  )
}
