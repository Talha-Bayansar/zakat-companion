export type ProfileAccessRole = "owner" | "manager"

export type AccessibleProfile = {
  id: string
  name: string
  ownerId: string
  role: ProfileAccessRole
  canManageAccess: boolean
  accessGrantedAt: Date | null
  grantedByUserId: string | null
  createdAt: Date
  updatedAt: Date
}

export type ManagedProfileAccess = {
  id: string
  profileId: string
  userId: string
  userEmail: string
  grantedByUserId: string
  permission: string
  createdAt: Date
}
