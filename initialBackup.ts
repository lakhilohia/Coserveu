import { AppDatabase } from '../types';

export const INITIAL_BACKUP: any = {
  "companies": [
    {
      "id": "ki7u81jr",
      "name": "Zilikoni Asomi Mahila Farmers Producer Company Limited",
      "gstin": "18AACCZ3817H1Z5",
      "pan": "AACCZ3817H",
      "fyStart": "2026-04-01",
      "fyEnd": "2027-03-31",
      "address": "C/O Pranjit Das, Borbori, Vill.-Kahara, P.O.- Sarupeta, Bhawanipur, Bajali (Assam) - 781318",
      "memberRevenue80P": true,
      "meta": {
        "district": "Bajali",
        "block": "Bhawanipur",
        "ceo": "Safiur Rahman",
        "ceoMob": "8638000264",
        "ceoEmail": "safiurrhmn@gmail.com",
        "acc": "Mayuri Talukdar",
        "accMob": "9678905277",
        "accEmail": "mayuritalukdar322@gmail.com"
      },
      "groups": [
        { "id": "g_cap", "name": "Capital Account", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_loan", "name": "Loans (Liability)", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_cl", "name": "Current Liabilities", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_dt", "name": "Duties & Taxes", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_cred", "name": "Sundry Creditors", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_prov", "name": "Provisions", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_fa", "name": "Fixed Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_inv", "name": "Investments", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_ca", "name": "Current Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_bank", "name": "Bank Accounts", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_cash", "name": "Cash-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_deb", "name": "Sundry Debtors", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_stk", "name": "Stock-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_la", "name": "Loans & Advances (Asset)", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_sales", "name": "Sales Accounts", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_pur", "name": "Purchase Accounts", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_di", "name": "Direct Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_de", "name": "Direct Expenses", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_ii", "name": "Indirect Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_ie", "name": "Indirect Expenses", "nat": "E", "dr": true, "side": "PL" }
      ],
      "ledgers": [
        { "id": "l_cash", "name": "Cash", "grp": "g_cash", "ob": 0, "obt": "Dr" },
        { "id": "l_capital", "name": "Share Capital", "grp": "g_cap", "ob": 0, "obt": "Cr" },
        { "id": "l_cgst", "name": "Output CGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_sgst", "name": "Output SGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_icgst", "name": "Input CGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_isgst", "name": "Input SGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_sale", "name": "Sales - Agri Produce", "grp": "g_sales", "ob": 0, "obt": "Cr" },
        { "id": "l_purchase", "name": "Purchases", "grp": "g_pur", "ob": 0, "obt": "Dr" },
        { "id": "l_round", "name": "Rounding Off", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "vu0p6mlo", "name": "Bhawaniput Book Mart", "grp": "g_cred", "ob": 0, "obt": "Cr" },
        { "id": "b0z24qm8", "name": "AGBP Bank Account", "grp": "g_bank", "ob": 0, "obt": "Dr" },
        { "id": "njmu6l89", "name": "Legal service for Rent Agreement and Gst Affidavit", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "i3l14pwf", "name": "Jublee Enterprise Mela Digital Sticker and Banner", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "qh9gaksd", "name": "Jublee Enteprise", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "8u56vuf7", "name": "Asha Restuarant", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "9rjgqwxm", "name": "a", "grp": "g_cl", "ob": 0, "obt": "Cr" },
        { "id": "rgsnprlq", "name": "Bhawanipur Book  Stall", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "b9mz8irq", "name": "Transportation charges during mobilisation", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "zqppnsgv", "name": "Assam Tribune Advertisement Exp", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "jkvl7a6g", "name": "Saroli CLF Chauliabori", "grp": "g_cl", "ob": 0, "obt": "Cr" },
        { "id": "0kxio8zn", "name": "Chinaki Restuarant restuarant exp", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "j1vfh5rn", "name": "Purchase of Gamusha fir Guest facilitation", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "w7p6k9on", "name": "Rent Exp", "grp": "g_ie", "ob": 0, "obt": "Dr" }
      ],
      "vouchers": [
        {
          "id": "y69l7grp",
          "type": "Payment",
          "no": "PA-0017",
          "date": "2025-09-04",
          "narration": "Per Month Rs. 2000 6 month Rs. 12000, Owner Name Gautam Das",
          "entries": [
            { "led": "w7p6k9on", "dr": "12000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "12000" }
          ],
          "inv": [],
          "justify": "test",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:30:21.222Z"
        },
        {
          "id": "4dzno17a",
          "type": "Payment",
          "no": "PA-0016",
          "date": "2025-08-02",
          "narration": "Surabhi Das",
          "entries": [
            { "led": "j1vfh5rn", "dr": "1000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1000" }
          ],
          "inv": [],
          "justify": "test",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:28:28.413Z"
        },
        {
          "id": "c7zciq3y",
          "type": "Payment",
          "no": "PA-0015",
          "date": "2025-09-03",
          "narration": "",
          "entries": [
            { "led": "0kxio8zn", "dr": "500", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "500" }
          ],
          "inv": [],
          "justify": "test",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:11:58.286Z"
        },
        {
          "id": "ehaa7p33",
          "type": "Payment",
          "no": "PA-0014",
          "date": "2025-09-04",
          "narration": "Pranjal Kalita ",
          "entries": [
            { "led": "b9mz8irq", "dr": "1300", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1300" }
          ],
          "inv": [],
          "justify": "late",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:09:06.344Z"
        },
        {
          "id": "sr0srlhf",
          "type": "Payment",
          "no": "PA-0013",
          "date": "2025-07-18",
          "narration": "21-11-24 loan taken 1 Lakh with interest 108000 paid ",
          "entries": [
            { "led": "jkvl7a6g", "dr": "108000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "108000" }
          ],
          "inv": [],
          "justify": "late ",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:04:25.178Z"
        },
        {
          "id": "3ivyb1n0",
          "type": "Payment",
          "no": "PA-0012",
          "date": "2025-07-10",
          "narration": "THE ASSAM TRIBUNE",
          "entries": [
            { "led": "zqppnsgv", "dr": "8375", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "8375" }
          ],
          "inv": [],
          "justify": "TESTING",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T12:00:02.563Z"
        },
        {
          "id": "qrix822j",
          "type": "Purchase",
          "no": "PU-0003",
          "date": "2025-08-26",
          "narration": "Banalata deb",
          "entries": [
            { "led": "l_purchase", "dr": "38250", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "38250" }
          ],
          "inv": [
            { "item": "8g93ofca", "qty": "1750", "rate": "21", "dir": "in" }
          ],
          "justify": "testing",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:57:13.117Z"
        },
        {
          "id": "t70o3rpx",
          "type": "Purchase",
          "no": "PU-0002",
          "date": "2025-08-26",
          "narration": "",
          "entries": [
            { "led": "l_purchase", "dr": "34000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "34000" }
          ],
          "inv": [
            { "item": "8g93ofca", "qty": "1560", "rate": "21", "dir": "in" }
          ],
          "justify": "testing",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:54:50.443Z"
        },
        {
          "id": "n1py8jsb",
          "type": "Purchase",
          "no": "PU-0001",
          "date": "2025-08-26",
          "narration": "",
          "entries": [
            { "led": "l_purchase", "dr": "29750", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "29750" }
          ],
          "inv": [
            { "item": "8g93ofca", "qty": "1370", "rate": "21", "dir": "in" }
          ],
          "justify": "testing",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:49:29.147Z"
        },
        {
          "id": "eeqfjsjv",
          "type": "Payment",
          "no": "PA-0011",
          "date": "2025-05-18",
          "narration": "printing",
          "entries": [
            { "led": "rgsnprlq", "dr": "700", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "700" }
          ],
          "inv": [],
          "justify": "late ",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:39:42.801Z"
        },
        {
          "id": "nf0v9lr7",
          "type": "Payment",
          "no": "PA-0010",
          "date": "2026-07-31",
          "narration": "",
          "entries": [
            { "led": "8u56vuf7", "dr": "2250", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "2250" }
          ],
          "inv": [],
          "justify": "",
          "backdated": false,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:35:49.218Z"
        },
        {
          "id": "mfikkdf6",
          "type": "Payment",
          "no": "PA-0009",
          "date": "2025-07-31",
          "narration": "restuarant bill",
          "entries": [
            { "led": "8u56vuf7", "dr": "1000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1000" }
          ],
          "inv": [],
          "justify": "testing ",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:34:39.153Z"
        },
        {
          "id": "z2psxp3v",
          "type": "Payment",
          "no": "PA-0008",
          "date": "2025-07-31",
          "narration": "",
          "entries": [
            { "led": "8u56vuf7", "dr": "1600", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1600" }
          ],
          "inv": [],
          "justify": "test",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:28:42.999Z"
        },
        {
          "id": "rnm2xzqa",
          "type": "Sales",
          "no": "SA-0001",
          "date": "2025-06-30",
          "narration": "Rinkul Patgiri address Karubha hai Contacf No. 7002437824 ko becha hu ",
          "entries": [
            { "led": "b0z24qm8", "dr": "220500", "cr": "" },
            { "led": "l_sale", "dr": "", "cr": "220500" }
          ],
          "inv": [
            { "item": "q4iqru15", "qty": "3621.9", "rate": "60.88", "dir": "out" }
          ],
          "justify": "late ho gya ",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:25:52.834Z"
        },
        {
          "id": "8sinv2j8",
          "type": "Payment",
          "no": "PA-0007",
          "date": "2025-05-31",
          "narration": "",
          "entries": [
            { "led": "8u56vuf7", "dr": "1295", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1295" }
          ],
          "inv": [],
          "justify": "testing",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:16:30.443Z"
        },
        {
          "id": "lr2rw5qw",
          "type": "Payment",
          "no": "PA-0006",
          "date": "2025-03-31",
          "narration": "Kalakan,lalmohan,singra,mithai,biscuit,namkeen",
          "entries": [
            { "led": "8u56vuf7", "dr": "840", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "840" }
          ],
          "inv": [],
          "justify": "late hogya ",
          "backdated": true,
          "createdBy": "zilikoni",
          "createdAt": "2026-07-29T11:12:57.631Z"
        },
        {
          "id": "gz90ckrb",
          "type": "Payment",
          "no": "PA-0005",
          "date": "2025-05-31",
          "narration": "Payment made to Asha Bandhu Store for printing/photocopy services",
          "entries": [
            { "led": "8u56vuf7", "dr": "1000", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1000" }
          ],
          "inv": [],
          "justify": "late entry ",
          "backdated": true,
          "createdBy": "domainexpert",
          "createdAt": "2026-07-29T10:48:11.673Z"
        },
        {
          "id": "b1g1gp4j",
          "type": "Payment",
          "no": "PA-0004",
          "date": "2025-05-26",
          "narration": "Payment made to Jublee Enterprise for flex banner and iron frame",
          "entries": [
            { "led": "qh9gaksd", "dr": "3200", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "3200" }
          ],
          "inv": [],
          "justify": "testing ",
          "backdated": true,
          "createdBy": "domainexpert",
          "createdAt": "2026-07-29T10:38:47.611Z"
        },
        {
          "id": "n3zkjghg",
          "type": "Payment",
          "no": "PA-0003",
          "date": "2025-04-24",
          "narration": "Digital Sticker and Banner ",
          "entries": [
            { "led": "i3l14pwf", "dr": "1500", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "1500" }
          ],
          "inv": [],
          "justify": "late ho gya ",
          "backdated": true,
          "createdBy": "domainexpert",
          "createdAt": "2026-07-29T10:22:23.454Z"
        },
        {
          "id": "oqa7crjg",
          "type": "Payment",
          "no": "PA-0002",
          "date": "2025-03-20",
          "narration": "Professional legal fees paid to Adv. Kulajit Kalita",
          "entries": [
            { "led": "njmu6l89", "dr": "1500", "cr": "" },
            { "led": "njmu6l89", "dr": "800", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "2300" }
          ],
          "inv": [],
          "justify": "late ho gya sry for that ",
          "backdated": true,
          "createdBy": "domainexpert",
          "createdAt": "2026-07-29T10:18:24.060Z"
        },
        {
          "id": "syaozgm9",
          "type": "Payment",
          "no": "PA-0001",
          "date": "2025-05-20",
          "narration": "Purchase of Registers, Files, Cash Book from Bhawanipur Book Mart",
          "entries": [
            { "led": "vu0p6mlo", "dr": "980", "cr": "" },
            { "led": "b0z24qm8", "dr": "", "cr": "980" }
          ],
          "inv": [],
          "justify": "testing",
          "backdated": true,
          "createdBy": "domainexpert",
          "createdAt": "2026-07-29T10:14:07.498Z"
        }
      ],
      "stockItems": [
        {
          "id": "q4iqru15",
          "name": "Mustard Seeds",
          "unit": "Kg",
          "hsn": "120750",
          "gst": 0,
          "openingQty": 0,
          "rate": 0,
          "batch": "",
          "expiry": "",
          "reorder": 50,
          "godown": "gd_main",
          "stockGroup": "pd46cfk1"
        },
        {
          "id": "8g93ofca",
          "name": "Paddy",
          "unit": "Kg",
          "hsn": "1006",
          "gst": 0,
          "openingQty": 0,
          "rate": 0,
          "batch": "",
          "expiry": "",
          "reorder": 100,
          "godown": "gd_main",
          "stockGroup": "pd46cfk1"
        }
      ],
      "stockGroups": [
        { "id": "pd46cfk1", "name": "Exempt" },
        { "id": "bv69fnx9", "name": "Taxable " }
      ],
      "stockCategories": [],
      "units": [
        { "id": "u_nos", "symbol": "Nos", "name": "Numbers" },
        { "id": "u_kg", "symbol": "Kg", "name": "Kilograms" },
        { "id": "u_qtl", "symbol": "Qtl", "name": "Quintal" },
        { "id": "u_ltr", "symbol": "Ltr", "name": "Litre" },
        { "id": "u_bag", "symbol": "Bag", "name": "Bag" },
        { "id": "u_pcs", "symbol": "Pcs", "name": "Pieces" }
      ],
      "voucherTypes": [],
      "godowns": [{ "id": "gd_main", "name": "Central Processing Centre" }],
      "assets": [],
      "users": [
        { "id": "u_admin", "name": "admin", "role": "Admin", "pass": "admin" },
        { "id": "u_expert", "name": "domainexpert", "role": "Domain Expert", "pass": "Lohia@2026" },
        { "id": "u_ceo", "name": "ceo", "role": "Admin", "pass": "ceo123" },
        { "id": "u_acc", "name": "accountant", "role": "Accountant", "pass": "acc123" },
        { "id": "u_ca", "name": "ca", "role": "CA", "pass": "ca123" },
        { "id": "ycf2ni2b", "name": "zilikoni", "role": "Admin", "pass": "fpc1234" }
      ],
      "audit": [],
      "createdAt": "2026-07-29T09:24:44.562Z"
    },
    {
      "id": "c9in2sj0",
      "name": "Trila Asomi Mahila Farmers Producer Company Limited",
      "gstin": "",
      "pan": "",
      "fyStart": "2026-04-01",
      "fyEnd": "2027-03-31",
      "address": "",
      "memberRevenue80P": true,
      "meta": {
        "district": "Bongaigaon",
        "block": "Srijangram",
        "ceo": "Jahidul Hussain",
        "ceoMob": "7002876211",
        "ceoEmail": "jahidulhussain021015@gmail.com",
        "acc": "Ariful Hasan",
        "accMob": "8822411563",
        "accEmail": "arifulhasan802@gmail.com"
      },
      "groups": [
        { "id": "g_cap", "name": "Capital Account", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_loan", "name": "Loans (Liability)", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_cl", "name": "Current Liabilities", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_dt", "name": "Duties & Taxes", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_cred", "name": "Sundry Creditors", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_prov", "name": "Provisions", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_fa", "name": "Fixed Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_inv", "name": "Investments", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_ca", "name": "Current Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_bank", "name": "Bank Accounts", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_cash", "name": "Cash-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_deb", "name": "Sundry Debtors", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_stk", "name": "Stock-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_la", "name": "Loans & Advances (Asset)", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_sales", "name": "Sales Accounts", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_pur", "name": "Purchase Accounts", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_di", "name": "Direct Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_de", "name": "Direct Expenses", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_ii", "name": "Indirect Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_ie", "name": "Indirect Expenses", "nat": "E", "dr": true, "side": "PL" }
      ],
      "ledgers": [
        { "id": "l_cash", "name": "Cash", "grp": "g_cash", "ob": 0, "obt": "Dr" },
        { "id": "l_capital", "name": "Share Capital", "grp": "g_cap", "ob": 0, "obt": "Cr" },
        { "id": "l_cgst", "name": "Output CGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_sgst", "name": "Output SGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_icgst", "name": "Input CGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_isgst", "name": "Input SGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_sale", "name": "Sales - Agri Produce", "grp": "g_sales", "ob": 0, "obt": "Cr" },
        { "id": "l_purchase", "name": "Purchases", "grp": "g_pur", "ob": 0, "obt": "Dr" },
        { "id": "l_round", "name": "Rounding Off", "grp": "g_ie", "ob": 0, "obt": "Dr" },
        { "id": "jy11pxj6", "name": "Bank Account", "grp": "g_ca", "ob": 0, "obt": "Dr" }
      ],
      "vouchers": [
        {
          "id": "jzcvd1nt",
          "type": "Sales",
          "no": "SA-0001",
          "date": "2025-07-14",
          "narration": "",
          "entries": [
            { "led": "jy11pxj6", "dr": "198200", "cr": "" },
            { "led": "l_sale", "dr": "", "cr": "198200" }
          ],
          "inv": [
            { "item": "w5id41t8", "qty": "94.38", "rate": "2100.02", "dir": "out" }
          ],
          "justify": "TESTING ",
          "backdated": true,
          "createdBy": "trila",
          "createdAt": "2026-07-29T09:44:12.119Z"
        },
        {
          "id": "wt60788k",
          "type": "Purchase",
          "no": "PU-0002",
          "date": "2025-05-08",
          "narration": "",
          "entries": [
            { "led": "l_purchase", "dr": "202000", "cr": "" },
            { "led": "jy11pxj6", "dr": "", "cr": "202000" }
          ],
          "inv": [
            { "item": "w5id41t8", "qty": "100", "rate": "2020", "dir": "in" }
          ],
          "justify": "testing ",
          "backdated": true,
          "createdBy": "trila",
          "createdAt": "2026-07-29T09:38:00.166Z"
        },
        {
          "id": "jjctroqr",
          "type": "Purchase",
          "no": "PU-0001",
          "date": "2025-05-08",
          "narration": "",
          "entries": [
            { "led": "l_purchase", "dr": "202000", "cr": "" },
            { "led": "jy11pxj6", "dr": "", "cr": "202000" }
          ],
          "inv": [],
          "justify": "testing",
          "backdated": true,
          "createdBy": "trila",
          "createdAt": "2026-07-29T09:27:00.333Z"
        }
      ],
      "stockItems": [
        { "id": "w5id41t8", "name": "Maize", "unit": "Qtl", "hsn": "1005", "gst": 0, "openingQty": 0, "rate": 0, "batch": "", "expiry": "", "reorder": 0, "godown": "gd_main", "stockGroup": "7ieh5afx" },
        { "id": "19rvewby", "name": "Joha Rice", "unit": "Kg", "hsn": "1006", "gst": 0, "openingQty": 0, "rate": 0, "batch": "", "expiry": "", "reorder": 0, "godown": "gd_main", "stockGroup": "7ieh5afx" },
        { "id": "em73lsjt", "name": "Bora Rice ", "unit": "Kg", "hsn": "1006", "gst": 0, "openingQty": 0, "rate": 0, "batch": "", "expiry": "", "reorder": 0, "godown": "gd_main", "stockGroup": "7ieh5afx" }
      ],
      "stockGroups": [
        { "id": "7ieh5afx", "name": "Exempt" },
        { "id": "k6di2eie", "name": "Taxable " }
      ],
      "stockCategories": [],
      "units": [
        { "id": "u_nos", "symbol": "Nos", "name": "Numbers" },
        { "id": "u_kg", "symbol": "Kg", "name": "Kilograms" },
        { "id": "u_qtl", "symbol": "Qtl", "name": "Quintal" },
        { "id": "u_ltr", "symbol": "Ltr", "name": "Litre" },
        { "id": "u_bag", "symbol": "Bag", "name": "Bag" },
        { "id": "u_pcs", "symbol": "Pcs", "name": "Pieces" }
      ],
      "voucherTypes": [],
      "godowns": [{ "id": "gd_main", "name": "Central Processing Centre" }],
      "assets": [],
      "users": [
        { "id": "u_admin", "name": "admin", "role": "Admin", "pass": "admin" },
        { "id": "u_expert", "name": "domainexpert", "role": "Domain Expert", "pass": "Lohia@2026" },
        { "id": "u_ceo", "name": "ceo", "role": "Admin", "pass": "ceo123" },
        { "id": "u_acc", "name": "accountant", "role": "Accountant", "pass": "acc123" },
        { "id": "u_ca", "name": "ca", "role": "CA", "pass": "ca123" },
        { "id": "np3vr5ea", "name": "trila", "role": "Admin", "pass": "fpc1234" }
      ],
      "audit": [],
      "createdAt": "2026-07-29T09:24:44.563Z",
      "msme": [
        { "supplier": "TRILA", "invNo": "1", "invDate": "2023-07-29", "amount": "3200000", "creditDays": 45, "payDate": "", "status": "Not Paid" }
      ]
    },
    {
      "id": "huvh2irb",
      "name": "Bubli Mahila Kisan Producer Company Ltd",
      "gstin": "",
      "pan": "",
      "fyStart": "2025-04-01",
      "fyEnd": "2026-03-31",
      "address": "",
      "memberRevenue80P": true,
      "meta": {
        "district": "Kokrajhar",
        "block": "Dotma",
        "ceo": "Phungjwa Brahma",
        "ceoMob": "8135972187",
        "ceoEmail": "imphungjwa@gmail.com",
        "acc": "Birshad Mushahary",
        "accMob": "8011409277",
        "accEmail": "legendbeer96@gmail.com"
      },
      "groups": [
        { "id": "g_cap", "name": "Capital Account", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_loan", "name": "Loans (Liability)", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_cl", "name": "Current Liabilities", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_dt", "name": "Duties & Taxes", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_cred", "name": "Sundry Creditors", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_prov", "name": "Provisions", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_fa", "name": "Fixed Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_inv", "name": "Investments", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_ca", "name": "Current Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_bank", "name": "Bank Accounts", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_cash", "name": "Cash-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_deb", "name": "Sundry Debtors", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_stk", "name": "Stock-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_la", "name": "Loans & Advances (Asset)", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_sales", "name": "Sales Accounts", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_pur", "name": "Purchase Accounts", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_di", "name": "Direct Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_de", "name": "Direct Expenses", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_ii", "name": "Indirect Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_ie", "name": "Indirect Expenses", "nat": "E", "dr": true, "side": "PL" }
      ],
      "ledgers": [
        { "id": "l_cash", "name": "Cash", "grp": "g_cash", "ob": 0, "obt": "Dr" },
        { "id": "l_capital", "name": "Share Capital", "grp": "g_cap", "ob": 0, "obt": "Cr" },
        { "id": "hrsy0qt1", "name": "Reserves & Surplus", "grp": "g_cap", "ob": 417395.52, "obt": "Cr" },
        { "id": "zfnl7hh0", "name": "Share Application Money", "grp": "g_cap", "ob": 18600, "obt": "Cr" },
        { "id": "gd473izu", "name": "Share Capital (2025-26)", "grp": "g_cap", "ob": 1330000, "obt": "Cr" },
        { "id": "paxr6bh7", "name": "Profit & Loss A/c (2025-26)", "grp": "g_cap", "ob": 21457.59, "obt": "Cr" },
        { "id": "u65q2ywz", "name": "Gst Input", "grp": "g_dt", "ob": 4425.29, "obt": "Dr" },
        { "id": "6f4gpe7y", "name": "IGST Cash Ledger", "grp": "g_dt", "ob": 90, "obt": "Dr" },
        { "id": "e3hpdu29", "name": "Abhishek Agarwal & Co.", "grp": "g_prov", "ob": 22500, "obt": "Cr" },
        { "id": "f1qm2qu0", "name": "Grant From MMUY (Unspent)", "grp": "g_cl", "ob": 1200000, "obt": "Cr" },
        { "id": "vj4ziif7", "name": "Computer Printer", "grp": "g_fa", "ob": 33000, "obt": "Dr" },
        { "id": "gauu43g6", "name": "Furniture", "grp": "g_fa", "ob": 36000, "obt": "Dr" },
        { "id": "bs32ewjv", "name": "Packet Sealer Machine", "grp": "g_fa", "ob": 1610, "obt": "Dr" },
        { "id": "feswvoek", "name": "Provision for Depreciation", "grp": "g_fa", "ob": 16737, "obt": "Cr" },
        { "id": "5kefenh7", "name": "Stock in Hand", "grp": "g_stk", "ob": 261326, "obt": "Dr" },
        { "id": "deczyizv", "name": "HDFC - 88553", "grp": "g_bank", "ob": 2825799.43, "obt": "Dr" },
        { "id": "lgmxjg0i", "name": "TDS Receivable", "grp": "g_la", "ob": 7.8, "obt": "Dr" },
        { "id": "n21bqua7", "name": "Sales", "grp": "g_sales", "ob": 1052031.91, "obt": "Cr" },
        { "id": "rq9sedia", "name": "Purchase", "grp": "g_pur", "ob": 822539, "obt": "Dr" },
        { "id": "camgvvdr", "name": "Grant Income", "grp": "g_ii", "ob": 600001, "obt": "Cr" },
        { "id": "l4jvz4t8", "name": "Other Income", "grp": "g_ii", "ob": 151.4, "obt": "Cr" },
        { "id": "pzyhom6h", "name": "Reimbursement", "grp": "g_ii", "ob": 12227, "obt": "Cr" },
        { "id": "sd8mt6h1", "name": "Resource Fee", "grp": "g_ii", "ob": 2500, "obt": "Cr" },
        { "id": "5dpdcqlv", "name": "Bank Charges", "grp": "g_ie", "ob": 33.5, "obt": "Dr" },
        { "id": "1d86h3bz", "name": "Commission", "grp": "g_ie", "ob": 2993.95, "obt": "Dr" },
        { "id": "y3aq6jgi", "name": "Depreciation", "grp": "g_ie", "ob": 13275, "obt": "Dr" },
        { "id": "hyhnt3nz", "name": "Electricity", "grp": "g_ie", "ob": 1088, "obt": "Dr" },
        { "id": "itz2fup1", "name": "GST Expenses", "grp": "g_ie", "ob": 3170.07, "obt": "Dr" },
        { "id": "x4nq4zm5", "name": "MCA Expenses", "grp": "g_ie", "ob": 1200, "obt": "Dr" },
        { "id": "j49ex12a", "name": "Meeting Expenses", "grp": "g_ie", "ob": 7000, "obt": "Dr" },
        { "id": "pl3jh2ql", "name": "Office Expense", "grp": "g_ie", "ob": 32151.38, "obt": "Dr" },
        { "id": "ict7ofat", "name": "Printing & Stationary", "grp": "g_ie", "ob": 635, "obt": "Dr" },
        { "id": "gaflef4m", "name": "Rent", "grp": "g_ie", "ob": 48000, "obt": "Dr" },
        { "id": "6njlonrp", "name": "Retrainership Fee", "grp": "g_ie", "ob": 22500, "obt": "Dr" },
        { "id": "rcjqpy8n", "name": "Salary", "grp": "g_ie", "ob": 420000, "obt": "Dr" },
        { "id": "e79t7ae2", "name": "Statutory Registration & Return Exp", "grp": "g_ie", "ob": 11520, "obt": "Dr" },
        { "id": "iuce6pk5", "name": "Transportation", "grp": "g_ie", "ob": 385, "obt": "Dr" },
        { "id": "vd89tge4", "name": "Travelling Exp", "grp": "g_ie", "ob": 144852, "obt": "Dr" }
      ],
      "vouchers": [],
      "stockItems": [],
      "stockGroups": [],
      "stockCategories": [],
      "units": [
        { "id": "u_nos", "symbol": "Nos", "name": "Numbers" },
        { "id": "u_kg", "symbol": "Kg", "name": "Kilograms" },
        { "id": "u_qtl", "symbol": "Qtl", "name": "Quintal" },
        { "id": "u_ltr", "symbol": "Ltr", "name": "Litre" },
        { "id": "u_bag", "symbol": "Bag", "name": "Bag" },
        { "id": "u_pcs", "symbol": "Pcs", "name": "Pieces" }
      ],
      "voucherTypes": [],
      "godowns": [{ "id": "gd_main", "name": "Central Processing Centre" }],
      "assets": [],
      "users": [
        { "id": "u_admin", "name": "admin", "role": "Admin", "pass": "admin" },
        { "id": "u_expert", "name": "domainexpert", "role": "Domain Expert", "pass": "Lohia@2026" },
        { "id": "u_ceo", "name": "ceo", "role": "Admin", "pass": "ceo123" },
        { "id": "u_acc", "name": "accountant", "role": "Accountant", "pass": "acc123" },
        { "id": "u_ca", "name": "ca", "role": "CA", "pass": "ca123" },
        { "id": "6cwh8zrz", "name": "bubli", "role": "Admin", "pass": "fpc1234" }
      ],
      "audit": [],
      "createdAt": "2026-07-29T09:24:44.578Z"
    },
    {
      "id": "br9ufoz0",
      "name": "Bakhraful Asomi Mahila Farmers Producer Company Limited",
      "gstin": "",
      "pan": "",
      "fyStart": "2026-04-01",
      "fyEnd": "2027-03-31",
      "address": "",
      "memberRevenue80P": true,
      "meta": {
        "district": "Nagaon",
        "block": "Raha",
        "ceo": "Puja Bora",
        "ceoMob": "7002824809",
        "ceoEmail": "pujabora02922@gmail.com",
        "acc": "Bipram Chandra Hojai",
        "accMob": "8399019379",
        "accEmail": "hojaibipram@gmail.com"
      },
      "groups": [
        { "id": "g_cap", "name": "Capital Account", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_loan", "name": "Loans (Liability)", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_cl", "name": "Current Liabilities", "nat": "L", "dr": false, "side": "BS-L" },
        { "id": "g_dt", "name": "Duties & Taxes", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_cred", "name": "Sundry Creditors", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_prov", "name": "Provisions", "nat": "L", "dr": false, "side": "BS-L", "parent": "g_cl" },
        { "id": "g_fa", "name": "Fixed Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_inv", "name": "Investments", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_ca", "name": "Current Assets", "nat": "A", "dr": true, "side": "BS-A" },
        { "id": "g_bank", "name": "Bank Accounts", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_cash", "name": "Cash-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_deb", "name": "Sundry Debtors", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_stk", "name": "Stock-in-Hand", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_la", "name": "Loans & Advances (Asset)", "nat": "A", "dr": true, "side": "BS-A", "parent": "g_ca" },
        { "id": "g_sales", "name": "Sales Accounts", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_pur", "name": "Purchase Accounts", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_di", "name": "Direct Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_de", "name": "Direct Expenses", "nat": "E", "dr": true, "side": "PL" },
        { "id": "g_ii", "name": "Indirect Incomes", "nat": "I", "dr": false, "side": "PL" },
        { "id": "g_ie", "name": "Indirect Expenses", "nat": "E", "dr": true, "side": "PL" }
      ],
      "ledgers": [
        { "id": "l_cash", "name": "Cash", "grp": "g_cash", "ob": 0, "obt": "Dr" },
        { "id": "l_capital", "name": "Share Capital", "grp": "g_cap", "ob": 0, "obt": "Cr" },
        { "id": "l_cgst", "name": "Output CGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_sgst", "name": "Output SGST", "grp": "g_dt", "ob": 0, "obt": "Cr" },
        { "id": "l_icgst", "name": "Input CGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_isgst", "name": "Input SGST", "grp": "g_dt", "ob": 0, "obt": "Dr" },
        { "id": "l_sale", "name": "Sales - Agri Produce", "grp": "g_sales", "ob": 0, "obt": "Cr" },
        { "id": "l_purchase", "name": "Purchases", "grp": "g_pur", "ob": 0, "obt": "Dr" },
        { "id": "l_round", "name": "Rounding Off", "grp": "g_ie", "ob": 0, "obt": "Dr" }
      ],
      "vouchers": [],
      "stockItems": [],
      "stockGroups": [],
      "stockCategories": [],
      "units": [
        { "id": "u_nos", "symbol": "Nos", "name": "Numbers" },
        { "id": "u_kg", "symbol": "Kg", "name": "Kilograms" },
        { "id": "u_qtl", "symbol": "Qtl", "name": "Quintal" },
        { "id": "u_ltr", "symbol": "Ltr", "name": "Litre" },
        { "id": "u_bag", "symbol": "Bag", "name": "Bag" },
        { "id": "u_pcs", "symbol": "Pcs", "name": "Pieces" }
      ],
      "voucherTypes": [],
      "godowns": [{ "id": "gd_main", "name": "Central Processing Centre" }],
      "assets": [],
      "users": [
        { "id": "u_admin", "name": "admin", "role": "Admin", "pass": "admin" },
        { "id": "u_expert", "name": "domainexpert", "role": "Domain Expert", "pass": "Lohia@2026" },
        { "id": "u_ceo", "name": "ceo", "role": "Admin", "pass": "ceo123" },
        { "id": "u_acc", "name": "accountant", "role": "Accountant", "pass": "acc123" },
        { "id": "u_ca", "name": "ca", "role": "CA", "pass": "ca123" },
        { "id": "ea9p4mrp", "name": "bakhraful", "role": "Admin", "pass": "fpc1234" }
      ],
      "audit": [],
      "createdAt": "2026-07-29T09:24:44.578Z",
      "observations": [
        { "id": "707z36q0", "voucher": "21-03-2025 · Puja Bora (CEO)", "cat": "Mismatch / Malpractice", "note": "₹25,000 salary via cheque; later lump sums suggest inflated claims", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "rm8ib554", "voucher": "21-03-2025 · Latika Basumatari", "cat": "Mismatch / Malpractice", "note": "₹17,695 Krishi Mela expense; fragmented reimbursement, weak documentation", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "mbyycwuu", "voucher": "29-03-2025 · Transfer (Ledger)", "cat": "Mismatch / Malpractice", "note": "₹46,245 large withdrawal without supporting voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "tm4vkz9n", "voucher": "07-04-2025 · Puja Bora (CEO)", "cat": "Mismatch / Malpractice", "note": "₹25,000 salary; repeated payments, inconsistent with fixed pay", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "25ixvyh5", "voucher": "09-04-2025 · Puja Bora (CEO)", "cat": "Mismatch / Malpractice", "note": "₹25,000 salary; NEFT charges shown separately, possible inflation", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "7kzg6csl", "voucher": "19-05-2025 · Lalika Basumatari", "cat": "Mismatch / Malpractice", "note": "₹23,225 Bohagi Mela expense; fragmented reimbursement", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "8855n0t8", "voucher": "27-05-2025 · MS MA Steel Emporium", "cat": "Mismatch / Malpractice", "note": "₹13,000 furniture; documented, but NEFT charges deducted separately", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "q2d8np06", "voucher": "29-06-2025 · Transfer (Ledger)", "cat": "Mismatch / Malpractice", "note": "₹39,150 large withdrawal without voucher support", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "ag1lyhlw", "voucher": "17-07-2025 · Bipram Chandra Hojai", "cat": "Mismatch / Malpractice", "note": "₹3,655 salary/stationery; inconsistent with fixed pay, disguised reimbursement", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "j2uizuo2", "voucher": "24-07-2025 · Cash withdrawal", "cat": "Mismatch / Malpractice", "note": "₹7,000 cash withdrawal; no supporting voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "vzdyhkg0", "voucher": "30-10-2025 · NEFT Collection", "cat": "Mismatch / Malpractice", "note": "₹83,300 large transfer; no supporting expense record", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "jvyher7m", "voucher": "12-11-2025 · Puja Bora (CEO)", "cat": "Mismatch / Malpractice", "note": "₹74,460 lump-sum salary (3 months); inflated, inconsistent", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "9uc50myv", "voucher": "12-11-2025 · Sundry Party", "cat": "Mismatch / Malpractice", "note": "₹31,500 NEFT transfer; vague purpose, no voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "u33a481t", "voucher": "18-02-2026 · Chief Executive Office", "cat": "Mismatch / Malpractice", "note": "₹12,00,000 huge NEFT credit; source unclear, suspicious", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "ezcnzb2o", "voucher": "05-03-2026 · NEFT Collection", "cat": "Mismatch / Malpractice", "note": "₹67,500 large transfer; no supporting voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "xismov83", "voucher": "24-03-2026 · Abhishek Agarwal", "cat": "Mismatch / Malpractice", "note": "₹46,070 cheque; ledger shows duplicate NEFT entry, possible double booking", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "exedj2b5", "voucher": "06-04-2026 · Transfer", "cat": "Mismatch / Malpractice", "note": "₹66,962 large withdrawal; no voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "w4ij9h9o", "voucher": "13-05-2026 · National Seeds Corp", "cat": "Mismatch / Malpractice", "note": "₹2,500 NEFT; NEFT charges shown separately, mismatch", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "hwqh3lxv", "voucher": "20-05-2026 · Cash deposit", "cat": "Mismatch / Malpractice", "note": "₹40,000 inflated deposit without voucher", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "uc8s9n9v", "voucher": "18-03-2026 · Cash deposit", "cat": "Mismatch / Malpractice", "note": "₹72,000 large deposit without voucher support", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" },
        { "id": "f99cj4xw", "voucher": "Undated · Transport (mustard oil)", "cat": "Mismatch / Malpractice", "note": "₹22,000 cash paid outside ledger; scope for diversion", "deadline": "", "by": "Domain Expert (Law & Accounts)", "status": "Open", "ts": "2026-07-29T09:24:44.578Z", "reply": "" }
      ]
    }
  ],
  "active": "ki7u81jr",
  "tasks": [
    {
      "id": "mvk9m759",
      "companyId": "c9in2sj0",
      "assignee": "CEO",
      "mailRef": "",
      "mailDate": "2026-07-29",
      "task": "Dear Accountant push 29.07.26 data to this software ",
      "dateGiven": "2026-07-29",
      "expectedDate": "2026-07-29",
      "status": "Open",
      "reason": "",
      "by": "domainexpert",
      "ts": "2026-07-29T09:52:23.509Z"
    }
  ]
};
