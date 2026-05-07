import { m } from "@/paraglide/messages"
import { getLocale, setLocale } from "@/paraglide/runtime"

import { cn } from "@/shared/lib/cn"
import { Button } from "@/shared/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group"

const locales = ["en", "tr", "nl"] as const

export function LocaleSwitcher({ className }: { className?: string }) {
  const currentLocale = getLocale()

  return (
    <div className={cn("w-full max-w-[20rem] space-y-2", className)}>
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="text-[0.72rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {m.locale_label()}
        </span>
        <span className="text-[0.72rem] font-medium tracking-[0.18em] text-muted-foreground/70 uppercase">
          {currentLocale.toUpperCase()}
        </span>
      </div>

      <ToggleGroup
        value={[currentLocale]}
        aria-label={m.locale_label()}
        className="grid grid-cols-3 gap-1 rounded-[1.4rem] border border-border/70 bg-background/85 p-1 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-sm"
      >
        {locales.map((locale) => {
          const active = currentLocale === locale
          const label =
            locale === "en"
              ? m.locale_english()
              : locale === "tr"
                ? m.locale_turkish()
                : m.locale_dutch()

          return (
            <ToggleGroupItem
              key={locale}
              value={locale}
              title={label}
              render={(props) => (
                <Button
                  {...props}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLocale(locale)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "h-10 w-full min-w-0 rounded-[1.05rem] px-2 text-xs font-medium leading-none text-balance sm:px-3 sm:text-sm",
                    active
                      ? "shadow-sm shadow-primary/10"
                      : "text-muted-foreground",
                  )}
                />
              )}
            >
              <span className="truncate">{label}</span>
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}
