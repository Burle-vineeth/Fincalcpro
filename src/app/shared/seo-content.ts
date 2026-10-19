// Search-engine text for every page: the <title>, meta description and the FAQs shown
// at the bottom of each calculator (also published as FAQPage structured data).
// Titles stay near 60 characters and descriptions near 155, so Google shows them in full.
// FAQ answers may use simple HTML (<strong>, <sup>, <a href="/...">).

export const SITE_URL = 'https://fincalcpro-tau.vercel.app';
export const SITE_NAME = 'FinCalcPro';
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

// Paste the content value of the "HTML tag" method from Google Search Console here
// (Settings > Ownership verification). Leave empty if you verify another way.
export const GOOGLE_SITE_VERIFICATION = '';

export interface Faq { q: string; a: string; }

export interface PageSeo {
  title: string;
  description: string;
  faqs?: Faq[];
}

export const PAGE_SEO: Record<string, PageSeo> = {
  '/': {
    title: 'FinCalcPro – Free EMI, SIP, Income Tax & Loan Calculators',
    description: 'Free online financial calculators for India: EMI, loan prepayment, home loan eligibility, SIP, lumpsum, FD/RD, income tax, in-hand salary and retirement.'
  },

  '/emi': {
    title: 'EMI Calculator – Home, Car & Personal Loan EMI | FinCalcPro',
    description: 'Free EMI calculator for home, car and personal loans. Get your monthly EMI, total interest and a month-by-month amortization schedule instantly.',
    faqs: [
      {
        q: 'What is an EMI?',
        a: 'EMI stands for Equated Monthly Installment. It is the fixed amount you pay your lender every month until the loan is repaid. Each EMI covers part of the interest and part of the principal: early EMIs are mostly interest, later ones mostly principal.'
      },
      {
        q: 'How is EMI calculated?',
        a: 'EMI = <strong>P × R × (1+R)<sup>N</sup> / [(1+R)<sup>N</sup> − 1]</strong>, where P is the loan amount, R the monthly interest rate (annual rate ÷ 12 ÷ 100) and N the tenure in months. This calculator applies the formula and also builds the full amortization schedule.'
      },
      {
        q: 'Does a longer tenure save money?',
        a: 'No. A longer tenure lowers the EMI but increases the total interest. For a ₹30 lakh loan at 8.5%, a 20-year tenure means an EMI of about ₹26,035 and ₹32.5 lakh of interest, while 30 years cuts the EMI to about ₹23,067 but raises the interest to ₹53 lakh.'
      },
      {
        q: 'How can I reduce my EMI?',
        a: 'Choose a longer tenure, make a larger down payment, negotiate a lower interest rate or move your loan to a cheaper lender, or make a part-prepayment and ask the bank to reduce the EMI. Use the <a href="/prepayment">loan prepayment calculator</a> to see the effect of a prepayment.'
      }
    ]
  },

  '/prepayment': {
    title: 'Loan Prepayment Calculator – Interest & Tenure Saved | FinCalcPro',
    description: 'See how much interest and time a part-prepayment saves on your home or personal loan. Compare reducing EMI vs tenure, with a full repayment schedule.',
    faqs: [
      {
        q: 'What is loan prepayment?',
        a: 'Prepayment (or part-payment) means paying off part of your outstanding loan principal ahead of schedule. Because interest is charged on the outstanding balance, every rupee prepaid stops attracting interest for the rest of the loan.'
      },
      {
        q: 'Should I reduce my EMI or my tenure after prepaying?',
        a: 'Reducing the tenure saves the most interest. For example, prepaying ₹2 lakh on a ₹20 lakh loan at 8.5% with 36 months left saves about <strong>₹55,091</strong> if you keep the EMI and shorten the tenure, but about <strong>₹28,123</strong> if you keep the tenure and lower the EMI. Lowering the EMI makes sense if you need more monthly cash flow.'
      },
      {
        q: 'Is there a penalty for prepaying a home loan?',
        a: 'In India, banks and NBFCs cannot charge prepayment or foreclosure fees on floating-rate loans taken by individuals for non-business purposes. Fixed-rate loans may carry a fee, so check your loan agreement.'
      },
      {
        q: 'When is the best time to prepay a loan?',
        a: 'As early as possible. In the first years of a loan most of each EMI goes towards interest, so a prepayment made early removes more future interest than the same amount paid later.'
      }
    ]
  },

  '/affordability': {
    title: 'Loan Eligibility Calculator – How Much Can I Borrow? | FinCalcPro',
    description: 'Find how much home or personal loan you can afford from your monthly income, existing EMIs, interest rate and tenure. Adjust the EMI-to-income limit.',
    faqs: [
      {
        q: 'How much home loan can I afford?',
        a: 'Banks usually let all your EMIs, existing and new, take up to about 40–60% of your net monthly income. This calculator takes that limit, subtracts your existing EMIs, and works out the largest loan that the remaining EMI can repay at your interest rate and tenure.'
      },
      {
        q: 'What is FOIR?',
        a: 'FOIR (Fixed Obligation to Income Ratio) is the share of your monthly income that goes to fixed payments such as EMIs. Lenders use it to judge whether you can take on a new loan. A lower FOIR improves your chances of approval.'
      },
      {
        q: 'How can I increase my loan eligibility?',
        a: 'Choose a longer tenure, add a working co-applicant, close small existing loans or credit card dues, and keep a good credit score to qualify for a lower interest rate. Each of these increases the loan your income can support.'
      }
    ]
  },

  '/sip': {
    title: 'SIP Calculator – Mutual Fund SIP Returns | FinCalcPro',
    description: 'Calculate the maturity value of your monthly mutual fund SIP. See total invested, estimated returns and year-wise growth for any amount, rate and period.',
    faqs: [
      {
        q: 'What is a SIP?',
        a: 'A Systematic Investment Plan (SIP) lets you invest a fixed amount in a mutual fund at regular intervals, usually monthly. It builds a saving habit and averages out your purchase cost as markets move up and down.'
      },
      {
        q: 'How are SIP returns calculated?',
        a: 'The expected return is treated as an annual growth rate, the way mutual fund returns (CAGR) are reported. It is converted to the equivalent monthly rate, <strong>(1 + annual rate)<sup>1/12</sup> − 1</strong>, and each installment grows at that rate from the day it is invested. For example, ₹5,000 a month for 10 years at 12% grows to about ₹11.2 lakh.'
      },
      {
        q: 'Are SIP returns guaranteed?',
        a: 'No. Mutual fund returns depend on the market, so actual returns can be higher or lower than the rate you enter. Use the calculator to compare scenarios, not as a promise of future returns.'
      }
    ]
  },

  '/lumpsum': {
    title: 'Lumpsum Calculator – Mutual Fund Lumpsum Returns | FinCalcPro',
    description: 'Calculate the future value of a one-time mutual fund investment. See estimated returns and year-wise growth for any amount, expected return and period.',
    faqs: [
      {
        q: 'What is a lumpsum investment?',
        a: 'A lumpsum investment is a single, one-time investment of a large amount, for example in a mutual fund, instead of investing in monthly installments.'
      },
      {
        q: 'How are lumpsum returns calculated?',
        a: 'Future value = <strong>P × (1 + r)<sup>n</sup></strong>, where P is the amount invested, r the expected annual return and n the number of years. ₹1 lakh invested for 10 years at 12% grows to about ₹3.1 lakh.'
      },
      {
        q: 'Is lumpsum better than SIP?',
        a: 'If you already have the money and markets rise steadily, a lumpsum stays invested longer and can earn more. A <a href="/sip">SIP</a> spreads your purchases over time, reducing the risk of investing everything just before a fall.'
      }
    ]
  },

  '/compound-interest': {
    title: 'Compound Interest Calculator – Daily, Monthly, Yearly | FinCalcPro',
    description: 'Calculate compound interest and maturity value for any principal, rate, period and compounding frequency. See how interest on interest grows your savings.',
    faqs: [
      {
        q: 'What is compound interest?',
        a: 'Compound interest is interest earned on both your original principal and the interest already added to it. Because you earn "interest on interest", your money grows faster than with simple interest.'
      },
      {
        q: 'What is the compound interest formula?',
        a: 'Amount = <strong>P × (1 + r/n)<sup>n×t</sup></strong>, where P is the principal, r the annual rate, n how many times a year interest is added and t the number of years. Compound interest is the amount minus the principal.'
      },
      {
        q: 'Does compounding frequency matter?',
        a: 'Yes. The more often interest is added (monthly instead of yearly, for example), the higher the final amount at the same rate. The difference grows with higher rates and longer periods.'
      }
    ]
  },

  '/cagr': {
    title: 'CAGR Calculator – Compound Annual Growth Rate | FinCalcPro',
    description: 'Calculate the compound annual growth rate (CAGR) of an investment from its starting value, ending value and holding period. Compare investments fairly.',
    faqs: [
      {
        q: 'What is CAGR?',
        a: 'CAGR (Compound Annual Growth Rate) is the steady yearly rate at which an investment would have grown from its starting value to its ending value, with returns reinvested each year. It is the standard way to compare returns over different periods.'
      },
      {
        q: 'How is CAGR calculated?',
        a: 'CAGR = <strong>(Ending value ÷ Starting value)<sup>1/years</sup> − 1</strong>. An investment that doubles from ₹1 lakh to ₹2 lakh in 5 years has a CAGR of about 14.87%.'
      },
      {
        q: 'What is the difference between CAGR and absolute return?',
        a: 'Absolute return is the total percentage gain, regardless of time: doubling your money is a 100% absolute return. CAGR spreads that gain over the years held, so it shows how fast the money actually grew each year.'
      }
    ]
  },

  '/fd-rd': {
    title: 'FD & RD Calculator – Deposit Maturity & Interest | FinCalcPro',
    description: 'Calculate the maturity amount and interest earned on a bank fixed deposit (FD) or recurring deposit (RD) with quarterly compounding.',
    faqs: [
      {
        q: 'How is FD interest calculated?',
        a: 'Most banks compound fixed deposit interest quarterly: <strong>Maturity = P × (1 + r/4)<sup>4t</sup></strong>, where P is the deposit, r the annual rate and t the tenure in years. ₹1 lakh for 5 years at 7% grows to about ₹1.41 lakh.'
      },
      {
        q: 'How is RD interest calculated?',
        a: 'In a recurring deposit you pay a fixed amount every month. Each installment earns interest, compounded quarterly, from the month it is paid until maturity, so earlier installments earn more than later ones. The maturity value is the sum of all installments with their interest.'
      },
      {
        q: 'Is FD and RD interest taxable?',
        a: 'Yes. Interest from fixed and recurring deposits is added to your income and taxed at your slab rate. Banks may also deduct TDS when your yearly interest crosses a threshold. Use the <a href="/tax">income tax calculator</a> to estimate your tax.'
      }
    ]
  },

  '/tax': {
    title: 'Income Tax Calculator FY 2026-27 – New vs Old Regime | FinCalcPro',
    description: 'Calculate income tax for FY 2026-27 under the new or old regime, with standard deduction, 87A rebate, surcharge and cess. See which regime saves more.',
    faqs: [
      {
        q: 'How is income tax calculated under the new regime?',
        a: 'Salaried individuals get a ₹75,000 standard deduction and income is taxed at 0% up to ₹4 lakh, 5% up to ₹8 lakh, 10% up to ₹12 lakh, 15% up to ₹16 lakh, 20% up to ₹20 lakh, 25% up to ₹24 lakh and 30% above. The new regime is the default.'
      },
      {
        q: 'Is income up to ₹12 lakh tax-free?',
        a: 'Under the new regime, the Section 87A rebate makes taxable income up to ₹12 lakh tax-free. With the ₹75,000 standard deduction, a salary up to ₹12.75 lakh pays no income tax.'
      },
      {
        q: 'How is tax calculated under the old regime?',
        a: 'The old regime allows deductions such as 80C, 80D and HRA, with a ₹50,000 standard deduction and slabs of 0% up to ₹2.5 lakh, 5% up to ₹5 lakh, 20% up to ₹10 lakh and 30% above. Taxable income up to ₹5 lakh is tax-free after the 87A rebate.'
      },
      {
        q: 'Which tax regime is better for me?',
        a: 'The new regime usually wins unless you claim large deductions such as 80C investments, home loan interest and HRA. Enter your income and deductions and this calculator tells you which regime costs less, and by how much. In both, a surcharge applies above ₹50 lakh and a 4% health and education cess is added.'
      }
    ]
  },

  '/take-home': {
    title: 'In-Hand Salary Calculator – CTC to Take-Home Pay | FinCalcPro',
    description: 'Convert your CTC to monthly in-hand salary after income tax, PF and other deductions under the new tax regime for FY 2026-27.',
    faqs: [
      {
        q: 'How is in-hand salary calculated?',
        a: 'In-hand salary is your CTC minus income tax and deductions such as your provident fund (PF) contribution and insurance premiums, divided by 12. Tax here follows the new regime, the default for FY 2026-27.'
      },
      {
        q: 'What is the difference between CTC and in-hand salary?',
        a: 'CTC (cost to company) is everything your employer spends on you in a year, including their PF contribution, gratuity and insurance. In-hand salary is what actually reaches your bank account each month after tax and deductions, so it is always lower.'
      },
      {
        q: 'Is a salary of ₹12.75 lakh tax-free?',
        a: 'Under the new regime, yes: the ₹75,000 standard deduction and the Section 87A rebate together mean a salary up to ₹12.75 lakh pays no income tax. See the full slab-wise breakdown in the <a href="/tax">income tax calculator</a>.'
      }
    ]
  },

  '/inflation': {
    title: 'Inflation Calculator – Future Cost & Value of Money | FinCalcPro',
    description: 'Calculate what today\'s expenses will cost in the future at a given inflation rate, and how inflation reduces the value of your money over time.',
    faqs: [
      {
        q: 'How does inflation affect costs?',
        a: 'Inflation is the rate at which prices rise each year. Because it compounds, the future cost is <strong>Cost today × (1 + inflation rate)<sup>years</sup></strong>. At 6% inflation, ₹50,000 of monthly expenses today would cost about ₹1.6 lakh in 20 years.'
      },
      {
        q: 'What inflation rate should I use?',
        a: 'The Reserve Bank of India targets consumer price inflation of 4%, within a 2–6% band. Many people use 6% for long-term planning, and higher rates for costs that rise faster, such as education and healthcare.'
      },
      {
        q: 'How quickly do prices double?',
        a: 'Use the rule of 72: divide 72 by the inflation rate. At 6% inflation, prices roughly double every 12 years, so money left uninvested loses half its purchasing power in that time.'
      }
    ]
  },

  '/retirement': {
    title: 'Retirement Calculator – Corpus & Monthly SIP Needed | FinCalcPro',
    description: 'Find the retirement corpus you need and the monthly SIP to build it, based on your age, expenses, inflation and expected returns.',
    faqs: [
      {
        q: 'How much do I need to retire?',
        a: 'This calculator grows your current monthly expenses by inflation until retirement, then uses the 4% rule: savings of <strong>25 times your yearly expenses</strong> at retirement let you withdraw about 4% a year for a long retirement.'
      },
      {
        q: 'What is the 4% rule?',
        a: 'The 4% rule says you can withdraw about 4% of your savings in the first year of retirement, and adjust that amount for inflation each year after, with a low chance of running out of money over roughly 30 years. That is why the target corpus is 25 times yearly expenses.'
      },
      {
        q: 'How much should I invest each month for retirement?',
        a: 'The calculator shows the monthly SIP that, at your expected return, grows to the required corpus by your retirement age. Starting earlier makes a big difference, because your money has more years to compound.'
      }
    ]
  },

  '/privacy': {
    title: 'Privacy Policy | FinCalcPro',
    description: 'How FinCalcPro handles your data, cookies and advertising.'
  }
};
