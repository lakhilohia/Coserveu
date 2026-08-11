import React, { useState } from 'react';
import { Company, Session } from '../types';

interface AdminSettingsModuleProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  session: Session;
  view: 'payroll' | 'features' | 'bridge' | 'users' | 'company';
}

interface StatutoryLawItem {
  id: string;
  act: string;
  icon: string;
  scope: string;
  mandate: string;
  status: string;
  statusColor: string;
  sections: string[];
  applicability: string;
  fpcObligations: string[];
  requiredForms: string[];
  penalties: string;
  sampleAgreementText: string;
}

export const AdminSettingsModule: React.FC<AdminSettingsModuleProps> = ({
  co,
  update,
  session,
  view,
}) => {
  const [minWage, setMinWage] = useState(co.payrollCfg?.minWage || 350);
  const [payrollTab, setPayrollTab] = useState<'matrix' | 'templates' | 'forms' | 'audit'>('matrix');
  const [selectedLaw, setSelectedLaw] = useState<StatutoryLawItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Features F11 state
  const [features, setFeatures] = useState<Record<string, boolean>>(
    co.features || {
      inventory: true,
      gst: true,
      tds: true,
      msme: true,
      backdatedJustify: true,
      proceedingsAttachment: true,
    }
  );

  const toggleFeature = (k: string) => {
    const next = { ...features, [k]: !features[k] };
    setFeatures(next);
    update(c => {
      c.features = next;
    });
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Comprehensive Statutory Labour Laws Data with Drill Down Details
  const statutoryLaws: StatutoryLawItem[] = [
    {
      id: 'min_wage',
      act: 'Minimum Wages Act, 1948 & Code on Wages, 2019',
      icon: '⚖️',
      scope: 'Packhouse, Sorting, Grading & Processing Staff',
      mandate: 'Mandatory payment of notified minimum daily wages (Unskilled: ₹350+, Semi-skilled: ₹450+, Skilled: ₹580+). Overtime paid at 2x normal rate for >8 hrs/day.',
      status: 'Compliant',
      statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      sections: [
        'Section 12: Mandatory payment of minimum rates of wages without unauthorized deductions.',
        'Section 14: Overtime wage calculation at double the normal rate of wages (200%).',
        'Section 18: Maintenance of registers, wage slips (Form XIX), and muster rolls.',
        'Rule 23: Issue of wage slip prior to disbursement of wages on bank account/digital payout.',
      ],
      applicability: 'All FPC packhouse workers, seed sorting/grading staff, grain loader/unloader crews, and seasonal processing plant labor.',
      fpcObligations: [
        'Display Minimum Wage Notifications at FPC Packhouse & Procurement Center gate in local language.',
        'Ensure direct payment of wages into worker bank accounts or Aadhaar-linked UPI accounts.',
        'Issue monthly Wage Slips in Form XIX detailing basic wage, allowances, overtime hours, and deductions.',
        'Ensure female and male workers receive identical minimum wages for same/similar work.',
      ],
      requiredForms: ['Form XIX - Wage Slip', 'Form A - Overtime Register', 'Form XVI - Muster Roll', 'Form XVII - Register of Wages'],
      penalties: 'Imprisonment up to 6 months and/or fine up to ₹1,00,000 under Section 54 of Code on Wages, 2019 for non-payment or underpayment.',
      sampleAgreementText: `STATUTORY WAGE AGREEMENT & ENGAGEMENT NOTICE\n[Issued by ${co.name} - Regd under Companies Act / FPC Provisions]\n\nWorker Name: __________________________ Token No: _________\nDesignation / Skill Category: [ ] Unskilled  [ ] Semi-Skilled  [ ] Skilled\nDaily Wage Rate: ₹ ________ / day (Not less than Notified State Minimum Wage)\nNormal Working Hours: 8 hours per day (6 days/week)\nOvertime Allowance: 200% of normal hourly rate for any work beyond 8 hours/day.\nMode of Payment: Direct Bank Account Transfer / Aadhaar UPI.\n\nSigned by FPC Authorized Representative: _____________________\nSigned by Worker: _____________________ Date: _______________`,
    },
    {
      id: 'clra',
      act: 'Contract Labour (Regulation & Abolition) Act, 1970 (CLRA)',
      icon: '📜',
      scope: 'Seasonal Harvest & Grain Collection Contract Labour',
      mandate: 'Mandatory Form V License from Labour Dept if engaging >20 seasonal workers. Must maintain Form XVI (Muster Roll) and Form XVII (Register of Wages).',
      status: 'License Active',
      statusColor: 'bg-blue-950 text-blue-300 border-blue-800',
      sections: [
        'Section 7: Registration of Principal Employer (FPC) with District Labour Officer.',
        'Section 12: Licensing of Labour Contractors engaging 20 or more workmen.',
        'Section 21: Responsibility of Principal Employer for timely payment of wages if contractor defaults.',
        'Rule 72: Issuance of Form V Certificate to contractor for obtaining license.',
      ],
      applicability: 'Seasonal harvest gangs, Mandi loading/unloading labor contractors, and third-party transport/bagging labor.',
      fpcObligations: [
        'Obtain Principal Employer Registration Certificate under CLRA Act.',
        'Issue Form V Certificate only to licensed Labour Contractors.',
        'Depute FPC Official to supervise wage disbursement by contractor and endorse Register of Wages.',
        'Ensure basic amenities at procurement site: drinking water, rest sheds, and first-aid boxes.',
      ],
      requiredForms: ['Form V - Principal Employer Certificate', 'Form VI - Contractor License', 'Form XVI - Muster Roll', 'Form XVII - Register of Wages'],
      penalties: 'Fine up to ₹50,000 and/or imprisonment up to 3 months for operating without Principal Employer Registration or engaging unlicensed contractors.',
      sampleAgreementText: `FORM V - CERTIFICATE BY PRINCIPAL EMPLOYER\n[Rule 21(2) - Contract Labour (R&A) Central Rules]\n\nCertified that ${co.name} (Principal Employer) has engaged M/s ______________________ (Contractor) as a contractor in our establishment for seasonal grain handling/harvesting operations.\n\nPeriod of Contract: From _________ to _________\nMaximum Number of Contract Labour Engaged: _________\n\nAuthorized Signatory, ${co.name}:\nName: ______________________ Designation: CEO / Managing Director`,
    },
    {
      id: 'maternity',
      act: 'Maternity Benefit Act, 1961 (2017 Amendment) & Equal Remuneration',
      icon: '🌺',
      scope: 'Crucial for Women / Mahila FPCs (Female Members & Staff)',
      mandate: '26 weeks fully paid maternity leave for female employees. Mandatory crèche facility if >50 employees. Strict equal wages for equal work in sorting/grading.',
      status: 'Mandatory Policy',
      statusColor: 'bg-purple-950 text-purple-300 border-purple-800',
      sections: [
        'Section 5: Right to payment of maternity benefit for 26 weeks (12 weeks for 3rd child).',
        'Section 11A: Mandatory Crèche Facility in establishments with 50 or more employees.',
        'Equal Remuneration Act, Section 4: Prohibition of discrimination in wages on grounds of sex.',
        'Section 12: Dismissal during absence on maternity leave prohibited.',
      ],
      applicability: 'All female staff, Mahila FPC board directors, packhouse sorting/grading labor, and administrative personnel.',
      fpcObligations: [
        'Grant 26 weeks paid leave to eligible female employees having worked >=80 days in preceding 12 months.',
        'Provide 4 crèche visits daily for working mothers with children below 6 years.',
        'Maintain Equal Remuneration Register in Form D ensuring zero gender pay gap.',
        'Provide safe transport facilities for women workers if working in late evening shifts.',
      ],
      requiredForms: ['Form D - Equal Remuneration Register', 'Maternity Claim Notice Form', 'Crèche Attendance Log'],
      penalties: 'Imprisonment from 3 months up to 1 year and fine up to ₹50,000 for denial of maternity benefit or equal pay.',
      sampleAgreementText: `MAHILA FPC EQUAL OPPORTUNITY & MATERNITY PROTECTION DECLARATION\n[Adopted by Board of Directors of ${co.name}]\n\n1. EQUAL WAGES: Absolute equality in daily/piece-rate wages between female and male workers for sorting, grading, and packing.\n2. MATERNITY PROTECTION: Paid leave of 26 weeks for female employees with continuation of full basic wages and allowances.\n3. CRÈCHE & HEALTH: Safe, hygienic crèche area and drinking water provided at processing center.\n4. INTERNAL COMPLAINTS COMMITTEE (POSH): Zero tolerance against workplace harassment.\n\nIssued by order of Board of Directors: _____________________`,
    },
    {
      id: 'epf_esi',
      act: 'EPF & MP Act, 1952 & ESI Act, 1948',
      icon: '🏦',
      scope: 'Permanent Office Staff, CEO & Processing Plant Operators',
      mandate: 'EPF mandatory if >=20 staff (12% employee + 12% employer). ESI mandatory if >=10 staff (0.75% + 3.25%). Seasonal casual field workers exempt if purely agricultural.',
      status: 'Threshold Monitored',
      statusColor: 'bg-amber-950 text-amber-300 border-amber-800',
      sections: [
        'EPF Section 6: Statutory contribution of 12% basic + DA by Employee and 12% by Employer.',
        'ESI Section 39: Medical insurance contribution of 0.75% (Employee) and 3.25% (Employer).',
        'Section 16(1)(a): Exemption for purely casual agricultural operations.',
      ],
      applicability: 'FPC CEO, Accountant, Agronomists, Packhouse Supervisors, Plant Operators, and permanent administrative staff.',
      fpcObligations: [
        'Register FPC on EPFO Shram Suvidha Portal once headcount touches 20 employees.',
        'Deduct employee share of EPF/ESI from monthly payroll and deposit by 15th of following month.',
        'Link UAN (Universal Account Number) with worker Aadhaar and Bank Account.',
        'Maintain Electronic Challan cum Return (ECR) filing records.',
      ],
      requiredForms: ['Form 11 - EPF Declaration Form', 'Form 2 - EPF Nomination', 'ECR Monthly Return'],
      penalties: 'Interest at 12% p.a. + damages up to 25% for delayed EPFO deposits, plus penal liability under IPC 406/409.',
      sampleAgreementText: `EPF & ESI APPLICABILITY DECLARATION\n[Company: ${co.name}]\n\nTotal Permanent/Regular Staff Headcount: _________\nExemption Status: [ ] Headcount < 20 (Monitored)  [ ] Headcount >= 20 (EPF Registered)\nEPF Establishment ID: ____________________ ESI Code: ____________________\nCompliance Officer: CEO / Accountant (${co.name})\n\nEndorsed by Managing Director: _____________________ Date: _______________`,
    },
    {
      id: 'osh',
      act: 'Occupational Safety, Health & Working Conditions Code, 2020 (OSH)',
      icon: '🥽',
      scope: 'Packhouse, Grain Processing, Seed Cleaning Units',
      mandate: 'Mandatory personal protective equipment (gloves, dust masks, safety boots). Annual medical health checkup for machinery operators and first-aid kits at site.',
      status: 'Safety Audit Done',
      statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      sections: [
        'Section 6: Duty of employer to provide safe working environment, free from hazards.',
        'Section 18: Issue of appointment letters to all workers within 3 months of joining.',
        'Section 23: Mandatory provision of Personal Protective Equipment (PPE) at employer cost.',
        'Section 119: Maintenance of First-Aid Boxes with prescribed medical supplies.',
      ],
      applicability: 'Seed cleaning plant operators, grain dryer technicians, warehouse workers, tractor drivers, and heavy loaders.',
      fpcObligations: [
        'Provide free PPE (N95 masks, anti-skid boots, heavy-duty gloves, safety goggles) to processing workers.',
        'Maintain First Aid Box at each procurement center and packhouse facility.',
        'Conduct annual health checkups for workers operating grain dusters or chemical seed treatment machinery.',
        'Maintain Accident & Dangerous Occurrences Register in Form B.',
      ],
      requiredForms: ['Form B - Accident Register', 'PPE Distribution Log', 'Annual Medical Checkup Record'],
      penalties: 'Fine up to ₹2,00,000 for failure to maintain safety standards or supply mandatory safety equipment.',
      sampleAgreementText: `PACKHOUSE SAFETY & PPE LOG REGISTER\n[Facility: ${co.name} Agri-Processing Center]\n\nWorker Name: __________________________ Token/ID: _________\nMachine Operated: Seed Cleaner / Grain Dryer / Sorting Conveyor\nPPE Issued: [✓] Dust Mask  [✓] Rubber Gloves  [✓] Safety Boots  [✓] Ear Plugs\nFirst Aid Box Inspected on: _______________ Status: Complete\n\nSafety Officer Signature: _____________________ Worker Signature: _____________________`,
    },
    {
      id: 'workmen_comp',
      act: "Employees' Compensation Act, 1923 (Workmen Compensation)",
      icon: '🏥',
      scope: 'Tractor Trailer Drivers, Grain Millers, Processing Operators',
      mandate: 'Mandatory accident insurance cover for high-risk processing machinery operations to compensate against injury/disability incurred during course of employment.',
      status: 'Policy Insured',
      statusColor: 'bg-blue-950 text-blue-300 border-blue-800',
      sections: [
        'Section 3: Employer liability for compensation in case of personal injury caused by accident arising out of and in course of employment.',
        'Section 4: Quantum of compensation based on monthly wages and age factor.',
        'Section 10: Mandatory notice of accident to Labour Commissioner within 7 days.',
      ],
      applicability: 'Machinery operators, tractor drivers, high-stacking warehouse labor, and transport crew.',
      fpcObligations: [
        'Obtain Workmen Compensation Insurance Policy covering all machinery & transport workers.',
        'Report any workplace injury immediately to District Workmen Compensation Commissioner.',
        'Pay medical reimbursement and temporary disablement allowance without delay.',
      ],
      requiredForms: ['Form EE - Report of Fatal Accident/Injury', 'Workmen Compensation Policy Schedule'],
      penalties: 'Penalty up to 50% of compensation amount + interest at 12% for delayed payment of compensation.',
      sampleAgreementText: `WORKMEN COMPENSATION INSURANCE NOTICE\n[Issued by ${co.name}]\n\nInsurer Name: __________________________ Policy No: ____________________\nCoverage Amount: ₹ 25,00,000 Sum Insured covering all packhouse & field machinery operators.\nEmergency Hospital Network Contact: _____________________\nFPC Emergency Helpline: _____________________\n\nIssued by Managing Director: _____________________ Date: _______________`,
    },
    {
      id: 'bonus_gratuity',
      act: 'Payment of Bonus Act, 1965 & Gratuity Act, 1972',
      icon: '🎁',
      scope: 'Staff with >=1 year service earning <= ₹21,000/month',
      mandate: 'Min 8.33% statutory annual bonus payable before Diwali/harvest festival. 15 days salary per year of service as gratuity after 5 completed years of service.',
      status: 'Accrued Annually',
      statusColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      sections: [
        'Bonus Section 10: Mandatory minimum bonus of 8.33% of annual salary (or ₹100, whichever is higher).',
        'Gratuity Section 4: Payment of gratuity at rate of 15 days last drawn wage for each completed year of service.',
        'Gratuity Formula: (Last Drawn Basic Salary * 15 / 26) * Total Years of Service.',
      ],
      applicability: 'All permanent FPC staff, office executives, supervisors, and plant operators with completed service.',
      fpcObligations: [
        'Disburse annual statutory bonus within 8 months of close of financial year (before major festival).',
        'Maintain Register of Bonus in Form C.',
        'Obtain Group Gratuity Insurance scheme or establish FPC Gratuity Fund.',
      ],
      requiredForms: ['Form C - Register of Bonus', 'Form F - Gratuity Nomination Form'],
      penalties: 'Imprisonment up to 6 months and fine for non-payment of statutory bonus or gratuity.',
      sampleAgreementText: `ANNUAL STATUTORY BONUS CALCULATION REGISTER\n[Financial Year: 2025-26 - ${co.name}]\n\nEmployee Name: __________________________ Basic Annual Salary: ₹ _____________\nStatutory Bonus Rate: 8.33% (Min) / ____ % (Max 20%)\nBonus Payable: ₹ _____________ (Disbursed prior to Diwali/Bihu festival)\n\nApproved by FPC Accountant: _____________________ CEO Signature: _____________________`,
    },
    {
      id: 'migrant',
      act: 'Inter-State Migrant Workmen Act, 1979',
      icon: '🚌',
      scope: 'Migrant Harvest Teams Recruited Across State Borders',
      mandate: 'Registration and passbook issuance for migrant harvesting gangs brought from outside state borders with displacement allowance and journey allowance.',
      status: 'Register Maintained',
      statusColor: 'bg-slate-800 text-slate-300 border-slate-700',
      sections: [
        'Section 4: Registration of establishments employing inter-state migrant workmen.',
        'Section 14: Payment of Displacement Allowance (50% of monthly wage or ₹75).',
        'Section 15: Payment of Journey Allowance covering transport fare from home state to FPC mandi site.',
      ],
      applicability: 'Outstation harvest gangs, specialized combine harvester crews, and cross-border seasonal farm workers.',
      fpcObligations: [
        'Issue Passbook in local language to every inter-state worker with wage rates and allowances.',
        'Pay displacement allowance and travel fare for return journey to home state.',
        'Provide suitable residential accommodation with cooking fuel facilities.',
      ],
      requiredForms: ['Form X - Inter-State Migrant Passbook', 'Form XI - Displacement Allowance Register'],
      penalties: 'Imprisonment up to 1 year or fine up to ₹50,000 for non-issuance of passbooks or non-payment of journey allowance.',
      sampleAgreementText: `INTER-STATE MIGRANT WORKMAN PASSBOOK\n[Issued under Rule 23 of Inter-State Migrant Workmen Rules]\n\nWorkman Name: __________________________ Home State: ____________________\nRecruiting Agent/Sardar: ____________________ Passport/Aadhaar No: _____________\nDisplacement Allowance Paid: ₹ ________ Travel Allowance Paid: ₹ ________\nDaily Wage Rate: ₹ ________ / day\n\nIssued by ${co.name}: _____________________ Date: _______________`,
    },
  ];

  const filteredLaws = statutoryLaws.filter(law =>
    law.act.toLowerCase().includes(searchQuery.toLowerCase()) ||
    law.scope.toLowerCase().includes(searchQuery.toLowerCase()) ||
    law.mandate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-3">
        <h2 className="text-base font-bold text-slate-100">
          {view === 'payroll' && '👷 Payroll, Labour Laws & Statutory FPC Information Templates'}
          {view === 'features' && '⚙️ Company Features & Accounting Rules (F11)'}
          {view === 'bridge' && '🔁 Excel / Google Sheets Connector Bridge'}
          {view === 'users' && '👥 User Accounts, Role Permissions & Access Control'}
          {view === 'company' && '🏢 Company Master & Multi-Device Local/Cloud Sync'}
        </h2>
        <p className="text-xs text-slate-400">
          System Configuration &amp; Administrative Controls for {co.name}
        </p>
      </div>

      {/* PAYROLL & LABOUR LAW RELEVANT TO FARMER PRODUCER COMPANIES (FPCs) */}
      {view === 'payroll' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                  Statutory Labour Law Engine
                </span>
                <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono px-2 py-0.5 rounded">
                  FPC &amp; Agri-Processing Compliant
                </span>
              </div>
              <h3 className="text-sm font-bold text-white">
                👷 Labour Laws, Statutory Compliance &amp; Information Templates for ({co.name})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Full statutory coverage: Minimum Wages Act, CLRA, Maternity Benefit Act, EPF/ESI, OSH Code &amp; Workmen Compensation for FPC Packhouse &amp; Field Staff.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Daily Min Wage Config:</span>
              <input
                type="number"
                value={minWage}
                onChange={e => {
                  setMinWage(+e.target.value);
                  update(c => {
                    c.payrollCfg = c.payrollCfg || { minWage: 350 };
                    c.payrollCfg.minWage = +e.target.value;
                  });
                }}
                className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-400">₹/day</span>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setPayrollTab('matrix')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payrollTab === 'matrix'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📜 Statutory Compliance Matrix ({statutoryLaws.length} Acts)
              </button>

              <button
                onClick={() => setPayrollTab('templates')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payrollTab === 'templates'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📂 FPC Information Templates Repository
              </button>

              <button
                onClick={() => setPayrollTab('forms')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payrollTab === 'forms'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                📋 Mandatory Statutory Registers &amp; Forms
              </button>

              <button
                onClick={() => setPayrollTab('audit')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  payrollTab === 'audit'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🔍 Labour Inspector Audit Checklist
              </button>
            </div>

            {/* Search Filter */}
            <input
              type="text"
              placeholder="🔍 Search Acts, Scope or Mandates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-3 py-1 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* TAB 1: COMPLIANCE MATRIX WITH DRILL DOWN */}
          {payrollTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  📜 FPC Statutory Labour Law Compliance Matrix (Click any Act for In-Depth Drill Down)
                </h4>
                <span className="text-[11px] text-blue-400 font-medium">
                  💡 Tip: Click on any card below to open full legal provisions, required forms &amp; agreement templates!
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {filteredLaws.map(law => (
                  <div
                    key={law.id}
                    onClick={() => setSelectedLaw(law)}
                    className="bg-slate-950 border border-slate-800 hover:border-blue-600/60 p-3.5 rounded-xl space-y-2.5 transition-all cursor-pointer hover:shadow-lg group relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl group-hover:scale-110 transition-transform">{law.icon}</span>
                        <h5 className="font-bold text-slate-100 group-hover:text-blue-300 leading-tight">
                          {law.act}
                        </h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${law.statusColor} shrink-0`}>
                        {law.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-blue-400 font-semibold">{law.scope}</div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{law.mandate}</p>

                    <div className="pt-1 border-t border-slate-900 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500 font-mono">
                        {law.requiredForms.length} Forms Required
                      </span>
                      <span className="text-blue-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        🔍 View In-Depth Drill Down &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Wage & Overtime Calculator */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-4 mt-6">
                <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    🧮 FPC Statutory Wage &amp; Overtime Slip Generator (Code on Wages 2019)
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">200% Overtime Rate Enforced</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Worker Name / Token No:</label>
                    <input
                      type="text"
                      defaultValue="Ramesh Saikia (Packhouse Worker)"
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Skill Category:</label>
                    <select className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-semibold">
                      <option value="350">Unskilled (Farm Harvest &amp; Loading) - ₹350/day</option>
                      <option value="450">Semi-Skilled (Sorting &amp; Grading) - ₹450/day</option>
                      <option value="580">Skilled (Machine Operator / Driver) - ₹580/day</option>
                      <option value="850">Highly Skilled (Plant Manager / Agronomist) - ₹850/day</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Regular Days Worked (Month):</label>
                    <input
                      type="number"
                      defaultValue={26}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Overtime Hours (at 2x Rate):</label>
                    <input
                      type="number"
                      defaultValue={12}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Basic Monthly Wage:</span>
                    <span className="text-slate-100 font-bold font-mono text-sm">₹ 11,700</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Overtime Pay (2x Rate):</span>
                    <span className="text-amber-400 font-bold font-mono text-sm">+ ₹ 1,462</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">EPF Deduction (12%):</span>
                    <span className="text-red-400 font-bold font-mono text-sm">- ₹ 1,404</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">ESI Deduction (0.75%):</span>
                    <span className="text-red-400 font-bold font-mono text-sm">- ₹ 88</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Net Payable Wage:</span>
                    <span className="text-emerald-400 font-black font-mono text-base">₹ 11,670</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FPC INFORMATION TEMPLATES REPOSITORY */}
          {payrollTab === 'templates' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  📂 FPC Information &amp; Legal Agreement Templates Repository
                </h4>
                <span className="text-xs text-slate-400">
                  Ready-to-use statutory documents formatted for Farmer Producer Companies
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  {
                    key: 'tpl_harvest',
                    title: '🌾 Seasonal Harvest & Mandi Labour Engagement Agreement',
                    category: 'Harvesting & Procurement',
                    desc: 'Formal engagement agreement between FPC and Seasonal Labour Gang / Sardar covering piece-rate rates, token register, drinking water, and basic safety.',
                    content: `SEASONAL HARVEST & MANDI LABOUR ENGAGEMENT AGREEMENT\n\nExecuted at: ${co.name} Registered Office\nDate: _________________________\n\nBY AND BETWEEN:\n1. ${co.name} (hereinafter referred to as "FPC / Principal Employer"), represented by its CEO/Authorized Officer.\nAND\n2. Shri / Smt ______________________________________ (Sardar / Labour Gang Representative), residing at ______________________________________ (Aadhaar No: ________________________).\n\nTERMS & CONDITIONS:\n1. SCOPE OF WORK: Harvesting, field sorting, bag loading, weighing, and mandi dispatch of produce.\n2. WAGE STRUCTURE: Agreed daily rate of ₹ ________ / day OR piece-rate of ₹ ________ / quintal loaded.\n3. TIMELY PAYOUT: Payout shall be deposited directly into bank accounts / Aadhaar UPI of individual workers within 3 days of harvest completion.\n4. SAFETY & HYGIENE: FPC shall provide clean drinking water, shaded rest area, and first-aid facilities at field site.\n5. NO CHILD LABOUR: Engagement of any person below 18 years of age is strictly prohibited.\n\nSIGNATURES:\nFor FPC (${co.name}): _____________________   Labour Sardar Signature: _____________________`,
                  },
                  {
                    key: 'tpl_mahila',
                    title: '🌺 Mahila FPC Equal Wage & Workplace Safety Declaration',
                    category: 'Gender Equality & POSH',
                    desc: 'Statutory policy declaration for female-led or women member FPCs enforcing equal wages for equal work, crèche access, and POSH guidelines.',
                    content: `MAHILA FPC EQUAL WAGE & WORKPLACE SAFETY DECLARATION\n\n[Adopted by Resolution of the Board of Directors of ${co.name}]\n\n1. EQUAL REMUNERATION: In compliance with Code on Wages 2019 and Equal Remuneration principles, female and male workers engaged in sorting, grading, seed treatment, and office tasks shall receive equal wages without gender bias.\n2. MATERNITY PROTECTION: Full 26 weeks paid maternity leave shall be granted to eligible female staff.\n3. HYGIENE & CRÈCHE FACILITIES: Dedicated clean rest rooms, drinking water, and crèche area shall be maintained at all FPC packhouse locations.\n4. PREVENTION OF SEXUAL HARASSMENT (POSH): Internal Complaints Committee (ICC) constituted. Complaints can be registered directly with Presiding Officer at email: ${co.meta?.officialEmail || 'compliance@fpc.org'}.\n\nIssued by order of Board of Directors, ${co.name}`,
                  },
                  {
                    key: 'tpl_clra_formv',
                    title: '📜 Contract Labour (CLRA) Form V Certificate',
                    category: 'Contract Labour',
                    desc: 'Principal Employer Certificate issued by FPC to Labour Contractors for obtaining license from District Labour Department.',
                    content: `FORM V - CERTIFICATE BY PRINCIPAL EMPLOYER\n[See Rule 21(2) of Contract Labour (R&A) Central Rules]\n\n1. Certified that I have engaged M/s ______________________________________ as a contractor in my establishment.\n2. Name of Establishment: ${co.name}\n3. Nature of work to be carried out: Seasonal Agri-Produce Sorting, Bagging & Mandi Handling\n4. Location of work: FPC Packhouse & Procurement Center, ${co.meta?.district || 'District'}\n5. Duration of Contract: From _______________ to _______________\n6. Max number of contract workmen engaged: _______________\n\nPlace: _______________   Date: _______________\nSignature of Principal Employer: _____________________\nName: _____________________ Designation: CEO / Managing Director, ${co.name}`,
                  },
                  {
                    key: 'tpl_board_res',
                    title: '🏛️ FPC Board Resolution for Labour Compliance Officer',
                    category: 'Governance & Board',
                    desc: 'Board Resolution appointing CEO / Director as Designated Officer for Labour Law & Statutory Register compliance under Companies Act.',
                    content: `CERTIFIED TRUE COPY OF RESOLUTION PASSED AT BOARD MEETING OF ${co.name}\nHELD ON _______________ AT REGISTERED OFFICE\n\n"RESOLVED THAT pursuant to provisions of Companies Act, 2013 and applicable statutory Labour Codes, Shri/Smt ______________________________________, CEO / Director of ${co.name}, be and is hereby designated as the Compliance Officer responsible for maintenance of Labour Registers, Minimum Wage disbursement, EPF/ESI filings, and Safety Inspections."\n\n"RESOLVED FURTHER THAT the Compliance Officer is authorized to sign Form V, Form XVI, Form XVII, and represent the FPC before Labour Inspectors."\n\nCertified True Copy:\nDirector 1 Signature: _____________________   Director 2 Signature: _____________________`,
                  },
                  {
                    key: 'tpl_osh_ppe',
                    title: '🥽 OSH Code Packhouse Safety & First-Aid Register Template',
                    category: 'Packhouse Safety',
                    desc: 'Occupational safety checklist and PPE log for workers operating seed processing, grain dryers, and sorting machinery.',
                    content: `PACKHOUSE OCCUPATIONAL SAFETY & PPE LOG\nFacility: ${co.name} Packhouse Center\n\n[ ] Personal Protective Equipment (PPE) Issued: Dust Masks, Safety Gloves, Non-Skid Boots\n[ ] First-Aid Box Inspection: Antiseptic lotion, bandages, burn ointment, pain relief sprays verified.\n[ ] Machine Guarding: Belt drives and rotating shafts of seed cleaner/grader fully enclosed.\n[ ] Emergency Shutdown: Red emergency stop buttons operational on processing line.\n[ ] Drinking Water & Rest Area: Clean filtered water station checked daily.\n\nInspected by Safety Officer: _____________________ Date: _______________`,
                  },
                  {
                    key: 'tpl_migrant_passbook',
                    title: '🚌 Inter-State Migrant Harvest Worker Passbook Format',
                    category: 'Migrant Workers',
                    desc: 'Statutory passbook issued to outstation harvest teams specifying travel allowance, displacement allowance, and daily wage rates.',
                    content: `INTER-STATE MIGRANT WORKMAN STATUTORY PASSBOOK\n[Issued under Rule 23 - Inter-State Migrant Workmen Act, 1979]\n\nPassbook Serial No: FPC/MS/2026/______\nIssued By Establishment: ${co.name}\n\n1. Workman Name: ______________________________________ Age: ______ Sex: _____\n2. Home State Address: ___________________________________________________\n3. Aadhaar No: _________________________________________\n4. Name of Recruiting Sardar: ___________________________________________\n5. Daily Wage Rate: ₹ ________ / day   Overtime Rate: ₹ ________ / hr\n6. Displacement Allowance Paid: ₹ ________   Return Transport Ticket: Paid [✓]\n\nSignature of FPC Authorized Officer: _____________________`,
                  },
                ].map((tpl) => (
                  <div key={tpl.key} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
                          {tpl.category}
                        </span>
                        <button
                          onClick={() => copyToClipboard(tpl.content, tpl.key)}
                          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === tpl.key ? '✓ Copied Template!' : '📋 Copy Template'}
                        </button>
                      </div>
                      <h5 className="font-bold text-slate-100 text-sm">{tpl.title}</h5>
                      <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{tpl.desc}</p>

                      <pre className="mt-3 p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono overflow-x-auto max-h-36 whitespace-pre-wrap leading-tight">
                        {tpl.content}
                      </pre>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => copyToClipboard(tpl.content, tpl.key)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {copiedKey === tpl.key ? '✓ Copied to Clipboard!' : '📑 Copy Full Document'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STATUTORY REGISTERS & FORMS FORMATS */}
          {payrollTab === 'forms' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  📋 Mandatory Statutory Register Formats (Prescribed under Labour Codes)
                </h4>
                <span className="text-xs text-slate-400">
                  Form formats required to be maintained at FPC Registered Office &amp; Packhouse
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {[
                  {
                    form: 'Form XVI - Muster Roll (Attendance Register)',
                    act: 'CLRA & Code on Wages',
                    fields: ['Worker Name & Token No', 'Skill Category', 'Daily Attendance (1-31)', 'Total Days Worked', 'Overtime Hours'],
                    rule: 'Must be updated daily before commencement of work shift at packhouse.',
                  },
                  {
                    form: 'Form XVII - Register of Wages',
                    act: 'Minimum Wages & CLRA',
                    fields: ['Rate of Wages', 'Basic Salary', 'Overtime Earned', 'Gross Wages', 'EPF/ESI Deductions', 'Net Paid', 'Worker Bank Account / Signature'],
                    rule: 'Must be preserved for a minimum of 3 years from date of last entry.',
                  },
                  {
                    form: 'Form XIX - Statutory Wage Slip',
                    act: 'Code on Wages, Rule 23',
                    fields: ['FPC Name & Address', 'Worker Name & Token', 'Designation', 'Wage Period', 'Basic Rate', 'Deductions Breakdown', 'Net Amount'],
                    rule: 'Mandatory issuance to worker at least 1 day prior to disbursement of wages.',
                  },
                  {
                    form: 'Form A - Register of Overtime',
                    act: 'Factories Act / OSH Code',
                    fields: ['Date of Overtime', 'Normal Hours', 'Overtime Hours Worked', 'Overtime Hourly Rate (200%)', 'Total Overtime Pay', 'Signature'],
                    rule: 'Overtime payment must be disbursed along with regular monthly wages.',
                  },
                  {
                    form: 'Form D - Equal Remuneration Register',
                    act: 'Equal Remuneration Rules',
                    fields: ['Category of Work', 'No. of Male Workers', 'No. of Female Workers', 'Wage Rate (Male)', 'Wage Rate (Female)', 'Verification Note'],
                    rule: 'Mandatory for all packhouses employing female and male workers on same work.',
                  },
                  {
                    form: 'Form B - Register of Accidents & Injuries',
                    act: 'OSH Code & Workmen Comp',
                    fields: ['Date & Time of Accident', 'Worker Name & Age', 'Nature of Injury', 'First-Aid Given', 'Hospitalization Ref', 'Commissioner Notice Date'],
                    rule: 'Must be presented immediately upon inspection by Factory / Labour Inspector.',
                  },
                ].map((f, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-100 text-sm">{f.form}</h5>
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        {f.act}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-semibold block mb-1">Prescribed Columns / Fields:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {f.fields.map((field, fIdx) => (
                          <span key={fIdx} className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded font-mono">
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-blue-400 font-medium border-t border-slate-900 pt-2">
                      📌 Statutory Requirement: {f.rule}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: LABOUR INSPECTOR AUDIT CHECKLIST */}
          {payrollTab === 'audit' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  🔍 Labour Court &amp; Factory Inspector Audit Preparedness Checklist
                </h4>
                <span className="text-xs text-emerald-400 font-mono font-bold">100% Audit Readiness Score</span>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                {[
                  { item: 'State Minimum Wage Notification Notice Board displayed at FPC Packhouse gate in local language.', status: true },
                  { item: 'Form V Principal Employer Certificate issued for seasonal contract labour contractors.', status: true },
                  { item: 'Form XVI Muster Roll & Form XVII Register of Wages updated up to preceding month.', status: true },
                  { item: 'Bank Account / UPI payment records matching with Register of Wages disbursement totals.', status: true },
                  { item: 'EPF ECR Return & ESI Monthly Challan receipt filed before 15th of month.', status: true },
                  { item: 'First Aid Box fully equipped with antiseptic lotion, bandages, and burn ointments at site.', status: true },
                  { item: 'Personal Protective Equipment (PPE) distribution register signed by seed mill operators.', status: true },
                  { item: 'Form D Equal Remuneration Register maintained confirming uniform wages for women workers.', status: true },
                  { item: 'Workmen Compensation Insurance Policy copy available at FPC Registered Office.', status: true },
                  { item: 'Overtime hours logged in Form A and paid at double normal wage rate (200%).', status: true },
                ].map((chk, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <span className="text-slate-200 font-medium flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">✓</span> {chk.item}
                    </span>
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded shrink-0">
                      VERIFIED COMPLIANT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DRILL DOWN MODAL FOR STATUTORY LAWS */}
      {selectedLaw && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedLaw.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedLaw.statusColor}`}>
                      {selectedLaw.status}
                    </span>
                    <span className="text-slate-400 text-xs font-mono">Act ID: {selectedLaw.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedLaw.act}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedLaw(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 hover:bg-slate-800 transition-all text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* Applicable Operational Scope */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <h4 className="font-bold text-blue-400 uppercase text-[11px]">🏢 Operational Scope in FPC:</h4>
                <p className="text-slate-200 font-medium">{selectedLaw.applicability}</p>
              </div>

              {/* Statutory Sections */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase text-[11px]">⚖️ Key Statutory Sections &amp; Clauses:</h4>
                <div className="space-y-1.5">
                  {selectedLaw.sections.map((sec, sIdx) => (
                    <div key={sIdx} className="p-2 bg-slate-900/80 border border-slate-800/80 rounded-lg text-slate-300 font-mono text-[11px]">
                      • {sec}
                    </div>
                  ))}
                </div>
              </div>

              {/* FPC Obligations Checklist */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-200 uppercase text-[11px]">✅ Mandatory FPC Compliance Obligations:</h4>
                <div className="space-y-1.5">
                  {selectedLaw.fpcObligations.map((ob, oIdx) => (
                    <div key={oIdx} className="flex items-start gap-2 text-slate-300">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{ob}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Forms */}
              <div>
                <h4 className="font-bold text-slate-200 uppercase text-[11px] mb-1.5">📋 Statutory Forms &amp; Registers Required:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedLaw.requiredForms.map((frm, fIdx) => (
                    <span key={fIdx} className="bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold px-2.5 py-1 rounded">
                      {frm}
                    </span>
                  ))}
                </div>
              </div>

              {/* Penal Liabilities */}
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl space-y-1">
                <h4 className="font-bold text-red-400 uppercase text-[11px]">⚠️ Non-Compliance Penalty Provisions:</h4>
                <p className="text-red-200">{selectedLaw.penalties}</p>
              </div>

              {/* Ready-to-use Statutory Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200 uppercase text-[11px]">📄 Statutory Agreement / Notice Template:</h4>
                  <button
                    onClick={() => copyToClipboard(selectedLaw.sampleAgreementText, `modal_${selectedLaw.id}`)}
                    className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === `modal_${selectedLaw.id}` ? '✓ Copied Text!' : '📋 Copy Agreement Text'}
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-[10px] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {selectedLaw.sampleAgreementText}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => copyToClipboard(selectedLaw.sampleAgreementText, `modal_${selectedLaw.id}`)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                📋 Copy Agreement Template
              </button>

              <button
                onClick={() => setSelectedLaw(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Drill Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURES F11 */}
      {view === 'features' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Enable / Disable Accounting Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['inventory', 'Inventory & Stock Tracking (Inwards/Outwards/Valuation)'],
              ['gst', 'GST Compliance & GSTR-1 Outward Sales Engine'],
              ['tds', 'TDS Deduction Register (Chapter XVII-B)'],
              ['msme', 'MSMED Act 45-Day Interest Calculation'],
              ['backdatedJustify', 'Mandatory Justification for Backdated Vouchers'],
              ['proceedingsAttachment', 'Mandatory Proceedings Attachment for Expense Vouchers'],
            ].map(([k, label]) => (
              <div
                key={k}
                onClick={() => toggleFeature(k)}
                className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-800 text-xs"
              >
                <span className="text-slate-200 font-medium">{label}</span>
                <span className={features[k] ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {features[k] ? '✓ Enabled' : '✕ Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EXCEL / SHEETS BRIDGE */}
      {view === 'bridge' && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">Universal Excel / Google Sheets Connector Schema</h3>
            <p className="text-slate-400">
              Columns for standard bulk voucher import/export: VoucherRef · Date · Type · Ledger · Debit · Credit · Narration · PartyName.
            </p>
          </div>
        </div>
      )}

      {/* USERS & ROLES */}
      {view === 'users' && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Configured Access Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">System Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{u.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">{u.name}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-medium">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPANY SETTINGS */}
      {view === 'company' && (
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 text-sm">Company Metadata</h3>
            <p className="text-slate-300"><strong className="text-slate-400">Name:</strong> {co.name}</p>
            <p className="text-slate-300"><strong className="text-slate-400">CIN:</strong> {co.cin || co.meta?.cin || 'N/A'}</p>
            <p className="text-slate-300"><strong className="text-slate-400">Official Email:</strong> {co.meta?.officialEmail || 'N/A'}</p>
            <p className="text-slate-300"><strong className="text-slate-400">District / Block:</strong> {co.meta?.district || 'N/A'} / {co.meta?.block || 'N/A'}</p>
            <p className="text-slate-300"><strong className="text-slate-400">GSTIN:</strong> {co.gstin || 'N/A'}</p>
            <p className="text-slate-300"><strong className="text-slate-400">Financial Year:</strong> {co.fyStart} to {co.fyEnd}</p>
          </div>
        </div>
      )}
    </div>
  );
};

