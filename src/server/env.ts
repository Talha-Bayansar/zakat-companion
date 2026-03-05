export type RuntimeBindings = Partial<{
  DATABASE_URL: string
  BETTER_AUTH_SECRET: string
}>

function fromImportMeta(name: keyof RuntimeBindings): string | undefined {
  const value = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[name]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

export function getRuntimeValue(name: keyof RuntimeBindings, bindings?: RuntimeBindings): string | undefined {
  const fromBindings = bindings?.[name]
  if (typeof fromBindings === 'string' && fromBindings.length > 0) return fromBindings

  const fromProcess = process.env[name]
  if (typeof fromProcess === 'string' && fromProcess.length > 0) return fromProcess

  return fromImportMeta(name)
}

export function getRequiredRuntimeValue(name: keyof RuntimeBindings, bindings?: RuntimeBindings): string {
  const value = getRuntimeValue(name, bindings)
  if (!value) throw new Error(`${name} is not set`)
  return value
}

export function extractBindings(input: unknown): RuntimeBindings | undefined {
  if (!input || typeof input !== 'object') return undefined

  const ctx = input as Record<string, unknown>
  const directEnv = ctx.env as RuntimeBindings | undefined
  if (directEnv) return directEnv

  return ctx as RuntimeBindings
}
