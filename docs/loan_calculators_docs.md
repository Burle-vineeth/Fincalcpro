# Loan Calculators Documentation

## 1. Architectural Overview
Both the **EMI Calculator** and the **Loan Prepayment Calculator** operate on a strictly decoupled architecture.
- **Frontend UI Layer (`calculators/emi`, `calculators/prepayment`)**: Manages state, dynamic arrays, Angular bindings, and responsive TailWind structures.
- **Math Engine (`services/calculator-engine.service.ts`)**: A purely mathematical and stateless service. It processes the raw principal streams and outputs explicit amortized data sets independent of the DOM. 
- **Visualization (`components/amortization-table.component.ts`)**: A generic standalone renderer that maps dynamic multidimensional Arrays emitted from the Engine.

---

## 2. EMI Calculator Module

The EMI Calculator maps a straightforward rigid-amortization loan trajectory.

### Mathematical Formula
The standard EMI formula is fundamentally utilized by the active pipeline:
`E = P x R x (1+R)^N / [(1+R)^N-1]`
- **E**: Outstanding Equated Monthly Installment.
- **P**: Principal loan bounded amount.
- **R**: Monthly Rate of Interest `(Annual Rate / 12 / 100)`.
- **N**: Native Loan Tenure mapped entirely in explicit Months.

### Execution Flow
1. User adjusts sliders triggering `calculate()`.
2. The Engine executes `calculateEmi()` providing the singular `totalInterest` limit.
3. To generate the breakdown, the Engine internally invokes `generateAmortizationSchedule()`. This loop physically iterates dynamically over `1...N` extracting exactly the Interest subset (`balance * monthlyRate`) against the Principal payout subset (`emi - interest`).
4. The generic HTML Table component recursively generates the DOM array. Given the EMI calculation possesses no inherent prepayments, the standalone column `<th *ngIf="hasPrepayments">` intuitively self-eradicates itself.

---

## 3. Loan Prepayment Calculator Module

The Prepayment architecture is profoundly dynamic and allows injecting localized custom prepayments at completely unbounded timelines.

### Prepayment Plans
Users add any number of prepayments. Each one has:
- **Amount**: the extra payment, capped at the loan amount.
- **Paid after EMI no.**: when it is paid. `0` means today, before the next EMI. The page shows the calendar month for each EMI number.
- **How often**: one-time, monthly or yearly. Recurring plans repeat from the chosen EMI until the end of the tenure.

`expandPrepayments()` turns the plans into individual `{ month, amount }` payments before they reach the schedule. Each plan then shows a status line: how many of its payments are used and their total, or a warning when the loan is already paid off before the payment date.

### The "Month 0" Catch (Axis Bank Compatibility)
Archaic legacy banking calculators (such as Axis Bank or SBI) evaluate loans statically assuming all lump sum drops occur **Today (Before the next EMI cycle)** natively.
Our engine inherently charges organic compounding active interest if an injection falls naturally in the future (e.g. Month 1). 
- To securely replicate Bank-Tier metrics organically, we natively parse and process `Installment No. 0`. 
- The engine intercepts Month 0 allocations proactively *before* generating iterative loop paths, stripping the native principal immediately:
```typescript
    let initialPrepayment = 0;
    while (sortedPrepayments.length > 0 && sortedPrepayments[0].month <= 0) {
        initialPrepayment += sortedPrepayments.shift()!.amount;
    }
    balance -= initialPrepayment;
```

### Prepayment Strategies
Once `Month 0` is stripped natively, the algorithm dives into the schedule loops. When an active prepayment hits the local `i` loop cycle, it drops the native bounds and splits the mathematical output based on the user-selected Strategy mode:

1. **Reduce Tenure (Default)**
   - The user seamlessly maps the original `EMI` chunk unchanged recursively.
   - Because the balance abruptly drops natively mid-loop but the exact same high `EMI` cash is deployed, the principal clears exceptionally fast organically, destroying strings of future `N` months aggressively (saving the highest possible organic interest globally).

2. **Reduce EMI**
   - The user chooses to lower their physical cash payout instantly while keeping existing timelines unchanged natively.
   - Instantly after the injection drops the balance within the loop `(balance > 0)`, the algorithm triggers a massive recursive compounding refactor mapped to the exactly remaining month string:
   ```typescript
   currentEmi = balance * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
   ```

### Payment Order and the Final Month
Each month the EMI is paid first, then any prepayment, which is capped at the balance left after the EMI. The final installment only covers what is left, so the last row of the schedule can be smaller than a regular EMI. A month-0 prepayment that covers the whole loan leaves an empty schedule, which is reported as all interest saved and a new tenure of 0 months.

### Output Resolution
`calculatePrepayment` takes the new tenure from the length of the schedule (`newTenure = schedule.length`) and the savings from the difference in total interest (`savings = originalInterest - interestWithPrepayments`). Under **Reduce EMI**, the new EMI is the scheduled EMI in effect in the final month.

---

## 4. Shared Views

- **Repayment schedule** (`components/amortization-table.component.ts`): yearly totals by default, with a switch to monthly rows dated by calendar month.
- **Year-wise breakdown** (EMI page): stacked principal and interest per loan year, with the outstanding balance as a line.
- All engine behaviour above is covered by `services/calculator-engine.service.spec.ts`.
