import { createServerFn } from '@tanstack/react-start'

export const getLatestAssessment = createServerFn({ method: 'GET' }).handler(async () => {
  return {
    amountDue: '0.00',
    currency: 'EUR',
    aboveNisab: false,
    nextDueAt: null
  }
})
