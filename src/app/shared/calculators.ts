// Every calculator in the app, used by the header menu and the not-found page
export interface CalculatorLink {
  name: string;
  route: string;
  category: 'Loans' | 'Investments' | 'Finance';
}

export const CALCULATORS: CalculatorLink[] = [
  { name: 'EMI Calculator', route: '/emi', category: 'Loans' },
  { name: 'Prepayment', route: '/prepayment', category: 'Loans' },
  { name: 'Affordability', route: '/affordability', category: 'Loans' },

  { name: 'SIP', route: '/sip', category: 'Investments' },
  { name: 'Lumpsum', route: '/lumpsum', category: 'Investments' },
  { name: 'Compound Interest', route: '/compound-interest', category: 'Investments' },
  { name: 'CAGR', route: '/cagr', category: 'Investments' },
  { name: 'FD/RD', route: '/fd-rd', category: 'Investments' },

  { name: 'Income Tax', route: '/tax', category: 'Finance' },
  { name: 'Take-home', route: '/take-home', category: 'Finance' },
  { name: 'Inflation', route: '/inflation', category: 'Finance' },
  { name: 'Retirement', route: '/retirement', category: 'Finance' }
];

export const CATEGORY_LABELS: Record<CalculatorLink['category'], string> = {
  Loans: 'Loans',
  Investments: 'Investments',
  Finance: 'Salary & Finance'
};
