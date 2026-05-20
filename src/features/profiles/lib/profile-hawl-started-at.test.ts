import { afterEach, describe, expect, it, vi } from "vitest"

import {
  formatHawlStartedAtDisplayValue,
  formatHawlStartedAtInputValue,
  parseHawlStartedAtInputValue,
} from "./profile-hawl-started-at"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("profile hawl start date helpers", () => {
  it("formats a hawl start date for date inputs using UTC calendar parts", () => {
    const value = new Date("2025-04-30T22:00:00.000Z")

    expect(formatHawlStartedAtInputValue(value)).toBe("2025-04-30")
  })

  it("formats a hawl start date for display in UTC", () => {
    const formatter = {
      format: vi.fn().mockReturnValue("May 1, 2025"),
    } as unknown as Intl.DateTimeFormat

    const dateTimeFormatSpy = vi
      .spyOn(Intl, "DateTimeFormat")
      .mockReturnValue(formatter)

    const result = formatHawlStartedAtDisplayValue(
      new Date("2025-05-01T00:00:00.000Z"),
    )

    expect(result).toBe("May 1, 2025")
    expect(dateTimeFormatSpy).toHaveBeenCalledWith(undefined, {
      dateStyle: "medium",
      timeZone: "UTC",
    })
    expect(formatter.format).toHaveBeenCalledWith(
      new Date("2025-05-01T00:00:00.000Z"),
    )
  })

  it("parses a hawl start date input as a UTC midnight date", () => {
    const value = parseHawlStartedAtInputValue("2025-05-01")

    expect(value?.toISOString()).toBe("2025-05-01T00:00:00.000Z")
  })

  it("returns null for an empty hawl start date input", () => {
    expect(parseHawlStartedAtInputValue("")).toBeNull()
  })
})
