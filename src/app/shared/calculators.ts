// Every calculator in the app, used by the header menu and the not-found page
export interface CalculatorLink {
  name: string;
  route: string;
  category: 'Loans' | 'Investments' | 'Finance';
  blurb: string; // one line for the home page
}

export const CALCULATORS: CalculatorLink[] = [
  { name: 'EMI Calculator', route: '/emi', category: 'Loans', blurb: 'Monthly EMI, total interest and repayment schedule for any loan.' },
  { name: 'Prepayment', route: '/prepayment', category: 'Loans', blurb: 'See the interest and months a part-prepayment saves.' },
  { name: 'Affordability', route: '/affordability', category: 'Loans', blurb: 'How much loan you can get on your income.' },

  { name: 'SIP', route: '/sip', category: 'Investments', blurb: 'Future value of a monthly mutual fund SIP.' },
  { name: 'Lumpsum', route: '/lumpsum', category: 'Investments', blurb: 'Growth of a one-time investment.' },
  { name: 'Compound Interest', route: '/compound-interest', category: 'Investments', blurb: 'Interest on interest, with any compounding frequency.' },
  { name: 'CAGR', route: '/cagr', category: 'Investments', blurb: 'Annual growth rate between two investment values.' },
  { name: 'FD/RD', route: '/fd-rd', category: 'Investments', blurb: 'Maturity amount of a fixed or recurring deposit.' },

  { name: 'Income Tax', route: '/tax', category: 'Finance', blurb: 'Income tax for FY 2026-27, new vs old regime.' },
  { name: 'Take-home', route: '/take-home', category: 'Finance', blurb: 'Monthly in-hand salary from your CTC.' },
  { name: 'Inflation', route: '/inflation', category: 'Finance', blurb: "What today's costs will be in the future." },
  { name: 'Retirement', route: '/retirement', category: 'Finance', blurb: 'Corpus and monthly SIP you need to retire.' }
];

export const CATEGORY_LABELS: Record<CalculatorLink['category'], string> = {
  Loans: 'Loans',
  Investments: 'Investments',
  Finance: 'Salary & Finance'
};
