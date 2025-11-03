import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type ProfileChain = { id: number; name: string }

export function ProfileChainSelector({
  chains,
  selectedChainId,
  onChange,
}: {
  chains: ProfileChain[]
  selectedChainId: number
  onChange: (id: number) => void
}) {
  return (
    <Select
      value={String(selectedChainId)}
      onValueChange={(v) => onChange(Number(v))}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {chains.map((c) => (
          <SelectItem key={c.id} value={String(c.id)}>
            {c.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
