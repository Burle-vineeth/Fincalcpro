import { CalculatorEngineService } from './calculator-engine.service';

describe('CalculatorEngineService – loans', () => {
  const engine = new CalculatorEngineService();
  const sum = (rows: any[], key: string) => rows.reduce((s, r) => s + r[key], 0);

  describe('calculateEmi', () => {
    it('matches standard bank EMI figures', () => {
      expect(engine.calculateEmi(1000000, 8.5, 240).emi).toBeCloseTo(8678.23, 2);
      expect(engine.calculateEmi(500000, 10.5, 60).emi).toBeCloseTo(10746.95, 2);
      expect(engine.calculateEmi(5000000, 9, 360).emi).toBeCloseTo(40231.13, 2);
    });

    it('handles a zero interest rate', () => {
      expect(engine.calculateEmi(120000, 0, 12)).toEqual({ emi: 10000, totalInterest: 0, totalPayment: 120000 });
    });
  });

  describe('generateAmortizationSchedule', () => {
    it('repays exactly the principal and the total interest', () => {
      const emi = engine.calculateEmi(1000000, 8.5, 240);
      const schedule = engine.generateAmortizationSchedule(1000000, 8.5, 240, new Date());
      expect(schedule.length).toBe(240);
      expect(sum(schedule, 'principal')).toBeCloseTo(1000000, 2);
      expect(sum(schedule, 'interest')).toBeCloseTo(emi.totalInterest, 2);
      expect(schedule[schedule.length - 1].balance).toBe(0);
    });

    it('applies the EMI before an oversized prepayment in the closing month', () => {
      const schedule = engine.generateAmortizationSchedule(100000, 8.5, 24, new Date(), [{ month: 12, amount: 90000 }]);
      const last = schedule[schedule.length - 1];
      expect(schedule.length).toBe(12);
      expect(last.principal + last.interest).toBeCloseTo(4545.57, 2);
      expect(last.prepayment).toBeLessThan(90000);
      expect(last.balance).toBe(0);
      expect(sum(schedule, 'principal') + sum(schedule, 'prepayment')).toBeCloseTo(100000, 2);
    });
  });

  describe('calculatePrepayment', () => {
    const cases: [string, number, number, number, { month: number, amount: number }[], 'reduceTenure' | 'reduceEmi', { savings: number, newTenure: number, newEmi: number }][] = [
      ['single prepayment, reduce tenure', 100000, 8.5, 24, [{ month: 12, amount: 20000 }], 'reduceTenure', { savings: 1479, newTenure: 20, newEmi: 4545.57 }],
      ['single prepayment, reduce EMI', 100000, 8.5, 24, [{ month: 12, amount: 20000 }], 'reduceEmi', { savings: 933, newTenure: 24, newEmi: 2801.17 }],
      ['two prepayments, reduce tenure', 5000000, 8.5, 240, [{ month: 12, amount: 500000 }, { month: 36, amount: 300000 }], 'reduceTenure', { savings: 2145686, newTenure: 173, newEmi: 43391.16 }],
      ['two prepayments, reduce EMI', 5000000, 8.5, 240, [{ month: 12, amount: 500000 }, { month: 36, amount: 300000 }], 'reduceEmi', { savings: 777523, newTenure: 240, newEmi: 36179.06 }],
      ['month 0 prepayment, reduce tenure', 1000000, 9, 120, [{ month: 0, amount: 200000 }], 'reduceTenure', { savings: 232056, newTenure: 86, newEmi: 12667.58 }],
      ['month 0 prepayment, reduce EMI', 1000000, 9, 120, [{ month: 0, amount: 200000 }], 'reduceEmi', { savings: 104022, newTenure: 120, newEmi: 10134.06 }],
      ['two prepayments in the same month', 1000000, 9, 120, [{ month: 6, amount: 50000 }, { month: 6, amount: 50000 }], 'reduceTenure', { savings: 120299, newTenure: 103, newEmi: 12667.58 }],
      ['prepayment exceeds balance, reduce tenure', 100000, 8.5, 24, [{ month: 12, amount: 90000 }], 'reduceTenure', { savings: 2431, newTenure: 12, newEmi: 4545.57 }],
      ['prepayment exceeds balance, reduce EMI', 100000, 8.5, 24, [{ month: 12, amount: 90000 }], 'reduceEmi', { savings: 2431, newTenure: 12, newEmi: 4545.57 }],
      ['month 0 prepayment clears the loan', 100000, 8.5, 24, [{ month: 0, amount: 100000 }], 'reduceTenure', { savings: 9094, newTenure: 0, newEmi: 0 }],
      ['month 0 prepayment exceeds the loan', 100000, 8.5, 24, [{ month: 0, amount: 150000 }], 'reduceEmi', { savings: 9094, newTenure: 0, newEmi: 0 }],
      ['prepayment in the final month', 100000, 8.5, 24, [{ month: 24, amount: 20000 }], 'reduceTenure', { savings: 0, newTenure: 24, newEmi: 4545.57 }],
    ];

    for (const [name, principal, rate, months, prepayments, strategy, expected] of cases) {
      it(name, () => {
        const result = engine.calculatePrepayment(principal, rate, months, prepayments, strategy);
        expect(Math.round(result.savings)).toBe(expected.savings);
        expect(result.newTenure).toBe(expected.newTenure);
        expect(result.newEmi).toBeCloseTo(expected.newEmi, 2);
      });
    }
  });
});

describe('CalculatorEngineService – investments & savings', () => {
  const engine = new CalculatorEngineService();

  it('matches standard reference values', () => {
    // SIP treats the rate as an effective annual return, matching bank / AMC calculators
    const sip = engine.calculateSip(25000, 12, 10);
    expect(Math.round(sip.totalValue)).toBe(5600897);
    expect(Math.round(sip.estimatedReturns)).toBe(2600897);
    expect(Math.round(engine.calculateSip(5000, 12, 10).totalValue)).toBe(1120179);
    expect(Math.round(engine.calculateLumpsum(100000, 12, 10).totalValue)).toBe(310585);
    expect(Math.round(engine.calculateCompoundInterest(250000, 10, 15, 1).totalValue)).toBe(1044312);
    expect(Math.round(engine.calculateCompoundInterest(100000, 7, 5, 4).totalValue)).toBe(141478); // FD, quarterly
    expect(engine.calculateCagr(100000, 250000, 5)).toBeCloseTo(20.11, 2);
    expect(Math.round(engine.calculateInflation(100000, 6, 10))).toBe(179085);
  });

  it('handles a zero rate without returning NaN', () => {
    expect(engine.calculateSip(1000, 0, 1).totalValue).toBe(12000);
    expect(engine.calculateAffordability(100000, 50, 0, 240).maxLoanAmount).toBe(50000 * 240);
  });

  it('calculates RD maturity with quarterly compounding, matching the bank formula', () => {
    // Banks' closed form: M = R × [(1+i)^n − 1] / [1 − (1+i)^(−1/3)], i = rate/400, n = quarters
    const bankFormula = (r: number, rate: number, months: number) => {
      const i = rate / 400;
      return r * (Math.pow(1 + i, months / 3) - 1) / (1 - Math.pow(1 + i, -1 / 3));
    };
    for (const [r, rate, months] of [[1000, 7.5, 12], [5000, 7, 60], [2500, 6.5, 37]]) {
      expect(engine.calculateRecurringDeposit(r, rate, months).totalValue).toBeCloseTo(bankFormula(r, rate, months), 4);
    }
    expect(Math.round(engine.calculateRecurringDeposit(1000, 7.5, 12).totalValue)).toBe(12496);
  });

  it('finds the monthly SIP needed for a target corpus', () => {
    const target = engine.calculateSip(5000, 12, 10).totalValue;
    expect(engine.calculateRequiredSip(target, 12, 10)).toBeCloseTo(5000, 6);
    expect(engine.calculateRequiredSip(120000, 0, 10)).toBeCloseTo(1000, 6);
  });
});

describe('CalculatorEngineService – income tax FY 2026-27', () => {
  const engine = new CalculatorEngineService();
  const tax = (salary: number, regime: 'new' | 'old' = 'new', deductions = 0) =>
    Math.round(engine.calculateIncomeTax(salary, regime, deductions).totalTax);

  it('new regime: slabs, standard deduction and cess', () => {
    expect(tax(1500000)).toBe(97500);
    expect(tax(2500000)).toBe(319800);
  });

  it('new regime: no tax up to ₹12.75 lakh salary, with marginal relief just above', () => {
    expect(tax(1275000)).toBe(0);
    expect(tax(1300000)).toBe(26000); // tax capped at the ₹25,000 earned above ₹12L, plus cess
  });

  it('new regime: surcharge with marginal relief', () => {
    expect(tax(5085000)).toBe(1133600);   // just over ₹50L taxable: surcharge limited to ₹7,000
    expect(tax(5575000)).toBe(1407120);   // full 10% surcharge
    expect(tax(30075000)).toBe(11154000); // 25% cap above ₹2 Cr
  });

  it('new regime ignores deductions', () => {
    expect(tax(1500000, 'new', 200000)).toBe(97500);
  });

  it('old regime: slabs, deductions and 87A rebate', () => {
    expect(tax(1500000, 'old')).toBe(257400);
    expect(tax(1000000, 'old', 150000)).toBe(75400);
    expect(tax(550000, 'old')).toBe(0);
    expect(tax(560000, 'old')).toBe(15080); // no marginal relief above ₹5L in the old regime
  });
});

describe('CalculatorEngineService – prepayment plans', () => {
  const engine = new CalculatorEngineService();

  it('expands one-time, monthly and yearly plans within the tenure', () => {
    expect(engine.expandPrepayments([{ amount: 100, month: 12, frequency: 'once' }], 60)).toEqual([{ month: 12, amount: 100 }]);
    expect(engine.expandPrepayments([{ amount: 100, month: 70, frequency: 'once' }], 60)).toEqual([]);
    expect(engine.expandPrepayments([{ amount: 5, month: 58, frequency: 'monthly' }], 60).map(p => p.month)).toEqual([58, 59, 60]);
    expect(engine.expandPrepayments([{ amount: 5, month: 0, frequency: 'yearly' }], 36).map(p => p.month)).toEqual([0, 12, 24, 36]);
  });

  it('a yearly prepayment saves more than the same amount paid once', () => {
    const once = engine.calculatePrepayment(2000000, 8.5, 180, engine.expandPrepayments([{ amount: 50000, month: 12, frequency: 'once' }], 180));
    const yearly = engine.calculatePrepayment(2000000, 8.5, 180, engine.expandPrepayments([{ amount: 50000, month: 12, frequency: 'yearly' }], 180));
    expect(yearly.savings).toBeGreaterThan(once.savings);
    expect(yearly.newTenure).toBeLessThan(once.newTenure);
  });
});

describe('CalculatorEngineService – breakdowns', () => {
  const engine = new CalculatorEngineService();

  it('splits slab tax by slab', () => {
    const r = engine.calculateIncomeTax(1500000, 'new'); // taxable 14.25L
    expect(r.slabs.map(s => s.tax)).toEqual([0, 20000, 40000, 33750]);
    expect(r.slabs.reduce((s, x) => s + x.tax, 0)).toBeCloseTo(r.slabTax, 6);
  });

  it('reduces loan eligibility by existing EMIs', () => {
    const none = engine.calculateAffordability(100000, 50, 8.5, 240);
    const some = engine.calculateAffordability(100000, 50, 8.5, 240, 20000);
    expect(none.maxEmi).toBe(50000);
    expect(some.maxEmi).toBe(30000);
    expect(some.maxLoanAmount).toBeCloseTo(none.maxLoanAmount * 0.6, 4);
    expect(engine.calculateAffordability(100000, 50, 8.5, 240, 60000).maxEmi).toBe(0);
  });
});

describe('CalculatorEngineService – schedule edge cases', () => {
  const engine = new CalculatorEngineService();

  it('dates each EMI one calendar month apart, even from the 31st', () => {
    const schedule = engine.generateAmortizationSchedule(100000, 9, 4, new Date(2027, 0, 31)); // 31 Jan 2027
    expect(schedule.map(r => [r.date.getFullYear(), r.date.getMonth()])).toEqual([[2027, 1], [2027, 2], [2027, 3], [2027, 4]]);
  });

  it('handles reduce-EMI prepayments on an interest-free loan', () => {
    const r = engine.calculatePrepayment(120000, 0, 12, [{ month: 0, amount: 60000 }, { month: 6, amount: 30000 }], 'reduceEmi');
    // ₹60k today leaves ₹60k over 12 months = ₹5,000 EMI; ₹30k after EMI 6 clears the rest
    expect(r.newEmi).toBeCloseTo(5000, 6);
    expect(r.newTenure).toBe(6);
    expect(r.savings).toBe(0); // no interest to save on a 0% loan
    const schedule = engine.generateAmortizationSchedule(120000, 0, 12, new Date(), [{ month: 0, amount: 60000 }], 'reduceEmi');
    expect(schedule[0].emi).toBeCloseTo(5000, 6);
    expect(schedule.every(row => Number.isFinite(row.emi))).toBe(true);
  });
});
