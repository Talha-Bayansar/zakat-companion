import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MoneyField({
  label,
  value,
  helperText,
  onChange,
}: {
  label: string
  value: string
  helperText: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input className="ios-input" inputMode="decimal" placeholder="0.00" value={value} onChange={(event) => onChange(event.target.value)} />
      <p className="text-[11px] leading-4 text-slate-500">{helperText}</p>
    </div>
  )
}
