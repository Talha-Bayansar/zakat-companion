import { useState } from "react"
import { useForm } from "@tanstack/react-form"

import { m } from "@/paraglide/messages"

import { Button } from "@/shared/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Spinner } from "@/shared/ui/spinner"

import type {
  WealthCategory,
  WealthSnapshotEntryInput,
} from "../lib/wealth-snapshot.schemas"
import {
  wealthCategoryValues,
} from "../lib/wealth-snapshot.constants"
import { wealthSnapshotFormSchema } from "../lib/wealth-snapshot.schemas"

type WealthSnapshotFormProps = {
  initialEntries: WealthSnapshotEntryInput[]
  submitLabel: string
  pendingLabel: string
  errorLabel: string
  onSubmit: (entries: WealthSnapshotEntryInput[]) => Promise<void>
}

function getInitialValue(
  entries: WealthSnapshotEntryInput[],
  category: WealthSnapshotEntryInput["category"],
) {
  return (
    entries.find((entry) => entry.category === category)?.amount ?? "0"
  )
}

export function WealthSnapshotForm({
  initialEntries,
  submitLabel,
  pendingLabel,
  errorLabel,
  onSubmit,
}: WealthSnapshotFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const categoryLabelMap: Record<WealthCategory, string> = {
    cash: m.wealth_snapshot_cash_label(),
    gold: m.wealth_snapshot_gold_label(),
    silver: m.wealth_snapshot_silver_label(),
    trade_inventory: m.wealth_snapshot_trade_inventory_label(),
    receivables: m.wealth_snapshot_receivables_label(),
    debts_liabilities: m.wealth_snapshot_debts_liabilities_label(),
  }

  const form = useForm({
    defaultValues: {
      cash: getInitialValue(initialEntries, "cash"),
      gold: getInitialValue(initialEntries, "gold"),
      silver: getInitialValue(initialEntries, "silver"),
      trade_inventory: getInitialValue(initialEntries, "trade_inventory"),
      receivables: getInitialValue(initialEntries, "receivables"),
      debts_liabilities: getInitialValue(initialEntries, "debts_liabilities"),
    },
    validators: {
      onSubmit: wealthSnapshotFormSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        await onSubmit(
          wealthCategoryValues.map((category) => ({
            category,
            amount: value[category].trim() || "0",
          })),
        )
      } catch (error) {
        setSubmitError(
          error instanceof Error && error.message ? error.message : errorLabel,
        )
      }
    },
  })

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className="gap-4">
        {wealthCategoryValues.map((category) => (
          <form.Field key={category} name={category}>
            {(field) => {
              const isInvalid =
                form.state.isSubmitted && field.state.meta.errors.length > 0

              return (
                <Field data-invalid={isInvalid ? "" : undefined}>
                  <FieldLabel htmlFor={field.name}>
                    {categoryLabelMap[category]}
                  </FieldLabel>
                  <Input
                    id={field.name}
                    type="text"
                    inputMode="decimal"
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(event.target.value)
                    }
                    placeholder={m.wealth_snapshot_amount_placeholder()}
                    aria-invalid={isInvalid}
                  />
                  <FieldError errors={field.state.meta.errors as unknown[]} />
                </Field>
              )
            }}
          </form.Field>
        ))}
      </FieldGroup>

      {submitError ? (
        <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
          {submitError}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-12 w-full rounded-2xl"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? (
          <>
            <Spinner label={pendingLabel} className="size-4" />
            <span>{pendingLabel}</span>
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
