import React, { useState } from 'react';
import { Company, ShareCertificate } from '../types';
import { numberToWords } from '../utils/numberToWords';

interface ShareCertificateFormSH1Props {
  co: Company;
  cert?: ShareCertificate | null;
  onClose: () => void;
  onSave?: (updatedCert: ShareCertificate) => void;
  defaultBlank?: boolean;
}

export const ShareCertificateFormSH1: React.FC<ShareCertificateFormSH1Props> = ({
  co,
  cert,
  onClose,
  onSave,
  defaultBlank = false,
}) => {
  const [activeTab, setActiveTab] = useState<'front' | 'overleaf'>('front');
  const [isBlank, setIsBlank] = useState<boolean>(defaultBlank);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form state initialized with provided certificate or sensible defaults
  const [formData, setFormData] = useState({
    companyName: co.name || 'FPO FARMER PRODUCER COMPANY LIMITED',
    cin: co.cin || 'U01100AS2024PTC026123',
    incAct: 'The Companies Act, 2013',
    regOffice: co.address || 'AMR Tech Park II, No.23 & 24, Hosur Main Road, Bangalore, Karnataka - 560068',
    certNo: cert?.certNo || 'SC-0001',
    folioNo: cert?.folioNo || 'F-001',
    memberName: cert?.memberName || 'Ramesh Kumar Sarma',
    holderAddress: cert?.holderAddress || 'Vill & PO - Lakhimpur, Dist - Lakhimpur, Assam - 787001',
    numberOfShares: cert?.numberOfShares || 100,
    nominalValue: cert?.nominalValue || 10,
    paidUpValue: cert?.paidUpValue || 10,
    shareClass: cert?.shareClass || 'EQUITY',
    distinctiveFrom: cert?.distinctiveFrom || 1,
    distinctiveTo: cert?.distinctiveTo || 100,
    issueDate: cert?.issueDate || new Date().toISOString().split('T')[0],
    director1: cert?.director1 || 'Ramesh Kumar Sarma (Director)',
    director2: cert?.director2 || 'Anil Chandra Das (Director)',
    secretary: cert?.secretary || 'Priya Sharma (Company Secretary)',
    transfers: cert?.transfers || [
      {
        date: '2026-04-15',
        transferNo: 'TR-001',
        folio: 'F-088',
        transferee: 'Sunita Sarma',
        signatory: 'Auth. Signatory',
      },
    ],
  });

  // Calculate day, month, year from issue date
  const dateObj = new Date(formData.issueDate || Date.now());
  const dayStr = isNaN(dateObj.getDate()) ? '____' : String(dateObj.getDate());
  const monthStr = isNaN(dateObj.getDate())
    ? '________________'
    : dateObj.toLocaleString('en-IN', { month: 'long' });
  const yearStr = isNaN(dateObj.getFullYear()) ? '20___' : String(dateObj.getFullYear());

  const numberOfSharesInWords = numberToWords(formData.numberOfShares);
  const nominalValueInWords = numberToWords(formData.nominalValue).replace(' ONLY', '');
  const paidUpValueInWords = numberToWords(formData.paidUpValue).replace(' ONLY', '');

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    if (onSave) {
      const updated: ShareCertificate = {
        id: cert?.id || `cert_${Date.now()}`,
        certNo: formData.certNo,
        folioNo: formData.folioNo,
        memberName: formData.memberName,
        holderAddress: formData.holderAddress,
        numberOfShares: +formData.numberOfShares,
        nominalValue: +formData.nominalValue,
        paidUpValue: +formData.paidUpValue,
        shareClass: formData.shareClass,
        distinctiveFrom: +formData.distinctiveFrom,
        distinctiveTo: +formData.distinctiveTo,
        issueDate: formData.issueDate,
        status: cert?.status || 'Active',
        director1: formData.director1,
        director2: formData.director2,
        secretary: formData.secretary,
        transfers: formData.transfers,
      };
      onSave(updated);
    }
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto font-sans">
      {/* Top Action Toolbar (Hidden during Print) */}
      <div className="print:hidden w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 mb-4 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-200">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            Form SH-1
          </span>
          <h2 className="font-bold text-slate-100 text-sm">
            Statutory Share Certificate (Companies Act, 2013)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Toggles */}
          <button
            onClick={() => setIsBlank(!isBlank)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors border ${
              isBlank
                ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isBlank ? '📝 Showing Blank SH-1 Template' : '📄 Fill / Auto-populated Data'}
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors border ${
              isEditing
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isEditing ? '👁️ Preview Format' : '✏️ Edit Fields'}
          </button>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('front')}
              className={`px-3 py-1 rounded font-medium text-xs ${
                activeTab === 'front' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page 1: Certificate
            </button>
            <button
              onClick={() => setActiveTab('overleaf')}
              className={`px-3 py-1 rounded font-medium text-xs ${
                activeTab === 'overleaf' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page 2: Overleaf Transfers
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded flex items-center gap-1 shadow transition-colors"
          >
            🖨️ Print / Save PDF
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-3 py-1.5 rounded border border-slate-700"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Editing Form Panel (Hidden during Print) */}
      {isEditing && (
        <div className="print:hidden w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 shadow-xl text-xs space-y-4">
          <h3 className="font-bold text-amber-400 border-b border-slate-800 pb-2 text-sm flex justify-between items-center">
            <span>✏️ Customize Form SH-1 Certificate Particulars</span>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1 rounded text-xs"
            >
              Save Changes
            </button>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-slate-300">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">CIN (Corporate Identity No)</label>
              <input
                type="text"
                value={formData.cin}
                onChange={e => setFormData({ ...formData, cin: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Registered Office Address</label>
              <input
                type="text"
                value={formData.regOffice}
                onChange={e => setFormData({ ...formData, regOffice: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Certificate No.</label>
              <input
                type="text"
                value={formData.certNo}
                onChange={e => setFormData({ ...formData, certNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Register Folio No.</label>
              <input
                type="text"
                value={formData.folioNo}
                onChange={e => setFormData({ ...formData, folioNo: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Shareholder / Holder Name(s)</label>
              <input
                type="text"
                value={formData.memberName}
                onChange={e => setFormData({ ...formData, memberName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">No. of Shares Held</label>
              <input
                type="number"
                value={formData.numberOfShares}
                onChange={e => setFormData({ ...formData, numberOfShares: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Nominal Value Per Share (₹)</label>
              <input
                type="number"
                value={formData.nominalValue}
                onChange={e => setFormData({ ...formData, nominalValue: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Paid-Up Value Per Share (₹)</label>
              <input
                type="number"
                value={formData.paidUpValue}
                onChange={e => setFormData({ ...formData, paidUpValue: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Distinctive No. From</label>
              <input
                type="number"
                value={formData.distinctiveFrom}
                onChange={e => setFormData({ ...formData, distinctiveFrom: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Distinctive No. To</label>
              <input
                type="number"
                value={formData.distinctiveTo}
                onChange={e => setFormData({ ...formData, distinctiveTo: +e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Issue Date</label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Director 1 Signatory</label>
              <input
                type="text"
                value={formData.director1}
                onChange={e => setFormData({ ...formData, director1: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Director 2 Signatory</label>
              <input
                type="text"
                value={formData.director2}
                onChange={e => setFormData({ ...formData, director2: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Secretary / Auth. Person</label>
              <input
                type="text"
                value={formData.secretary}
                onChange={e => setFormData({ ...formData, secretary: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* STATUTORY FORM SH-1 DOCUMENT CANVAS (A4 Printable Layout) */}
      <div
        id="printable-sh1-document"
        className="bg-white text-slate-900 w-full max-w-[800px] min-h-[1050px] p-6 sm:p-10 shadow-2xl relative font-serif text-slate-950 print:p-0 print:shadow-none print:w-full"
      >
        {/* Annexure Indicator */}
        <div className="text-right font-bold font-sans text-xs mb-2">Annexure</div>

        {/* Outer Heavy Border Frame */}
        <div className="border-[3px] border-slate-950 p-1 min-h-[980px]">
          {/* Inner Double Line Border Frame */}
          <div className="border-2 border-slate-950 p-6 sm:p-8 min-h-[960px] flex flex-col justify-between">
            {activeTab === 'front' ? (
              /* FRONT SIDE: FORM NO. SH-1 */
              <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-1">
                  <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider underline underline-offset-4">
                    FORM NO. SH-1
                  </h1>
                  <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">
                    SHARE CERTIFICATE
                  </h2>
                  <p className="text-[11px] sm:text-xs font-bold italic max-w-xl mx-auto leading-tight pt-1">
                    [Pursuant to sub-section (3) of section 46 of the Companies Act, 2013 and Rule 5(2) of the Companies (Share Capital and Debentures) Rules 2014]
                  </p>
                </div>

                {/* Company Name & Registration Details */}
                <div className="text-center pt-2 space-y-1">
                  <div className="text-base sm:text-xl font-bold font-sans uppercase tracking-tight">
                    {isBlank ? '...................................................PRIVATE LIMITED' : formData.companyName}
                  </div>
                  <div className="text-xs font-sans font-semibold">
                    (CIN: {isBlank ? '........................................................' : formData.cin})
                  </div>
                  <div className="text-xs italic">
                    (Incorporated under {formData.incAct})
                  </div>
                  <div className="text-xs pt-1">
                    <span className="font-bold">Registered Office:</span>{' '}
                    {isBlank ? (
                      '.........................................................................................................................................'
                    ) : (
                      formData.regOffice
                    )}
                  </div>
                </div>

                {/* Certification Legal Paragraph */}
                <div className="text-xs sm:text-sm leading-relaxed text-justify pt-2 font-serif">
                  This is to certify that the person(s) named in this Certificate is / are the Registered Holder(s) of the within mentioned share(s) bearing the distinctive number(s) herein specified in the above named Company subject to the Memorandum and Articles of Association of the Company and the amount endorsed herein has been paid up on each such share.
                </div>

                {/* Box 1: Shares Class & Values */}
                <div className="border border-slate-950 p-3 sm:p-4 text-xs sm:text-sm font-bold uppercase space-y-2">
                  <div className="flex flex-wrap justify-between items-center">
                    <span>
                      {formData.shareClass} SHARES EACH OF RUPEES{' '}
                      <span className="underline font-sans">
                        {isBlank ? 'TEN (10)' : `${nominalValueInWords} (${formData.nominalValue})`}
                      </span>
                    </span>
                    <span className="text-[11px] font-normal normal-case">(Nominal value)</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center">
                    <span>
                      AMOUNT PAID-UP PER SHARE RUPEES{' '}
                      <span className="underline font-sans">
                        {isBlank ? 'TEN (10)' : `${paidUpValueInWords} (${formData.paidUpValue})`}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Box 2: Certificate Core Particulars */}
                <div className="border border-slate-950 p-4 text-xs sm:text-sm space-y-3 font-serif">
                  <div className="grid grid-cols-2 gap-4 border-b border-slate-300 pb-2">
                    <div>
                      <span className="font-bold">Register Folio No:</span>{' '}
                      <span className="font-mono font-bold">{isBlank ? '..............' : formData.folioNo}</span>
                    </div>
                    <div>
                      <span className="font-bold">Certificate No:</span>{' '}
                      <span className="font-mono font-bold">{isBlank ? '..............' : formData.certNo}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-bold">Name(s) of the Holder(s):</span>{' '}
                    <span className="font-bold font-sans">
                      {isBlank ? '........................................................................................................................' : formData.memberName}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold w-36">No. of shares held :</span>
                      <span className="flex-1 font-mono font-bold underline px-2">
                        {isBlank ? '________________________________________________' : `${formData.numberOfShares}`}
                      </span>
                      <span className="text-xs italic">(in figures)</span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="w-36"></span>
                      <span className="flex-1 font-sans font-bold uppercase underline px-2">
                        {isBlank ? '________________________________________________' : numberOfSharesInWords}
                      </span>
                      <span className="text-xs italic">(in words)</span>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="font-bold">Distinctive No. (s):</span>
                    <span>
                      From : <span className="font-mono font-bold underline">{isBlank ? '__________' : formData.distinctiveFrom}</span>
                    </span>
                    <span>
                      To : <span className="font-mono font-bold underline">{isBlank ? '__________' : formData.distinctiveTo}</span>
                    </span>
                    <span className="text-xs italic">(Both inclusive)</span>
                  </div>
                </div>

                {/* Execution and Seal Statement */}
                <div className="text-xs sm:text-sm pt-4 leading-relaxed font-serif">
                  Given under the common seal of the Company this{' '}
                  <span className="font-bold underline px-1">{isBlank ? '________' : dayStr}</span> day of{' '}
                  <span className="font-bold underline px-1">{isBlank ? '____________________' : monthStr}</span>,{' '}
                  <span className="font-bold underline px-1">{isBlank ? '__________' : yearStr}</span>.
                </div>

                {/* Signatures Block */}
                <div className="pt-12 grid grid-cols-2 gap-8 text-center text-xs font-sans">
                  <div>
                    <div className="border-b border-slate-950 w-48 mx-auto mb-1">
                      {!isBlank && <span className="text-[10px] text-slate-500">{formData.director1}</span>}
                    </div>
                    <div className="font-bold">Director</div>
                  </div>
                  <div>
                    <div className="border-b border-slate-950 w-48 mx-auto mb-1">
                      {!isBlank && <span className="text-[10px] text-slate-500">{formData.director2}</span>}
                    </div>
                    <div className="font-bold">Director</div>
                  </div>
                </div>

                <div className="pt-8 text-center text-xs font-sans">
                  <div className="border-b border-slate-950 w-72 mx-auto mb-1">
                    {!isBlank && <span className="text-[10px] text-slate-500">{formData.secretary}</span>}
                  </div>
                  <div className="font-bold">Secretary / any other authorized person</div>
                </div>

                {/* Endorsement Transfer Note */}
                <div className="pt-6 border-t border-slate-400 text-[10px] sm:text-xs italic text-slate-800 text-center font-serif">
                  [Note: No transfer of the Share(s) comprised in the Certificate can be registered unless accompanied by this Certificate]
                </div>
              </div>
            ) : (
              /* OVERLEAF SIDE: MEMORANDUM OF TRANSFER OF SHARES */
              <div className="space-y-6">
                <div className="text-center pb-2 border-b-2 border-slate-950">
                  <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider font-sans">
                    MEMORANDUM OF TRANSFER OF SHARES MENTIONED OVERLEAF
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse border border-slate-950 font-serif">
                    <thead>
                      <tr className="bg-slate-100 uppercase font-sans font-bold text-[11px] text-slate-900 border-b border-slate-950">
                        <th className="py-2.5 px-2 border-r border-slate-950 w-24 text-center">DATE</th>
                        <th className="py-2.5 px-2 border-r border-slate-950 w-24 text-center">TRANSFER NO.</th>
                        <th className="py-2.5 px-2 border-r border-slate-950 w-28 text-center">REGISTERED FOLIO</th>
                        <th className="py-2.5 px-2 border-r border-slate-950">NAME(S) OF TRANSFEREE(S)</th>
                        <th className="py-2.5 px-2 w-36 text-center">AUTHORISED SIGNATORY</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Render transfers or blank rows */}
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const tr = !isBlank && formData.transfers && formData.transfers[idx];
                        return (
                          <tr key={idx} className="border-b border-slate-950 h-10">
                            <td className="py-1 px-2 border-r border-slate-950 text-center font-mono">
                              {tr ? tr.date : ''}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-950 text-center font-mono">
                              {tr ? tr.transferNo : ''}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-950 text-center font-mono">
                              {tr ? tr.folio : ''}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-950 font-sans font-semibold">
                              {tr ? tr.transferee : ''}
                            </td>
                            <td className="py-1 px-2 text-center text-[10px] italic text-slate-600">
                              {tr ? tr.signatory : ''}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-slate-600 italic text-center pt-4 font-serif">
                  Statutory Accounting ERP Form Engine · Form SH-1 Compliant under Rule 5(2) Companies (Share Capital &amp; Debentures) Rules, 2014
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
