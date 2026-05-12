import { describe, expect, it } from "vitest"

import { isProfileManagementPath } from "./profile-management-path"

describe("profile management path guard", () => {
  it("allows profile management routes without an active profile", () => {
    expect(isProfileManagementPath("/app/settings/profiles")).toBe(true)
    expect(isProfileManagementPath("/en/app/settings/profiles/new")).toBe(true)
  })

  it("blocks regular app routes without an active profile", () => {
    expect(isProfileManagementPath("/app")).toBe(false)
    expect(isProfileManagementPath("/app/history")).toBe(false)
  })
})
