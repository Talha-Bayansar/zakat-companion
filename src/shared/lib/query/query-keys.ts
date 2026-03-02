export const queryKeys = {
  user: {
    all: ['user'] as const,
    me: () => [...queryKeys.user.all, 'me'] as const
  },
  zakatProfile: {
    all: ['zakat-profile'] as const,
    byUser: (userId: string) => [...queryKeys.zakatProfile.all, userId] as const
  },
  zakatAssessment: {
    all: ['zakat-assessment'] as const,
    latestByUser: (userId: string) => [...queryKeys.zakatAssessment.all, 'latest', userId] as const
  }
}
