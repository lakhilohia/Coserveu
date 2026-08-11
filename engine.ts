import { Company, Group, Ledger, StockItem, Voucher } from '../types';

export const fmt = (n: number) =>
  (n < 0 ? '-' : '') +
  '₹' +
  Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const fmtn = (n: number) =>
  n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function itemQty(co: Company, itemId: string): number {
  const it = co.stockItems.find(x => x.id === itemId);
  if (!it) return 0;
  let q = +it.openingQty || 0;
  co.vouchers.forEach(v =>
    (v.inv || []).forEach(r => {
      if (r.item !== itemId) return;
      q += (r.dir === 'in' ? +r.qty : -(+r.qty)) || 0;
    })
  );
  return q;
}

export function itemAvgCost(co: Company, it: StockItem): number {
  let q = +it.openingQty || 0;
  let val = q * (+it.rate || 0);
  co.vouchers.forEach(v =>
    (v.inv || []).forEach(r => {
      if (r.item === it.id && r.dir === 'in') {
        const rq = +r.qty || 0;
        q += rq;
        val += rq * (+r.rate || 0);
      }
    })
  );
  return q > 0 ? val / q : +it.rate || 0;
}

export interface EngineResult {
  grpById: Record<string, Group>;
  ledById: Record<string, Ledger>;
  mv: Record<string, { dr: number; cr: number }>;
  bal: Record<string, { signed: number; dr: number; cr: number; root: Group; obSigned: number }>;
  rootGroup: (g: Group) => Group;
  stockVal: number;
}

export function computeEngine(co: Company, fromDate?: string, toDate?: string): EngineResult {
  const grpById = Object.fromEntries(co.groups.map(g => [g.id, g]));
  const ledById = Object.fromEntries(co.ledgers.map(l => [l.id, l]));

  const rootGroup = (g: Group): Group => {
    let cur = g;
    while (cur.parent && grpById[cur.parent]) {
      cur = grpById[cur.parent];
    }
    return cur;
  };

  const mv: Record<string, { dr: number; cr: number }> = {};
  const preMv: Record<string, { dr: number; cr: number }> = {};
  co.ledgers.forEach(l => {
    mv[l.id] = { dr: 0, cr: 0 };
    preMv[l.id] = { dr: 0, cr: 0 };
  });

  co.vouchers.forEach(v => {
    const vDate = v.date;
    const isBefore = fromDate && vDate < fromDate;
    const isAfter = toDate && vDate > toDate;

    if (isBefore) {
      // Prior voucher before period start -> accumulates into opening balance for the period
      v.entries.forEach(e => {
        if (!preMv[e.led]) preMv[e.led] = { dr: 0, cr: 0 };
        preMv[e.led].dr += +e.dr || 0;
        preMv[e.led].cr += +e.cr || 0;
      });
    } else if (!isAfter) {
      // Voucher falls within period (fromDate <= vDate <= toDate)
      v.entries.forEach(e => {
        if (!mv[e.led]) mv[e.led] = { dr: 0, cr: 0 };
        mv[e.led].dr += +e.dr || 0;
        mv[e.led].cr += +e.cr || 0;
      });
    }
  });

  const bal: Record<string, { signed: number; dr: number; cr: number; root: Group; obSigned: number }> = {};
  co.ledgers.forEach(l => {
    const g = grpById[l.grp];
    if (!g) return;
    const initialOb = (+l.ob || 0) * (l.obt === 'Dr' ? 1 : -1);
    const priorNet = (preMv[l.id]?.dr || 0) - (preMv[l.id]?.cr || 0);
    const obSigned = initialOb + priorNet;
    const periodNet = mv[l.id].dr - mv[l.id].cr;
    const signed = obSigned + periodNet;
    bal[l.id] = {
      signed,
      dr: signed > 0 ? signed : 0,
      cr: signed < 0 ? -signed : 0,
      root: rootGroup(g),
      obSigned,
    };
  });

  const stockVal = co.stockItems.reduce((s, it) => {
    const q = itemQty(co, it.id);
    return s + q * itemAvgCost(co, it);
  }, 0);

  return { grpById, ledById, mv, bal, rootGroup, stockVal };
}

export function computePL(co: Company, eng: EngineResult) {
  const isGroupType = (l: Ledger, targetGroupIds: string[]) => {
    if (targetGroupIds.includes(l.grp)) return true;
    const rootId = eng.bal[l.id]?.root?.id;
    if (rootId && targetGroupIds.includes(rootId)) return true;
    let parent = eng.grpById[l.grp]?.parent;
    while (parent) {
      if (targetGroupIds.includes(parent)) return true;
      parent = eng.grpById[parent]?.parent;
    }
    return false;
  };

  const getNetIncome = (groupIds: string[]) =>
    co.ledgers
      .filter(l => isGroupType(l, groupIds))
      .reduce((s, l) => {
        const b = eng.bal[l.id];
        if (!b) return s;
        // Credit balance means cr > dr, so signed is negative.
        // For Income, Cr balance is positive income -> -signed.
        return s + (-b.signed);
      }, 0);

  const getNetExpense = (groupIds: string[]) =>
    co.ledgers
      .filter(l => isGroupType(l, groupIds))
      .reduce((s, l) => {
        const b = eng.bal[l.id];
        if (!b) return s;
        // Debit balance means dr > cr, so signed is positive.
        // For Expense, Dr balance is positive expense -> +signed.
        return s + b.signed;
      }, 0);

  const sales = getNetIncome(['g_sales']);
  const directInc = getNetIncome(['g_di']);
  const purchase = getNetExpense(['g_pur']);
  const directExp = getNetExpense(['g_de']);
  const closingStock = eng.stockVal || 0;
  const grossProfit = sales + directInc + closingStock - (purchase + directExp);
  const indInc = getNetIncome(['g_ii']);
  const indExp = getNetExpense(['g_ie']);
  const netProfit = grossProfit + indInc - indExp;

  return { sales, directInc, purchase, directExp, closingStock, grossProfit, indInc, indExp, netProfit };
}

export const STATE_CODE_MAP: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

export interface GSTR1Mismatch {
  code: 'invalidGstin' | 'missingInvNo' | 'missingHsn' | 'taxMismatch' | 'missingPos';
  category: string;
  reason: string;
}

export interface GSTR1ParsedVoucher {
  voucher: Voucher;
  invoiceNo: string;
  date: string;
  partyName: string;
  gstin: string;
  isRegistered: boolean;
  stateCode: string;
  stateName: string;
  isInterstate: boolean;
  isExport: boolean;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  invoiceTotal: number;
  taxRate: number; // 0, 5, 12, 18, 28
  mismatches: GSTR1Mismatch[];
}

export interface GSTR1StateRateGroup {
  key: string;
  stateName: string;
  taxRate: number;
  vchCount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  invoiceTotal: number;
  vouchers: GSTR1ParsedVoucher[];
}

export interface GSTR1SummaryHead {
  vouchers: GSTR1ParsedVoucher[];
  vchCount: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  taxTotal: number;
  invoiceTotal: number;
  stateRateBreakdown: GSTR1StateRateGroup[];
}

/**
 * Filter GSTR-1 Outward Sales & Credit/Debit Notes from Vouchers & Day Book
 * Categorizes into B2B, B2C Large, B2C Small, Exports, Credit/Debit Notes Reg, Credit/Debit Notes Unreg,
 * calculates totals, state-rate breakdowns, and identifies uncertain transactions with detailed mismatches.
 */
export function getGSTR1OutwardSales(co: Company) {
  const coGstin = (co.gstin || '18ABDPY3955G1Z7').trim().toUpperCase();
  const coStateCode = coGstin.slice(0, 2) || '18';

  const relevantVouchers = co.vouchers.filter(v => {
    if (['Sales', 'Credit Note', 'Debit Note'].includes(v.type)) return true;
    // Check if voucher contains sales or output tax ledger entries
    return v.entries.some(e => {
      const led = co.ledgers.find(l => l.id === e.led);
      if (!led) return false;
      return (
        led.grp === 'g_sales' ||
        e.led === 'l_cgst' ||
        e.led === 'l_sgst' ||
        led.name.toLowerCase().includes('cgst') ||
        led.name.toLowerCase().includes('sgst') ||
        led.name.toLowerCase().includes('igst')
      );
    });
  });

  const parsedList: GSTR1ParsedVoucher[] = relevantVouchers.map(v => {
    // Determine party ledger & GSTIN
    let partyLedger = co.ledgers.find(
      l =>
        l.name === v.partyName ||
        ['g_deb', 'g_cred', 'g_cash', 'g_bank'].includes(l.grp) && v.entries.some(e => e.led === l.id)
    );
    if (!partyLedger) {
      const entryLed = v.entries.find(e => {
        const l = co.ledgers.find(x => x.id === e.led);
        return l && ['g_deb', 'g_cred', 'g_cash', 'g_bank'].includes(l.grp);
      });
      if (entryLed) {
        partyLedger = co.ledgers.find(l => l.id === entryLed.led);
      }
    }

    const partyName = v.partyName || partyLedger?.name || 'Retail Cash Customer';
    let rawGstin = (partyLedger?.gstin || '').trim().toUpperCase();
    
    // Check if gstin is present in entries or party name
    if (!rawGstin && v.isB2B) {
      rawGstin = '';
    }

    const isRegistered = rawGstin.length === 15;
    const partyStateCode = isRegistered ? rawGstin.slice(0, 2) : coStateCode;
    const stateName = STATE_CODE_MAP[partyStateCode] || 'Assam';
    const isInterstate = partyStateCode !== coStateCode;

    const isExport =
      v.type === 'Export' ||
      (v.narration || '').toLowerCase().includes('export') ||
      partyName.toLowerCase().includes('export') ||
      partyName.toLowerCase().includes('sez');

    // Calculate amounts
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let cess = 0;

    const isCreditNote = v.type === 'Credit Note';

    v.entries.forEach(e => {
      const led = co.ledgers.find(l => l.id === e.led);
      if (!led) return;
      const val = isCreditNote ? (+e.dr || 0) - (+e.cr || 0) : (+e.cr || 0) - (+e.dr || 0);

      if (led.grp === 'g_sales' || led.grp === 'g_di' || led.grp === 'g_ii') {
        taxable += Math.max(0, val);
      } else if (e.led === 'l_cgst' || led.name.toLowerCase().includes('cgst')) {
        cgst += Math.max(0, val);
      } else if (e.led === 'l_sgst' || led.name.toLowerCase().includes('sgst')) {
        sgst += Math.max(0, val);
      } else if (led.name.toLowerCase().includes('igst')) {
        igst += Math.max(0, val);
      } else if (led.name.toLowerCase().includes('cess')) {
        cess += Math.max(0, val);
      }
    });

    // If inventory items present, verify taxable from item lines
    if (taxable === 0 && v.inv && v.inv.length > 0) {
      taxable = v.inv.reduce((s, r) => s + (+r.qty || 0) * (+r.rate || 0), 0);
    }

    const totalDr = v.entries.reduce((s, e) => s + (+e.dr || 0), 0);
    const totalCr = v.entries.reduce((s, e) => s + (+e.cr || 0), 0);
    const invoiceTotal = Math.max(totalDr, totalCr, taxable + cgst + sgst + igst + cess);

    if (taxable === 0 && invoiceTotal > 0) {
      taxable = Math.max(0, invoiceTotal - (cgst + sgst + igst + cess));
    }

    const taxTotal = cgst + sgst + igst + cess;

    // Determine tax rate percentage
    let computedRate = taxable > 0 ? (taxTotal / taxable) * 100 : 0;
    let taxRate = 0;
    if (computedRate > 23) taxRate = 28;
    else if (computedRate > 15) taxRate = 18;
    else if (computedRate > 8) taxRate = 12;
    else if (computedRate > 2) taxRate = 5;
    else taxRate = 0;

    // Mismatch / Exception checks
    const mismatches: GSTR1Mismatch[] = [];

    // 1. Invalid or missing GSTIN for B2B or registered party
    if ((v.isB2B || partyName.toLowerCase().includes('pvt') || partyName.toLowerCase().includes('ltd')) && !isRegistered) {
      mismatches.push({
        code: 'invalidGstin',
        category: 'Invalid or Missing Information',
        reason: 'GST Registration Details of the Party are invalid or not specified',
      });
    }

    // 2. Missing invoice number or voucher number
    if (!v.invoiceNo && !v.no) {
      mismatches.push({
        code: 'missingInvNo',
        category: 'Invalid or Missing Information',
        reason: 'Invoice Number or Voucher Number is missing',
      });
    }

    // 3. Missing HSN / SAC details
    if (v.inv && v.inv.length > 0) {
      const missingItemHsn = v.inv.some(r => {
        const item = co.stockItems.find(x => x.id === r.item);
        return !item || !item.hsn || item.hsn.trim() === '';
      });
      if (missingItemHsn) {
        mismatches.push({
          code: 'missingHsn',
          category: 'Invalid or Missing Information',
          reason: 'HSN/SAC details of stock items are missing or invalid',
        });
      }
    }

    // 4. Tax Rate / Amount mismatch
    if (!isInterstate && (cgst > 0 || sgst > 0)) {
      if (Math.abs(cgst - sgst) > 1) {
        mismatches.push({
          code: 'taxMismatch',
          category: 'Tax Rate / Amount Mismatch',
          reason: 'CGST and SGST/UTGST amounts are not equal for intra-state supply',
        });
      }
      if (igst > 0) {
        mismatches.push({
          code: 'taxMismatch',
          category: 'Tax Rate / Amount Mismatch',
          reason: 'IGST is charged on intra-state supply alongside CGST/SGST',
        });
      }
    } else if (isInterstate && (cgst > 0 || sgst > 0)) {
      mismatches.push({
        code: 'taxMismatch',
        category: 'Tax Rate / Amount Mismatch',
        reason: 'CGST/SGST charged on inter-state supply (Should be IGST)',
      });
    }

    // 5. Missing Place of Supply
    if (isInterstate && !STATE_CODE_MAP[partyStateCode]) {
      mismatches.push({
        code: 'missingPos',
        category: 'Invalid or Missing Information',
        reason: 'Place of Supply details are missing or invalid for inter-state supply',
      });
    }

    return {
      voucher: v,
      invoiceNo: v.invoiceNo || v.no || 'VCH-NEW',
      date: v.date,
      partyName,
      gstin: rawGstin,
      isRegistered,
      stateCode: partyStateCode,
      stateName,
      isInterstate,
      isExport,
      taxable,
      cgst,
      sgst,
      igst,
      cess,
      taxTotal,
      invoiceTotal,
      taxRate,
      mismatches,
    };
  });

  // Function to build a summary head object with state-rate breakdown
  const createHeadSummary = (items: GSTR1ParsedVoucher[]): GSTR1SummaryHead => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let cess = 0;
    let taxTotal = 0;
    let invoiceTotal = 0;

    const groupMap: Record<string, GSTR1StateRateGroup> = {};

    items.forEach(p => {
      taxable += p.taxable;
      cgst += p.cgst;
      sgst += p.sgst;
      igst += p.igst;
      cess += p.cess;
      taxTotal += p.taxTotal;
      invoiceTotal += p.invoiceTotal;

      const key = `${p.stateName} - ${p.taxRate}%`;
      if (!groupMap[key]) {
        groupMap[key] = {
          key,
          stateName: p.stateName,
          taxRate: p.taxRate,
          vchCount: 0,
          taxable: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          cess: 0,
          taxTotal: 0,
          invoiceTotal: 0,
          vouchers: [],
        };
      }
      groupMap[key].vchCount += 1;
      groupMap[key].taxable += p.taxable;
      groupMap[key].cgst += p.cgst;
      groupMap[key].sgst += p.sgst;
      groupMap[key].igst += p.igst;
      groupMap[key].cess += p.cess;
      groupMap[key].taxTotal += p.taxTotal;
      groupMap[key].invoiceTotal += p.invoiceTotal;
      groupMap[key].vouchers.push(p);
    });

    return {
      vouchers: items,
      vchCount: items.length,
      taxable,
      cgst,
      sgst,
      igst,
      cess,
      taxTotal,
      invoiceTotal,
      stateRateBreakdown: Object.values(groupMap),
    };
  };

  // Categorize parsed vouchers into GSTR-1 Heads
  const b2bList: GSTR1ParsedVoucher[] = [];
  const b2cLargeList: GSTR1ParsedVoucher[] = [];
  const b2cSmallList: GSTR1ParsedVoucher[] = [];
  const exportsList: GSTR1ParsedVoucher[] = [];
  const cdnrList: GSTR1ParsedVoucher[] = [];
  const cdnurList: GSTR1ParsedVoucher[] = [];
  const nilRatedList: GSTR1ParsedVoucher[] = [];
  const uncertainList: GSTR1ParsedVoucher[] = [];

  parsedList.forEach(p => {
    if (p.mismatches.length > 0) {
      uncertainList.push(p);
    }

    const vtype = p.voucher.type;
    if (vtype === 'Credit Note' || vtype === 'Debit Note') {
      if (p.isRegistered) cdnrList.push(p);
      else cdnurList.push(p);
    } else {
      // Sales
      if (p.isExport) {
        exportsList.push(p);
      } else if (p.isRegistered) {
        b2bList.push(p);
      } else {
        // Unregistered
        if (p.taxRate === 0 && p.taxTotal === 0) {
          nilRatedList.push(p);
        } else if (p.isInterstate && p.invoiceTotal > 250000) {
          b2cLargeList.push(p);
        } else {
          b2cSmallList.push(p);
        }
      }
    }
  });

  // Build HSN Summary
  const hsnMap: Record<
    string,
    {
      hsn: string;
      desc: string;
      uqc: string;
      qty: number;
      totalVal: number;
      taxable: number;
      igst: number;
      cgst: number;
      sgst: number;
      taxTotal: number;
    }
  > = {};

  relevantVouchers.forEach(v => {
    (v.inv || []).forEach(r => {
      const it = co.stockItems.find(x => x.id === r.item);
      const hsnKey = it?.hsn || 'General';
      if (!hsnMap[hsnKey]) {
        hsnMap[hsnKey] = {
          hsn: hsnKey,
          desc: it?.name || 'Goods / Services',
          uqc: it?.unit || 'Nos',
          qty: 0,
          totalVal: 0,
          taxable: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          taxTotal: 0,
        };
      }
      const val = (+r.qty || 0) * (+r.rate || 0);
      const gstPct = it?.gst || 5;
      const tax = (val * gstPct) / 100;
      hsnMap[hsnKey].qty += +r.qty || 0;
      hsnMap[hsnKey].totalVal += val + tax;
      hsnMap[hsnKey].taxable += val;
      hsnMap[hsnKey].cgst += tax / 2;
      hsnMap[hsnKey].sgst += tax / 2;
      hsnMap[hsnKey].taxTotal += tax;
    });
  });

  const b2bHead = createHeadSummary(b2bList);
  const b2cLargeHead = createHeadSummary(b2cLargeList);
  const b2cSmallHead = createHeadSummary(b2cSmallList);
  const exportsHead = createHeadSummary(exportsList);
  const cdnrHead = createHeadSummary(cdnrList);
  const cdnurHead = createHeadSummary(cdnurList);
  const nilRatedHead = createHeadSummary(nilRatedList);

  return {
    allParsed: parsedList,
    b2b: b2bHead,
    b2cLarge: b2cLargeHead,
    b2cSmall: b2cSmallHead,
    exports: exportsHead,
    cdnr: cdnrHead,
    cdnur: cdnurHead,
    nilRated: nilRatedHead,
    uncertainList,
    hsnSummary: Object.values(hsnMap),
    // Backward compatibility helpers
    b2bVouchers: b2bList.map(p => p.voucher),
    b2cVouchers: b2cSmallList.concat(b2cLargeList).map(p => p.voucher),
    b2bTotals: {
      taxable: b2bHead.taxable,
      cgst: b2bHead.cgst,
      sgst: b2bHead.sgst,
      igst: b2bHead.igst,
      total: b2bHead.invoiceTotal,
    },
    b2cTotals: {
      taxable: b2cSmallHead.taxable + b2cLargeHead.taxable,
      cgst: b2cSmallHead.cgst + b2cLargeHead.cgst,
      sgst: b2cSmallHead.sgst + b2cLargeHead.sgst,
      igst: b2cSmallHead.igst + b2cLargeHead.igst,
      total: b2cSmallHead.invoiceTotal + b2cLargeHead.invoiceTotal,
    },
  };
}

export function calculateTDSRequirement(amount: number, section: string, vendorType: string = 'company') {
  switch (section) {
    case '194Q': // Purchase of goods > 50L
      if (amount > 5000000) {
        return { applies: true, threshold: 5000000, rate: 0.1, tds: (amount - 5000000) * 0.001 };
      }
      break;
    case '194H': // Brokerage/Commission > 15k
      if (amount > 15000) {
        return { applies: true, threshold: 15000, rate: 5, tds: amount * 0.05 };
      }
      break;
    case '194C': // Contractor (Single 30k / Aggregate 1L)
      if (amount > 30000) {
        const rate = vendorType === 'individual' ? 1 : 2;
        return { applies: true, threshold: 30000, rate, tds: amount * (rate / 100) };
      }
      break;
    case '194I': // Rent > 2.4L
      if (amount > 240000) {
        return { applies: true, threshold: 240000, rate: 10, tds: amount * 0.1 };
      }
      break;
    case '194J': // Professional fees > 30k
      if (amount > 30000) {
        return { applies: true, threshold: 30000, rate: 10, tds: amount * 0.1 };
      }
      break;
    case '192': // Salary > 50k monthly (6L annual threshold)
      if (amount > 50000) {
        return { applies: true, threshold: 50000, rate: 10, tds: (amount - 50000) * 0.1 };
      }
      break;
    case '194A': // Interest on securities / loans > 5k / 40k
      if (amount > 5000) {
        return { applies: true, threshold: 5000, rate: 10, tds: amount * 0.1 };
      }
      break;
  }
  return { applies: false, threshold: 0, rate: 0, tds: 0 };
}
