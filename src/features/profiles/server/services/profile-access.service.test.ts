import { beforeEach, describe, expect, it, vi } from "vitest"

const repoMocks = vi.hoisted(() => ({
  createProfileRecord: vi.fn(),
  deleteProfileRecord: vi.fn(),
  deleteProfileAccessGrantRecord: vi.fn(),
  findUserRecordByEmail: vi.fn(),
  getProfileAccessGrantRecord: vi.fn(),
  getProfileRecordById: vi.fn(),
  listAccessibleProfilePageRecords: vi.fn(),
  listProfileAccessGrantPageRecords: vi.fn(),
  listDelegatedProfileRecords: vi.fn(),
  listOwnedProfileRecords: vi.fn(),
  updateProfileRecord: vi.fn(),
  updateUserActiveProfileRecord: vi.fn(),
  upsertProfileAccessGrantRecord: vi.fn(),
}))

vi.mock("../repositories/profile-access.repository", () => repoMocks)

import {
  createProfile,
  resolveCurrentActiveProfile,
  switchActiveProfile,
} from "./profile-access.service"

const ownedProfile = {
  id: "profile-1",
  name: "Family",
  ownerId: "user-1",
  createdAt: new Date("2026-05-01T00:00:00Z"),
  updatedAt: new Date("2026-05-01T00:00:00Z"),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("profile access active selection", () => {
  it("persists the first accessible profile when no active profile is stored", async () => {
    repoMocks.listOwnedProfileRecords.mockResolvedValue([ownedProfile])
    repoMocks.listDelegatedProfileRecords.mockResolvedValue([])
    repoMocks.updateUserActiveProfileRecord.mockResolvedValue(null)

    const result = await resolveCurrentActiveProfile({
      userId: "user-1",
      activeProfileId: null,
    })

    expect(result?.id).toBe(ownedProfile.id)
    expect(repoMocks.updateUserActiveProfileRecord).toHaveBeenCalledWith(
      "user-1",
      ownedProfile.id,
    )
  })

  it("keeps the stored active profile when it is still accessible", async () => {
    repoMocks.listOwnedProfileRecords.mockResolvedValue([ownedProfile])
    repoMocks.listDelegatedProfileRecords.mockResolvedValue([])

    const result = await resolveCurrentActiveProfile({
      userId: "user-1",
      activeProfileId: ownedProfile.id,
    })

    expect(result?.id).toBe(ownedProfile.id)
    expect(repoMocks.updateUserActiveProfileRecord).not.toHaveBeenCalled()
  })

  it("writes a newly created first profile into the persistent selection", async () => {
    repoMocks.listOwnedProfileRecords.mockResolvedValue([])
    repoMocks.listDelegatedProfileRecords.mockResolvedValue([])
    repoMocks.updateUserActiveProfileRecord.mockResolvedValue(null)
    repoMocks.createProfileRecord.mockResolvedValue(ownedProfile)

    const result = await createProfile(
      {
        userId: "user-1",
        activeProfileId: null,
      },
      {
        name: "Family",
      },
    )

    expect(result.id).toBe(ownedProfile.id)
    expect(repoMocks.updateUserActiveProfileRecord).toHaveBeenCalledWith(
      "user-1",
      ownedProfile.id,
    )
  })

  it("persists an explicit profile switch", async () => {
    repoMocks.getProfileRecordById.mockResolvedValue(ownedProfile)
    repoMocks.getProfileAccessGrantRecord.mockResolvedValue(null)
    repoMocks.updateUserActiveProfileRecord.mockResolvedValue(null)

    const result = await switchActiveProfile(
      {
        userId: "user-1",
        activeProfileId: null,
      },
      {
        profileId: ownedProfile.id,
      },
    )

    expect(result.id).toBe(ownedProfile.id)
    expect(repoMocks.updateUserActiveProfileRecord).toHaveBeenCalledWith(
      "user-1",
      ownedProfile.id,
    )
  })
})
