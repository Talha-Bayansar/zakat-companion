export {
  createProfileFn,
  grantProfileAccessFn,
  listAccessibleProfilesFn,
  revokeProfileAccessFn,
  switchActiveProfileFn,
} from "./functions/profile-access.function"
export type {
  AccessibleProfile,
  ManagedProfileAccess,
  ProfileAccessRole,
} from "./services/profile-access.service"
export {
  ProfileAccessError,
  createProfile,
  grantProfileAccess,
  hasProfileEditAccess,
  listAccessibleProfiles,
  revokeProfileAccess,
  switchActiveProfile,
} from "./services/profile-access.service"
