import {
  gregorianToHijri,
  hijriToGregorian,
} from "@tabby_ai/hijri-converter"

export type HijriDateParts = {
  year: number
  month: number
  day: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcTimeParts(date: Date) {
  return {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
    seconds: date.getUTCSeconds(),
    milliseconds: date.getUTCMilliseconds(),
  }
}

function toGregorianUtcDate(
  date: HijriDateParts,
  timeParts: ReturnType<typeof toUtcTimeParts>,
) {
  return new Date(
    Date.UTC(
      date.year,
      date.month - 1,
      date.day,
      timeParts.hours,
      timeParts.minutes,
      timeParts.seconds,
      timeParts.milliseconds,
    ),
  )
}

export function toHijriDateParts(date: Date): HijriDateParts {
  return gregorianToHijri({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  })
}

export function hijriToGregorianDateParts(date: HijriDateParts): HijriDateParts {
  return hijriToGregorian(date)
}

export function addHijriYears(date: Date, years: number) {
  const hijriDate = toHijriDateParts(date)
  const gregorianDate = hijriToGregorianDateParts({
    year: hijriDate.year + years,
    month: hijriDate.month,
    day: hijriDate.day,
  })

  return toGregorianUtcDate(gregorianDate, toUtcTimeParts(date))
}

export function getHijriYearLengthDays(startedAt: Date, years = 1) {
  const dueAt = addHijriYears(startedAt, years)

  return Math.max(
    1,
    Math.round((dueAt.getTime() - startedAt.getTime()) / MS_PER_DAY),
  )
}
