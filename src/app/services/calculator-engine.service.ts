import { Injectable } from '@angular/core';

export type TaxRegime = 'new' | 'old';

export type PrepaymentFrequency = 'once' | 'monthly' | 'yearly';

export interface PrepaymentPlan {
  amount: number;
  month: number; // paid after this EMI number (0 = today); first payment if recurring
  frequency: PrepaymentFrequency;
}

const PREPAYMENT_INTERVAL: Record<Exclude<PrepaymentFrequency, 'once'>, number> = { monthly: 1, yearly: 12 };

interface TaxSlab { upTo: number, rate: number }

interface TaxRules {
  slabs: TaxSlab[];
  standardDeduction: number;
  rebateLimit: number;
  rebateMarginalRelief: boolean;
  surcharge: { above: number, rate: number }[];
}

export interface IncomeTaxBreakdown {
  regime: TaxRegime;
  grossSalary: number;
  standardDeduction: number;
  deductions: number;
  taxableIncome: number;
  slabTax: number;
  rebate: number;
  surcharge: number;
  cess: number;
  totalTax: number;
  effectiveRate: number;
  // Tax charged in each slab the taxable income reaches (before rebate, surcharge and cess)
  slabs: { from: number, upTo: number, rate: number, tax: number }[];
}

const TAX_RULES: Record<TaxRegime, TaxRules> = {
  new: {
    slabs: [
      { upTo: 400000, rate: 0 },
      { upTo: 800000, rate: 0.05 },
      { upTo: 1200000, rate: 0.10 },
      { upTo: 1600000, rate: 0.15 },
      { upTo: 2000000, rate: 0.20 },
      { upTo: 2400000, rate: 0.25 },
      { upTo: Infinity, rate: 0.30 }
    ],
    standardDeduction: 75000,
    rebateLimit: 1200000,
    rebateMarginalRelief: true,
    surcharge: [
      { above: 5000000, rate: 0.10 },
      { above: 10000000, rate: 0.15 },
      { above: 20000000, rate: 0.25 }
    ]
  },
  old: {
    slabs: [
      { upTo: 250000, rate: 0 },
      { upTo: 500000, rate: 0.05 },
      { upTo: 1000000, rate: 0.20 },
      { upTo: Infinity, rate: 0.30 }
    ],
    standardDeduction: 50000,
    rebateLimit: 500000,
    rebateMarginalRelief: false,
    surcharge: [
      { above: 5000000, rate: 0.10 },
      { above: 10000000, rate: 0.15 },
      { above: 20000000, rate: 0.25 },
      { above: 50000000, rate: 0.37 }
    ]
  }
};

@Injectable({
  providedIn: 'root'
})
export class CalculatorEngineService {

  // ==========================================
  // LOANS
  // ==========================================
  
  calculateEmi(principal: number, annualRate: number, months: number): { emi: number, totalInterest: number, totalPayment: number } {
    if (principal <= 0 || months <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    if (annualRate === 0) {
      const emi = principal / months;
      return { emi, totalInterest: 0, totalPayment: principal };
    }
    const monthlyRate = annualRate / 12 / 100;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    const totalPayment = emi * months;
    return {
      emi: emi,
      totalInterest: totalPayment - principal,
      totalPayment: totalPayment
    };
  }

  generateAmortizationSchedule(principal: number, annualRate: number, months: number, startDate: Date, prepayments: { month: number, amount: number }[] = [], strategy: 'reduceTenure' | 'reduceEmi' = 'reduceTenure', lowerNextEmi = false): any[] {
    const schedule = [];
    const monthlyRate = annualRate / 12 / 100;
    const orig = this.calculateEmi(principal, annualRate, months);
    
    let balance = principal;
    const sortedPrepayments = [...prepayments].sort((a, b) => a.month - b.month);
    
    let initialPrepayment = 0;
    while (sortedPrepayments.length > 0 && sortedPrepayments[0].month <= 0) {
        initialPrepayment += sortedPrepayments.shift()!.amount;
    }
    
    balance -= initialPrepayment;
    if (balance < 0) balance = 0;
    
    // The next EMI is usually already scheduled, so by default a "today" (month 0)
    // prepayment only lowers the EMI from EMI 2 onwards. lowerNextEmi lowers EMI 1 too.
    let currentEmi = orig.emi;
    if (initialPrepayment > 0 && strategy === 'reduceEmi' && lowerNextEmi && balance > 0) {
        currentEmi = this.emiFor(balance, monthlyRate, months);
    }
    
    for (let i = 1; i <= months * 2; i++) {
        if (balance <= 0) break;
        // EMI i falls i calendar months after the start. Counting from the 1st avoids
        // month-end rollover (31 Jan + 1 month would otherwise land in March).
        const emiDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
        
        let prepaidThisMonth = 0;
        for (const p of sortedPrepayments) {
           if (p.month === i) prepaidThisMonth += p.amount;
        }

        const interest = balance * monthlyRate;

        // The EMI is paid first; the final installment only covers what is left.
        const principalPaid = Math.min(currentEmi - interest, balance);
        const installment = principalPaid + interest;
        balance -= principalPaid;

        // Any prepayment is applied after the EMI, capped at the outstanding balance.
        prepaidThisMonth = Math.min(prepaidThisMonth, balance);
        balance -= prepaidThisMonth;
        if(balance < 0.01) balance = 0;

        schedule.push({
            no: i,
            date: emiDate,
            emi: installment + prepaidThisMonth,
            regularEmi: currentEmi, // scheduled EMI in effect this month (not reduced by a short final installment)
            principal: principalPaid,
            interest: interest,
            balance: balance,
            prepayment: prepaidThisMonth
        });
        
        const reamortize = prepaidThisMonth > 0 || (i === 1 && initialPrepayment > 0 && !lowerNextEmi);
        if (reamortize && strategy === 'reduceEmi' && balance > 0) {
            const remainingMonths = months - i;
            if (remainingMonths > 0) {
                currentEmi = this.emiFor(balance, monthlyRate, remainingMonths);
            }
        }
    }
    return schedule;
  }

  // EMI that repays balance over n months at a monthly rate (0 = interest-free)
  private emiFor(balance: number, monthlyRate: number, n: number): number {
    if (monthlyRate === 0) return balance / n;
    const growth = Math.pow(1 + monthlyRate, n);
    return balance * monthlyRate * growth / (growth - 1);
  }

  // Turns one-time and recurring plans into individual {month, amount} payments
  // within the loan tenure. Recurring plans repeat until the end of the tenure.
  expandPrepayments(plans: PrepaymentPlan[], months: number): { month: number, amount: number }[] {
    const payments: { month: number, amount: number }[] = [];
    for (const plan of plans) {
      if (plan.frequency === 'once') {
        if (plan.month <= months) payments.push({ month: plan.month, amount: plan.amount });
        continue;
      }
      for (let m = plan.month; m <= months; m += PREPAYMENT_INTERVAL[plan.frequency]) {
        payments.push({ month: m, amount: plan.amount });
      }
    }
    return payments;
  }

  calculatePrepayment(principal: number, annualRate: number, months: number, prepayments: { month: number, amount: number }[], strategy: 'reduceTenure' | 'reduceEmi' = 'reduceTenure', lowerNextEmi = false) {
    const orig = this.calculateEmi(principal, annualRate, months);
    const schedule = this.generateAmortizationSchedule(principal, annualRate, months, new Date(), prepayments, strategy, lowerNextEmi);
    
    // An empty schedule means a "today" (month 0) prepayment cleared the whole loan.
    if (schedule.length === 0) return { originalEmi: orig.emi, originalTenure: months, newTenure: 0, savings: orig.totalInterest, newEmi: 0 };
    
    const totalInterestPaid = schedule.reduce((sum, row) => sum + row.interest, 0);
    const newTenure = schedule.length;
    const newEmi = strategy === 'reduceEmi' ? schedule[schedule.length - 1].regularEmi : orig.emi;
    const savings = orig.totalInterest - totalInterestPaid;

    return {
      originalEmi: orig.emi,
      originalTenure: months,
      newTenure: newTenure,
      newEmi: newEmi,
      savings: savings > 0 ? savings : 0
    };
  }

  // Banks cap all EMIs (existing + new) at a share of net income (FOIR)
  calculateAffordability(monthlyIncome: number, emiToIncomeRatio: number, annualRate: number, months: number, existingEmis: number = 0) {
    const maxEmi = Math.max(0, monthlyIncome * (emiToIncomeRatio / 100) - existingEmis);
    const monthlyRate = annualRate / 12 / 100;
    // PV = EMI * (1 - (1+R)^(-N)) / R
    const maxLoan = monthlyRate === 0
      ? maxEmi * months
      : maxEmi * (1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate;
    return {
      maxEmi,
      maxLoanAmount: maxLoan
    };
  }

  // ==========================================
  // INVESTMENTS
  // ==========================================
  
  // annualRate is the effective yearly return (like a mutual fund's CAGR), so it is
  // converted to the monthly rate that compounds to it: (1 + r)^(1/12) - 1.
  // Dividing by 12 instead would compound to more than annualRate (12% -> 12.68%).
  calculateSip(monthlyInvestment: number, annualRate: number, years: number) {
    const months = years * 12;
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    const futureValue = monthlyRate === 0
      ? monthlyInvestment * months
      : monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const investedAmount = monthlyInvestment * months;
    return {
      investedAmount,
      estimatedReturns: futureValue - investedAmount,
      totalValue: futureValue
    };
  }

  // Monthly SIP (invested at the start of each month) needed to reach targetValue.
  calculateRequiredSip(targetValue: number, annualRate: number, years: number): number {
    if (targetValue <= 0 || years <= 0) return 0;
    return targetValue / this.calculateSip(1, annualRate, years).totalValue;
  }

  // Indian bank RD: each monthly installment earns interest compounded quarterly
  // for the months it stays deposited (the last installment stays 1 month).
  calculateRecurringDeposit(monthlyDeposit: number, annualRate: number, months: number) {
    const quarterlyRate = annualRate / 4 / 100;
    let totalValue = 0;
    for (let monthsDeposited = 1; monthsDeposited <= months; monthsDeposited++) {
      totalValue += monthlyDeposit * Math.pow(1 + quarterlyRate, monthsDeposited / 3);
    }
    const investedAmount = monthlyDeposit * months;
    return {
      investedAmount,
      estimatedReturns: totalValue - investedAmount,
      totalValue
    };
  }

  calculateLumpsum(principal: number, annualRate: number, years: number) {
    const totalValue = principal * Math.pow(1 + (annualRate / 100), years);
    return {
      investedAmount: principal,
      estimatedReturns: totalValue - principal,
      totalValue
    };
  }

  calculateCompoundInterest(principal: number, annualRate: number, years: number, compoundingFrequency: number = 1) {
    // compoundingFrequency: 1 = yearly, 12 = monthly, 4 = quarterly
    const rate = annualRate / 100;
    const base = 1 + (rate / compoundingFrequency);
    const totalValue = principal * Math.pow(base, compoundingFrequency * years);
    return {
      principal,
      interest: totalValue - principal,
      totalValue
    };
  }

  calculateCagr(startValue: number, endValue: number, years: number): number {
    if (startValue <= 0 || years <= 0) return 0;
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  // ==========================================
  // PERSONAL FINANCE
  // ==========================================
  
  // Indian income tax for a resident salaried individual below 60, FY 2026-27
  // (unchanged from FY 2025-26 by Budget 2026). Deductions (80C, 80D, HRA, ...)
  // only apply under the old regime.
  calculateIncomeTax(grossSalary: number, regime: TaxRegime = 'new', deductions: number = 0): IncomeTaxBreakdown {
    const rules = TAX_RULES[regime];
    const allowedDeductions = regime === 'old' ? Math.max(0, deductions) : 0;
    const standardDeduction = Math.min(rules.standardDeduction, Math.max(0, grossSalary));
    const taxableIncome = Math.max(0, grossSalary - standardDeduction - allowedDeductions);

    const slabTax = this.slabTax(taxableIncome, rules.slabs);

    // Section 87A rebate; under the new regime, marginal relief caps the tax
    // just above the limit at the income exceeding the limit.
    let rebate = 0;
    if (taxableIncome <= rules.rebateLimit) {
      rebate = slabTax;
    } else if (rules.rebateMarginalRelief) {
      rebate = Math.max(0, slabTax - (taxableIncome - rules.rebateLimit));
    }
    const taxAfterRebate = slabTax - rebate;

    const surcharge = this.surcharge(taxableIncome, taxAfterRebate, rules);
    const cess = (taxAfterRebate + surcharge) * 0.04;
    const totalTax = taxAfterRebate + surcharge + cess;

    return {
      regime,
      grossSalary,
      standardDeduction,
      deductions: allowedDeductions,
      taxableIncome,
      slabTax,
      rebate,
      surcharge,
      cess,
      totalTax,
      effectiveRate: grossSalary > 0 ? (totalTax / grossSalary) * 100 : 0,
      slabs: this.slabBreakdown(taxableIncome, rules.slabs)
    };
  }

  private slabBreakdown(income: number, slabs: TaxSlab[]) {
    const rows: { from: number, upTo: number, rate: number, tax: number }[] = [];
    let lower = 0;
    for (const slab of slabs) {
      if (income <= lower) break;
      const taxedHere = Math.min(income, slab.upTo) - lower;
      rows.push({ from: lower, upTo: slab.upTo, rate: slab.rate, tax: taxedHere * slab.rate });
      lower = slab.upTo;
    }
    return rows;
  }

  private slabTax(income: number, slabs: TaxSlab[]): number {
    let tax = 0;
    let lower = 0;
    for (const slab of slabs) {
      if (income <= lower) break;
      tax += (Math.min(income, slab.upTo) - lower) * slab.rate;
      lower = slab.upTo;
    }
    return tax;
  }

  // Surcharge with marginal relief: crossing a threshold can't cost more in
  // tax + surcharge than the income earned above that threshold.
  private surcharge(income: number, tax: number, rules: TaxRules): number {
    let band = -1;
    rules.surcharge.forEach((s, i) => { if (income > s.above) band = i; });
    if (band < 0 || tax <= 0) return 0;

    const threshold = rules.surcharge[band].above;
    const prevRate = band > 0 ? rules.surcharge[band - 1].rate : 0;
    const taxAtThreshold = this.slabTax(threshold, rules.slabs) * (1 + prevRate);
    const fullSurcharge = tax * rules.surcharge[band].rate;
    return Math.max(0, Math.min(fullSurcharge, taxAtThreshold + (income - threshold) - tax));
  }

  calculateInflation(currentCost: number, inflationRate: number, years: number): number {
    return currentCost * Math.pow(1 + (inflationRate / 100), years);
  }

}
