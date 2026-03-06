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
    latestByUser: (userId: string) => [...queryKeys.zakatAssessment.all, 'latest', userId] as const,
    historyInfiniteByUser: (userId: string) => [...queryKeys.zakatAssessment.all, 'history-infinite', userId] as const,
    lifecycleByUser: (userId: string) => [...queryKeys.zakatAssessment.all, 'lifecycle', userId] as const,
  }
}
