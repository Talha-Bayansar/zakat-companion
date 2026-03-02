import Decimal from 'decimal.js'

export const calculateZakatDue = (zakatableTotal: Decimal.Value) => {
  const rate = new Decimal(0.025)
  return new Decimal(zakatableTotal).mul(rate).toDecimalPlaces(2)
}
