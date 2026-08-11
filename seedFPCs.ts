import { Company, Group, Ledger, ShareCertificate, TDSEntry } from '../types';

export const NATURE = { A: 'Assets', L: 'Liabilities', I: 'Income', E: 'Expenses' } as const;

export const DEFAULT_GROUPS: Group[] = [
  { id: 'g_cap', name: 'Capital Account', nat: 'L', dr: false, side: 'BS-L' },
  { id: 'g_loan', name: 'Loans (Liability)', nat: 'L', dr: false, side: 'BS-L' },
  { id: 'g_cl', name: 'Current Liabilities', nat: 'L', dr: false, side: 'BS-L' },
  { id: 'g_dt', name: 'Duties & Taxes', nat: 'L', dr: false, side: 'BS-L', parent: 'g_cl' },
  { id: 'g_cred', name: 'Sundry Creditors', nat: 'L', dr: false, side: 'BS-L', parent: 'g_cl' },
  { id: 'g_prov', name: 'Provisions', nat: 'L', dr: false, side: 'BS-L', parent: 'g_cl' },
  { id: 'g_fa', name: 'Fixed Assets', nat: 'A', dr: true, side: 'BS-A' },
  { id: 'g_inv', name: 'Investments', nat: 'A', dr: true, side: 'BS-A' },
  { id: 'g_ca', name: 'Current Assets', nat: 'A', dr: true, side: 'BS-A' },
  { id: 'g_bank', name: 'Bank Accounts', nat: 'A', dr: true, side: 'BS-A', parent: 'g_ca' },
  { id: 'g_cash', name: 'Cash-in-Hand', nat: 'A', dr: true, side: 'BS-A', parent: 'g_ca' },
  { id: 'g_deb', name: 'Sundry Debtors', nat: 'A', dr: true, side: 'BS-A', parent: 'g_ca' },
  { id: 'g_stk', name: 'Stock-in-Hand', nat: 'A', dr: true, side: 'BS-A', parent: 'g_ca' },
  { id: 'g_la', name: 'Loans & Advances (Asset)', nat: 'A', dr: true, side: 'BS-A', parent: 'g_ca' },
  { id: 'g_sales', name: 'Sales Accounts', nat: 'I', dr: false, side: 'PL' },
  { id: 'g_pur', name: 'Purchase Accounts', nat: 'E', dr: true, side: 'PL' },
  { id: 'g_di', name: 'Direct Incomes', nat: 'I', dr: false, side: 'PL' },
  { id: 'g_de', name: 'Direct Expenses', nat: 'E', dr: true, side: 'PL' },
  { id: 'g_ii', name: 'Indirect Incomes', nat: 'I', dr: false, side: 'PL' },
  { id: 'g_ie', name: 'Indirect Expenses', nat: 'E', dr: true, side: 'PL' },
];

export const DEFAULT_LEDGERS: Ledger[] = [
  { id: 'l_cash', name: 'Cash', grp: 'g_cash', ob: 0, obt: 'Dr' },
  { id: 'l_capital', name: 'Share Capital', grp: 'g_cap', ob: 0, obt: 'Cr' },
  { id: 'l_cgst', name: 'Output CGST', grp: 'g_dt', ob: 0, obt: 'Cr' },
  { id: 'l_sgst', name: 'Output SGST', grp: 'g_dt', ob: 0, obt: 'Cr' },
  { id: 'l_icgst', name: 'Input CGST', grp: 'g_dt', ob: 0, obt: 'Dr' },
  { id: 'l_isgst', name: 'Input SGST', grp: 'g_dt', ob: 0, obt: 'Dr' },
  { id: 'l_sale', name: 'Sales - Agri Produce', grp: 'g_sales', ob: 0, obt: 'Cr' },
  { id: 'l_purchase', name: 'Purchases', grp: 'g_pur', ob: 0, obt: 'Dr' },
  { id: 'l_round', name: 'Rounding Off', grp: 'g_ie', ob: 0, obt: 'Dr' },
];

export const DEFAULT_UNITS = [
  { id: 'u_nos', symbol: 'Nos', name: 'Numbers' },
  { id: 'u_kg', symbol: 'Kg', name: 'Kilograms' },
  { id: 'u_qtl', symbol: 'Qtl', name: 'Quintal' },
  { id: 'u_ltr', symbol: 'Ltr', name: 'Litre' },
  { id: 'u_bag', symbol: 'Bag', name: 'Bag' },
  { id: 'u_pcs', symbol: 'Pcs', name: 'Pieces' },
];

export const VTYPES = ['Payment', 'Receipt', 'Contra', 'Journal', 'Sales', 'Purchase', 'Debit Note', 'Credit Note'];

export const ASSET_CLASSES = [
  { c: 'Buildings (RCC)', life: 60 },
  { c: 'Buildings (other)', life: 30 },
  { c: 'Plant & Machinery', life: 15 },
  { c: 'Furniture & Fittings', life: 10 },
  { c: 'Office Equipment', life: 5 },
  { c: 'Computers & Laptops', life: 3 },
  { c: 'Servers & Networks', life: 6 },
  { c: 'Motor Vehicles', life: 8 },
  { c: 'Cold Storage Plant', life: 15 },
];

export const COMPLIANCE = [
  { task: 'GSTR-1 (Monthly)', day: 11, freq: 'Monthly' },
  { task: 'GSTR-3B (Monthly)', day: 20, freq: 'Monthly' },
  { task: 'TDS Payment (Challan 281)', day: 7, freq: 'Monthly' },
  { task: 'TDS Return 26Q', day: 31, freq: 'Quarterly' },
  { task: 'GSTR-9 Annual Return', day: 31, month: 12, freq: 'Annual' },
  { task: 'Statutory Audit (AGM)', day: 30, month: 9, freq: 'Annual' },
  { task: 'Income Tax Return (Company)', day: 31, month: 10, freq: 'Annual' },
  { task: 'ROC — AOC-4 & MGT-7', day: 30, month: 11, freq: 'Annual' },
];

export const FPC_PASS = 'fpc1234';

export const SEED_FPCS: string[][] = [
  ["Zilikoni Asomi Mahila Farmers Producer Company Limited","Bajali","Bhawanipur","Safiur Rahman","8638000264","safiurrhmn@gmail.com","Mayuri Talukdar","9678905277","mayuritalukdar322@gmail.com"],
  ["Naturabites Asomi Mahila Farmers Producer Company Limited","Baksa","Goreswar","Hemanta Boro","6003593525","xhemantax@gmail.com","Lakshmi Sarania","7086758664","lakshmisarania183@gmail.com"],
  ["Swrang Asomi Mahila Farmers Producer Company Limited","Baksa","Tamulpur","Trishna Baishya","8638060090","tbaishya35@gmail.com","Jintu Ramchiyari","7896353029","jinturmcy22@gmail.com"],
  ["Janani Asomi Mahila Farmers Producer Company Limited","Biswanath","Sakomatha","Kalpajyoti Gogoi","6000126031","kalpajyotig54@gmail.com","Rahul Boruah","9365820722","rikiboruah2001@gmail.com"],
  ["Jeuti Asomi Mahila Farmers Producer Company Limited","Biswanath","Behali","Rajib Saikia","9508597441","saikia98rajib@gmail.com","Anup Hazarika","8486422092","anuph7115@gmail.com"],
  ["Trila Asomi Mahila Farmers Producer Company Limited","Bongaigaon","Srijangram","Jahidul Hussain","7002876211","jahidulhussain021015@gmail.com","Ariful Hasan","8822411563","arifulhasan802@gmail.com"],
  ["Shining Star Asomi Mahila Farmers Producer Company Limited","Bongaigaon","Manikpur","Dharambir Roy","6002960140","vargobkashyap@gmail.com","Sujit Talukdar","6003141312","sujittalukdar79@gmail.com"],
  ["Srishti Asomi Mahila Farmers Producer Company Limited","Bongaigaon","Manikpur","Bikash Goswami","7002367715","bikashgoswami52@gmail.com","Abdur Roufe Ahmed","6900579133","aroufemohia100@gmail.com"],
  ["Tulunsi Mahila Kisan Producer Company Ltd","Chirang","Borobazar","Sambaru Daimary","8761081965","sombarudaimary14@gmail.com","Ghanajit Narzary","8749958718","gnofficial25@gmail.com"],
  ["Sunjarang Mahila Kisan Producer Company Ltd","Chirang","Borobazar","Pulicharan Muchahary","7002928947","morningstar464@gmail.com","Dibya Basumatary","7896783966","basumatarydibya38@gmail.com"],
  ["Mohila Kalyan Asomi Mahila Farmers Producer Company Limited","Darrang","Pub Mangaldoi","Bimal Kanu","9365260363","bimalkanu5@gmail.com","Nesib Akrin","7662808959","nasibakram786@gmail.com"],
  ["Protiva Asomi Mahila Farmers Producer Company Limited","Darrang","Dalgaon Sialmari","Shehnaz Sabin Hussain","7002364274","dalgaondlg@gmail.com","Sabnam Khatun","6002162033","sabnamkhatun0221@gmail.com"],
  ["Pragjyoti Asomi Mahila Farmers Producer Company Limited","Darrang","Pachim Mangaldai","Bhaswati Kalita","6002832518","bhaswatik298@gmail.com","Hirumoni Kalita","8133888765","hirumanikalita26@gmail.com"],
  ["Sipajhar Asomi Mahila Farmers Producer Company Limited","Darrang","Sipajhar","Ashok Kumar Bordoloi","8731014533","bordoloi.ak@gmail.com","Kusum Saharia","8099020162","baruahkusum7@gmail.com"],
  ["Jana Kalyan Asomi Mahila Farmers Producer Company Limited","Darrang","Bechimari","Nabajyoti Nath","6002846569","nabajyotin043@gmail.com","Kunal Sarmah","7002386067","kunalsarma65@gmail.com"],
  ["Jonki Panoi Asomi Mahila Farmers Producer Company Limited","Dhemaji","MSTD","Tapan Pegu","8134879817","tapanpegu2018@gmail.com","","",""],
  ["Kulajan Asomi Mahila Farmers Producer Company Limited","Dhemaji","Sissiborgaon","Swapna Hazarika","7099234429","shazarika299@gmail.com","","",""],
  ["Bogibil Asomi Mahila Farmers Producer Company Limited","Dhemaji","Sissiborgaon","Jatharta Gogoi","9101195503","jathartagogogi13@gmail.com","","",""],
  ["Mulagabharu Asomi Mahila Farmers Producer Company Limited","Dhemaji","Machkhowa","Nipon Das","6003714593","nipondasdk@gmail.com","","",""],
  ["Udyomi Asomi Mahila Farmers Producer Company Limited","Dibrugarh","Khowang","Anup Jyoti Raidongia","8761922451","anupjyoti100220@gmail.com","Hiraliyani Taye Panging","9365336773","hiralipanging@gmail.com"],
  ["Uddomi Asomi Mahila Farmers Producer Company Limited","Goalpara","Jaleshwar","Sultana Parvin","9394686314","sarzu.123123@gmail.com","Bikram Kumar Barman","6001618562","barmanvikram95@gmail.com"],
  ["Angikar Asomi Mohila Farmers Producer Company Limited","Goalpara","Kushdhowa","Shorif Sadik Alom","6002548126","shorifsadik24@gmail.com","Rubina Yasmin","8822874498","rubinayasmin069@gmail.com"],
  ["Prerakta Asomi Mahila Farmers Producer Company Limited","Hailakandi","Katlicherra","Kawsarul Alom Barbhuiya","6361568273","kawsarulalom1998@gmail.com","Tarikul Islam Laskar","7086939554","tarikullaskar5859@gmail.com"],
  ["Utshahita Asomi Mahila Farmers Producer Company Limited","Hailakandi","Hailakandi","Bahar Uddin Laskar","6000404614","baharlaskar332@gmail.com","Momotaj Banu Laskar","9394134497","mmtzlaskar@gmail.com"],
  ["Syamali Asomi Mahila Farmers Producer Company Limited","Kamrup","Bezera","Akhil Nath","8399054412","akhilnath20117@gmail.com","Shewalee Kalita","8135056536","kalitashewalee@gmail.com"],
  ["Tambrong Asomi Mahila Farmers Producer Company Limited","Kamrup","Boko","Shahil Khandaker","7086703484","mshahilkhandaker786@gmail.com","Dipamoni Rabha","9101255297","dipamonirabha2018@gmail.com"],
  ["Pobitora Asomi Mahila Farmers Producer Company Limited","Kamrup","Chayani Barduar","Sumi Kumari","7577877505","kumarisumi7577@gmail.com","Purabi Konwar","9127090487","purabikonwar910@gmail.com"],
  ["Dharitri Asomi Mahila Farmers Producer Company Limited","Kamrup","Sualkuchi","Kakushri Devi","8638213801","kakusrid@gmail.com","Bikanka Das","9127385388","tinkubaishya20239@gmail.com"],
  ["Anudaan Asomi Mahila Farmers Producer Company Limited","Kamrup","Rampur","Barnali Nath","7576038620","nbarnali935@gmail.com","Chinmoy Sarma","8876257132","chinmoysharma335@gmail.com"],
  ["Bubli Mahila Kisan Producer Company Ltd","Kokrajhar","Dotma","Phungjwa Brahma","8135972187","imphungjwa@gmail.com","Birshad Mushahary","8011409277","legendbeer96@gmail.com"],
  ["Fulung Mahila Kisan Producer Company Ltd","Kokrajhar","Dotma","Nijwm Islary","8133004932","nijwmislary143@gmail.com","Markondiyo Basumatry","6000326791","markondiyobasumatary@gmail.com"],
  ["Abha Asomi Mahila Farmers Producer Company Limited","Kokrajhar","Hatidhura","Patrash Murmu","8787495407","patrashmurmu50@gmail.com","Margret Hembrom","9577768482","hembrommargret0@gmail.com"],
  ["Narayanpur Asomi Mahila Farmers Producer Company Limited","Lakhimpur","Narayanpur","Bitupan Borah","8638199363","bitupanborah770@gmail.com","","",""],
  ["Li Sang Asomi Mahila Farmers Producer Company Limited","Lakhimpur","Lakhimpur","Dipty Deori","9101429209","diptydeori94@gmail.com","Jimi Doley","9678576053","jimidoley92@gmail.com"],
  ["Mejankori Asomi Mahila Farmers Producer Company Limited","Lakhimpur","Lakhimpur","Antu Das","6002676221","dasantu556@gmail.com","Pulak Neog","9954676263","pulakneog451@gmail.com"],
  ["Charikoria Asomi Mahila Farmers Producer Company Limited","Lakhimpur","Dhakuakhana","Nibir Jyoti Hazarika","9101273898","nibirjyoti007@gmail.com","Shewali Mali","7002885232","shewalimali99@gmail.com"],
  ["Bramhaputra Asomi Mahila Farmers Producer Company Limited","Morigaon","Bhurbandha","Dibya Jyoti Hazarika","8135877927","hazarikadibya425@gmail.com","Niranjan Mandal","8638771796","mondalniranjan153@gmail.com"],
  ["Swabalambi Asomi Mahila Farmers Producer Company Limited","Morigaon","Laharighat","Amarjyoti Bordoloi","8638811862","amarjyotibordoloi1999@gmail.com","Nitul Borkakaty","9706902490","nitulborkakaty123@gmail.com"],
  ["Rudali Asomi Mahila Farmers Producer Company Limited","Morigaon","Kapili","Moon Deep Nath","9613909749","justmail2moon@gmail.com","Mehdi Alom","6002055223","mehdialom212@gmail.com"],
  ["Bakhraful Asomi Mahila Farmers Producer Company Limited","Nagaon","Raha","Puja Bora","7002824809","pujabora02922@gmail.com","Bipram Chandra Hojai","8399019379","hojaibipram@gmail.com"],
  ["Lawkhowa Asomi Mahila Farmers Producer Company Limited","Nagaon","Laokhowa","Jitul Pratim Raj","8486222278","jitulpratimraj21234@gmail.com","Prasenjit Bhawal","9365732893","rfl.sr.prasenjitbhawal@gmail.com"],
  ["Mokrang Asomi Mahlia Farmers Producer Company Limited","Nagaon","Barhampur","Abhishek Borkotoki","8724936436","aborkataki18@gmail.com","Sajjadur Rahman","9085761811","rahmanshujjadur465@gmail.com"],
  ["Nabarup Asomi Mahila Farmers Producer Company Limited","Nalbari","Barkhetri","Ganesh Chandra Sarkar","8638575851","ganeshchandrasarkar060@gmail.com","Mubarak Pradhani","7002682766","mpradhani938@gmail.com"],
  ["Kuhipat Asomi Mahila Farmers Producer Company Limited","Nalbari","Paschim Nalbari","Barnali Devi","9085544644","bdbarnali90@gmail.com","Chandan Rajbongshi","9365922851","chandanraj26980@gmail.com"],
  ["Udbhob Asomi Mahila Farmers Producer Company Limited","Sonitpur","Bihaguri","Pranjal Kumar Goswami","9401987882","pranjalpinku_gsm@rediffmail.com","Deepa Roy","7577897361","roydeepa176@gmail.com"],
  ["Somaina Asomi Mahila Farmers Producer Company Limited","Sonitpur","Balipara","Queen Saharia","9365811745","queenkssaharia@gmail.com","","",""],
  ["Farm2Table Asomi Mahila Farmers Producer Company Limited","Tinsukia","Kakopathar","Kamol Barman","9101939410","kamolbarman95@gmail.com","Kalyan Jyoti Moran","8822399867","kalyanjyotimoran377@gmail.com"],
  ["Growers United Asomi Mahila Farmers Producer Company Limited","Tinsukia","Itakhuli","Bharti Poddar","6002182769","bhartipoddar786@gmail.com","Rishikesh Dutta","9864961269","rita.dutta4848@gmail.com"],
  ["Udgamita Asomi Mahila Farmers Producer Company Limited","Udalguri","Rowta","Paban Pathak","8638039806","pathakstore2019@gmail.com","Bandita Deka","6002798710","banditadeka2000@gmail.com"],
  ["Okrang Samridhi Mahila Kisan Producer Company Ltd","Udalguri","Bhergaon","Meghjyoti Saharia","8822324986","sahariameghjyoti5@gmail.com","Junali Boro","6003511329","junaliboro110@gmail.com"],
  ["Pokheraj Asomi Mahila Farmers Producer Company Limited","Sonitpur","Sootea","Gitasri Kashyap","7002140315","kashyapgita823@gmail.com","","",""],
  ["Sasoni Burhidhing Asomi Mahila Farmers Producer Company Limited","Dibrugarh","Joypur","Lakhi Nayaran Borgohain","8486147327","lakhitsk09@gmail.com","Sudipta Nayan Gogoi","9957077156","sudiptagogoi2001@gmail.com"],
  ["Pragatika Asomi Mahila Farmer Producer Company Limited","Hailakandi","Lala","Azimushshaan Barbhuiya","9706089640","azimushshaanbarbhuiya.ab@gmail.com","Reazul Hussain Laskar","9365515598","reazullxr@gmail.com"],
  ["Nabachetana Asomi Mahila Farmers Producer Company Limited","Hailakandi","Algapur","Ahmed Ali Choudhury","7002206385","masumchy1999@gmail.com","Subhan Nath","9101096361","snmazarbhuiya207@gmail.com"],
  ["Khatbhoni Asomi Mahila Farmers Producer Company Limited","Kamrup","Kamalpur","Tinku Baishya","8638691463","tinkuiswar@gmail.com","Jeherul Alam","6901602838","jeherulalam0@gmail.com"],
  ["Vihangama Asomi Mahila Farmers Producer Company Limited","Nagaon","Juria","Deep Jyoti Deka","9864885169","dd273653@gmail.com","Gawsul Azam Mehadi","8638733908","gawsulazammehadi123@gmail.com"],
  ["Rosemary Asomi Mahila Farmers Producer Company Limited","Nagaon","Dolongghat","Rajasrii Garg","8822736872","rajasrigarg2003@gmail.com","Munmi Rajkumari","9365494158","rajkumarimunmi56@gmail.com"],
  ["Jugantori Asomi Mahila Farmers Producer Company Limited","Nagaon","Kathiatoli","Gairik Gayan","8474885861","bikiviki861@gmail.com","Ajijur Rahman","7086343268","ajijur494@gmail.com"],
  ["Araidhya Asomi Mahila Farmers Producer Company Limited","Sonitpur","Naduar","Priyangshu Kashyap Borah","7086212411","priyangshuborah6@gmail.com","Lakhyajit Bhuyan","9435060719","lakhyajitbhuyan9@gmail.com"],
];

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function fpcUsername(name: string): string {
  return name.trim().split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function newCompany(name: string, meta?: any): Company {
  return {
    id: uid(),
    name: name || 'Demo FPC Ltd',
    gstin: '',
    pan: '',
    fyStart: '2026-04-01',
    fyEnd: '2027-03-31',
    address: '',
    memberRevenue80P: true,
    meta: meta || {},
    groups: JSON.parse(JSON.stringify(DEFAULT_GROUPS)),
    ledgers: JSON.parse(JSON.stringify(DEFAULT_LEDGERS)),
    vouchers: [],
    stockItems: [],
    stockGroups: [],
    stockCategories: [],
    units: JSON.parse(JSON.stringify(DEFAULT_UNITS)),
    voucherTypes: [],
    godowns: [{ id: 'gd_main', name: 'Central Processing Centre' }],
    assets: [],
    users: [
      { id: 'u_admin', name: 'admin', role: 'Admin', pass: 'admin' },
      { id: 'u_expert', name: 'domainexpert', role: 'Domain Expert', pass: 'Lohia@2026' },
      { id: 'u_ceo', name: 'ceo', role: 'Admin', pass: 'ceo123' },
      { id: 'u_acc', name: 'accountant', role: 'Accountant', pass: 'acc123' },
      { id: 'u_ca', name: 'ca', role: 'CA', pass: 'ca123' },
    ],
    audit: [],
    createdAt: nowISO(),
    shares: [],
    tdsList: [],
  };
}

export interface FPCMasterUpdate {
  slNo: number;
  district: string;
  block: string;
  name: string;
  cin: string;
  officialEmail: string;
  pass: string;
  gstUsername?: string;
  gstPass?: string;
  gstin?: string;
}

export const UPDATED_FPC_MASTERS: FPCMasterUpdate[] = [
  { slNo: 1, district: "Bajali", block: "Bhabanipur", name: "Zilikoni Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026264", officialEmail: "NAMAMIASOMI@GMAIL.COM", pass: "Zilikoni@2026", gstUsername: "Namami.2024", gstPass: "GstZilikoni@2026", gstin: "18ABDPY3955G1Z7" },
  { slNo: 2, district: "Baksa", block: "Goreswar", name: "NATURABITES Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026008", officialEmail: "naturabitesasomi@gmail.com", pass: "Naturabites@2026", gstUsername: "Naturabites_24", gstPass: "GstNaturabites@2026", gstin: "18AABCA2024A1Z2" },
  { slNo: 3, district: "Baksa", block: "Tamulpur", name: "Swrang Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026010", officialEmail: "swrangasomi@gmail.com", pass: "Swrang@2026", gstUsername: "swrangasomi", gstPass: "GstSwrang@2026", gstin: "18AABCA2024A1Z3" },
  { slNo: 4, district: "Biswanath", block: "Behali", name: "Jeuti Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026028", officialEmail: "jeutiasomi@gmail.com", pass: "Jeuti@2026", gstUsername: "Jeutiasomi_24", gstPass: "GstJeuti@2026", gstin: "18AABCA2024A1Z4" },
  { slNo: 5, district: "Biswanath", block: "Sakomatha", name: "Janani Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026136", officialEmail: "jananiasomi@gmail.com", pass: "Janani@2026", gstUsername: "Jananiasomi", gstPass: "GstJanani@2026", gstin: "18AABCA2024A1Z5" },
  { slNo: 6, district: "Biswanath", block: "Sootea", name: "POKHERAJ ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026287", officialEmail: "samsiddhiasomi@gmail.com", pass: "Pokheraj@2026", gstUsername: "Pokherajasomi", gstPass: "GstPokheraj@2026", gstin: "18AABCA2024A1Z6" },
  { slNo: 7, district: "Bongaigaon", block: "Manikpur 1", name: "Shining Star Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026103", officialEmail: "greenlandasomi@gmail.com", pass: "ShiningStar@2026", gstUsername: "shiningstar2024", gstPass: "GstShiningStar@2026", gstin: "18AABCA2024A1Z7" },
  { slNo: 8, district: "Bongaigaon", block: "Manikpur 2", name: "Srishti Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026139", officialEmail: "srishtiasomi@gmail.com", pass: "Srishti@2026", gstUsername: "Srishtiasomi_20", gstPass: "GstSrishti@2026", gstin: "18AABCA2024A1Z8" },
  { slNo: 9, district: "Bongaigaon", block: "srijangram", name: "Trila Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026024", officialEmail: "trilaasomi@gmail.com", pass: "Trila@2026", gstUsername: "Trilaasomi_24", gstPass: "GstTrila@2026", gstin: "18AABCA2024A1Z9" },
  { slNo: 10, district: "Chirang", block: "Borobazar", name: "Tulunsi Mahila Kisan Producer Company Ltd.", cin: "U01113AS2024PTC026310", officialEmail: "Tulunsifpc2023@gmail.com", pass: "Tulunsi@2026", gstUsername: "Tulunsi_25", gstPass: "GstTulunsi@2026", gstin: "18AABCA2024A110" },
  { slNo: 11, district: "Chirang", block: "Borobazar", name: "Sunjarang Mahila Kisan Producer Company Ltd.", cin: "U01113AS2024PTC026311", officialEmail: "Sunjarangfpc@gmail.com", pass: "Sunjarang@2026", gstUsername: "Sunjagaran_25", gstPass: "GstSunjarang@2026", gstin: "18AABCA2024A111" },
  { slNo: 12, district: "Darrang", block: "Bechimari", name: "Jana Kalyan Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026153", officialEmail: "janakalyanasomi@gmail.com", pass: "JanaKalyan@2026", gstUsername: "janakalyanasomi", gstPass: "GstJanaKalyan@2026", gstin: "18AABCA2024A112" },
  { slNo: 13, district: "Darrang", block: "Dalgaon Sialmari", name: "Protiva Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026254", officialEmail: "protivaasomi@gmail.com", pass: "Protiva@2026", gstUsername: "Protivaasomi", gstPass: "GstProtiva@2026", gstin: "18AABCA2024A113" },
  { slNo: 14, district: "Darrang", block: "Paschim Mangaldai", name: "Pragjyoti Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026093", officialEmail: "PRAGJYOTIASOMI@GMAIL.COM", pass: "Pragjyoti@2026", gstUsername: "PRAGJYOTIASOMI", gstPass: "GstPragjyoti@2026", gstin: "18AABCA2024A114" },
  { slNo: 15, district: "Darrang", block: "Pub Mangaldai", name: "MOHILA KALAYAN ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026215", officialEmail: "mohilakalyanasomi@gmail.com", pass: "MohilaKalyan@2026", gstUsername: "MOHILAKALYAN_24", gstPass: "GstMohilaKalyan@2026", gstin: "18AABCA2024A115" },
  { slNo: 16, district: "Darrang", block: "Siprajhar", name: "SIPAJHAR ASOMI MOHILA FARMERS PRODUCER COMPANY. LIMITED", cin: "U01113AS2024PTC026211", officialEmail: "asomianupam@gmail.com", pass: "Siprajhar@2026", gstUsername: "Siprajharasomi", gstPass: "GstSiprajhar@2026", gstin: "18AABCA2024A116" },
  { slNo: 17, district: "Dhemaji", block: "Machkowa", name: "Mulagabharu Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026272", officialEmail: "jaimotasomi@gmail.com", pass: "Mulagabharu@2026", gstUsername: "mulagabharu_24", gstPass: "GstMulagabharu@2026", gstin: "18AABCA2024A117" },
  { slNo: 18, district: "Dhemaji", block: "MSTD", name: "JONKI PANOI ASOMI MOHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026206", officialEmail: "jonkipanoiasomi@gmail.com", pass: "Jonkipanoi@2026", gstUsername: "Jonkipanoi", gstPass: "GstJonkipanoi@2026", gstin: "18AABCA2024A118" },
  { slNo: 19, district: "Dhemaji", block: "Sisiboragaon FPC 1", name: "Kulajan Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026213", officialEmail: "jarsangasomi@gmail.com", pass: "Kulajan@2026", gstUsername: "Kula_jan", gstPass: "GstKulajan@2026", gstin: "18AABCA2024A119" },
  { slNo: 20, district: "Dhemaji", block: "Sisiboragaon FPC 2", name: "Bogibil Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026216", officialEmail: "bogibilasomi@gmail.com", pass: "Bogibil@2026", gstUsername: "Bogibilasomi_25", gstPass: "GstBogibil@2026", gstin: "18AABCA2024A120" },
  { slNo: 21, district: "Dibrugarh", block: "Joypur", name: "SASONI BURHIDHING ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026294", officialEmail: "SASONIBURHIDIHINGASOMI@GMAIL.COM", pass: "Sasoni@2026", gstUsername: "SASONI_24", gstPass: "GstSasoni@2026", gstin: "18AABCA2024A121" },
  { slNo: 22, district: "Dibrugarh", block: "Khowang", name: "Udyomi Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026006", officialEmail: "udyomiasomi@gmail.com", pass: "Udyomi@2026", gstUsername: "udyomiasomi", gstPass: "GstUdyomi@2026", gstin: "18AABCA2024A122" },
  { slNo: 23, district: "Goalpara", block: "Jaleswar", name: "UDDOMI Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025906", officialEmail: "rajdhaniasomi@gmail.com", pass: "Uddomi@2026", gstUsername: "Uddomiasomi", gstPass: "GstUddomi@2026", gstin: "18AABCA2024A123" },
  { slNo: 24, district: "Goalpara", block: "Kuchdhowa", name: "Angikar Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025927", officialEmail: "angikarasomi@gmail.com", pass: "Angikar@2026", gstUsername: "Angikarasomi", gstPass: "GstAngikar@2026", gstin: "18AABCA2024A124" },
  { slNo: 25, district: "Hailakandi", block: "Algapur", name: "NABACHETANA ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026348", officialEmail: "barniasomi@gmail.com", pass: "Nabachetana@2026", gstUsername: "Nabachetana_24", gstPass: "GstNabachetana@2026", gstin: "18AABCA2024A125" },
  { slNo: 26, district: "Hailakandi", block: "Hailakandi", name: "Utshahita Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026034", officialEmail: "utshahitaasomi@gmail.com", pass: "Utshahita@2026", gstUsername: "Utsahitaasomi24", gstPass: "GstUtshahita@2026", gstin: "18AABCA2024A126" },
  { slNo: 27, district: "Hailakandi", block: "Katlichera", name: "Prerakta Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025966", officialEmail: "SWANIRBHARASOMI@GMAIL.COM", pass: "Prerakta@2026", gstUsername: "Preraktaasomi", gstPass: "GstPrerakta@2026", gstin: "18AABCA2024A127" },
  { slNo: 28, district: "Hailakandi", block: "LALA", name: "PRAGATIKA ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026350", officialEmail: "krishisakhiasomi@gmail.com", pass: "Pragatika@2026", gstUsername: "PRAGATIKAASOMI", gstPass: "GstPragatika@2026", gstin: "18AABCA2024A128" },
  { slNo: 29, district: "Kamrup", block: "Boko", name: "Tambrong Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025977", officialEmail: "tambrongasomi@gmail.com", pass: "Tambrong@2026", gstUsername: "Tambrong_2024", gstPass: "GstTambrong@2026", gstin: "18AABCA2024A129" },
  { slNo: 30, district: "Kamrup", block: "Chayani Barduar", name: "Pobitora Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025923", officialEmail: "jagaranasomi1@gmail.com", pass: "Pobitora@2026", gstUsername: "Pobitoraasomi24", gstPass: "GstPobitora@2026", gstin: "18AABCA2024A130" },
  { slNo: 31, district: "Kamrup", block: "kamalpur", name: "Khatbhoni Asomi Mahila Farmers Producer Company Limited", cin: "U01113AS2024PTC026299", officialEmail: "saptarathiasomi@gmail.com", pass: "Khatbhoni@2026", gstUsername: "khatbhoniasomi", gstPass: "GstKhatbhoni@2026", gstin: "18AABCA2024A131" },
  { slNo: 32, district: "Kamrup", block: "Rampur", name: "Anudaan Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026202", officialEmail: "anudaanasomi@gmail.com", pass: "Anudaan@2026", gstUsername: "Swarnalata_1999", gstPass: "GstAnudaan@2026", gstin: "18AABCA2024A132" },
  { slNo: 33, district: "Kamrup", block: "Sualkuchi", name: "Dharitri Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025910", officialEmail: "DHARITRIASOMI@GMAIL.COM", pass: "Dharitri@2026", gstUsername: "Dharitriasomi", gstPass: "GstDharitri@2026", gstin: "18AABCA2024A133" },
  { slNo: 34, district: "Kamrup", block: "Bezera", name: "Syamali Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026029", officialEmail: "syamaliasomi@gmail.com", pass: "Syamali@2026", gstUsername: "saymaliasomi", gstPass: "GstSyamali@2026", gstin: "18AABCA2024A134" },
  { slNo: 35, district: "Kokrajhar", block: "Dotma", name: "FULUNG Mahila Kisan Producer Company Ltd.", cin: "U01113AS2024PTC026335", officialEmail: "Fulungsamridhi.23@gmail.com", pass: "Fulung@2026", gstUsername: "Fulungsamriddhi", gstPass: "GstFulung@2026", gstin: "18AABCA2024A135" },
  { slNo: 36, district: "Kokrajhar", block: "Dotma", name: "BUBLI Mahila Kisan Producer Company Ltd.", cin: "U01113AS2024PTC026336", officialEmail: "Bublisamridhi.23@gmail.com", pass: "Bubli@2026", gstUsername: "Bublisamriddhi", gstPass: "GstBubli@2026", gstin: "18AABCA2024A136" },
  { slNo: 37, district: "Kokrajhar", block: "Hatidhuara", name: "Abha Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026109", officialEmail: "abhaasomi@gmail.com", pass: "Abha@2026", gstUsername: "Abhaasomi", gstPass: "GstAbha@2026", gstin: "18AABCA2024A137" },
  { slNo: 38, district: "Lakhimpur", block: "Dhakuakhana", name: "Charikoria Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026001", officialEmail: "charikoriaasomi@gmail.com", pass: "Charikoria@2026", gstUsername: "charikoriaasomi", gstPass: "GstCharikoria@2026", gstin: "18AABCA2024A138" },
  { slNo: 39, district: "Lakhimpur", block: "FPC 1", name: "LI Sang Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026059", officialEmail: "lisangasomi@gmail.com", pass: "LiSang@2026", gstUsername: "lisangasomi_24", gstPass: "GstLiSang@2026", gstin: "18AABCA2024A139" },
  { slNo: 40, district: "Lakhimpur", block: "FPC 2", name: "Mejankori Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026088", officialEmail: "mejankoriasomi@gmail.com", pass: "Mejankori@2026", gstUsername: "Mejankoriasomi", gstPass: "GstMejankori@2026", gstin: "18AABCA2024A140" },
  { slNo: 41, district: "Lakhimpur", block: "Narayanpur", name: "Narayanpur Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025961", officialEmail: "narayanpurasomi@gmail.com", pass: "Narayanpur@2026", gstUsername: "Narayanpurasomi", gstPass: "GstNarayanpur@2026", gstin: "18AABCA2024A141" },
  { slNo: 42, district: "Morigaon", block: "Bhurabandha", name: "Bramhaputra Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025958", officialEmail: "BRAMHAPUTRAASOMI@GMAIL.COM", pass: "Bramhaputra@2026", gstUsername: "Bramhaputra_24", gstPass: "GstBramhaputra@2026", gstin: "18AABCA2024A142" },
  { slNo: 43, district: "Morigaon", block: "Kopili", name: "Rudali Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025960", officialEmail: "rudaliasomi@gmail.com", pass: "Rudali@2026", gstUsername: "Rudaliasomi", gstPass: "GstRudali@2026", gstin: "18AABCA2024A143" },
  { slNo: 44, district: "Morigaon", block: "Lahorighat", name: "SWABALAMBI Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026163", officialEmail: "seujiasomi@gmail.com", pass: "Swabalambi@2026", gstUsername: "Swabalambiasomi", gstPass: "GstSwabalambi@2026", gstin: "18AABCA2024A144" },
  { slNo: 45, district: "Nagaon", block: "Barhampur", name: "Mokrang Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026149", officialEmail: "mokrangasomi@gmail.com", pass: "Mokrang@2026", gstUsername: "mokrang_2026", gstPass: "GstMokrang@2026", gstin: "18AABCA2024A145" },
  { slNo: 46, district: "Nagaon", block: "Dalongghat", name: "Rosemary Asomi Mahila Farmers Producer Company Limited", cin: "U01113AS2024PTC026346", officialEmail: "Rosemaryasomi@gmail.com", pass: "Rosemary@2026", gstUsername: "Rosemaryasomi", gstPass: "GstRosemary@2026", gstin: "18AABCA2024A146" },
  { slNo: 47, district: "Nagaon", block: "Juria", name: "VIHANGAMA ASOMI MAHILA FARMERS PRODUCER COMPANY LIMITED", cin: "U01113AS2024PTC026347", officialEmail: "Juriaasomimahila@gmail.com", pass: "Vihangama@2026", gstUsername: "Vihangama_26", gstPass: "GstVihangama@2026", gstin: "18AABCA2024A147" },
  { slNo: 48, district: "Nagaon", block: "Kathaitoli", name: "Jugantori Asomi Mahila Farmers Producer Company Limited", cin: "U01113AS2024PTC026348", officialEmail: "Jugantoriasomi@gmail.com", pass: "Jugantori@2026", gstUsername: "Jugantoriasomi", gstPass: "GstJugantori@2026", gstin: "18AABCA2024A148" },
  { slNo: 49, district: "Nagaon", block: "Lawkhowa", name: "Lawkhowa Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025982", officialEmail: "lawkhowaasomi@gmail.com", pass: "Lawkhowa@2026", gstUsername: "Lawkhowaasomi", gstPass: "GstLawkhowa@2026", gstin: "18AABCA2024A149" },
  { slNo: 50, district: "Nagaon", block: "Raha", name: "Bakhraful Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026095", officialEmail: "bakhrafulasomi@gmail.com", pass: "Bakhraful@2026", gstUsername: "Bakhraful_2024", gstPass: "GstBakhraful@2026", gstin: "18AABCA2024A150" },
  { slNo: 51, district: "Nalbari", block: "Barkhetri", name: "Nabarup Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025880", officialEmail: "nabarupasomi@gmail.com", pass: "Nabarup@2026", gstUsername: "Nabarupasomi", gstPass: "GstNabarup@2026", gstin: "18AABCA2024A151" },
  { slNo: 52, district: "Nalbari", block: "Paschim Nalbari", name: "Kuhipaat Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026186", officialEmail: "kuhipatasomi@gmail.com", pass: "Kuhipaat@2026", gstUsername: "kuhipatasomi_24", gstPass: "GstKuhipaat@2026", gstin: "18AABCA2024A152" },
  { slNo: 53, district: "Sonitpur", block: "Balipara", name: "SOMAINA Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC025976", officialEmail: "somainaasomi@gmail.com", pass: "Somaina@2026", gstUsername: "somainaasomi", gstPass: "GstSomaina@2026", gstin: "18AABCA2024A153" },
  { slNo: 54, district: "Sonitpur", block: "Bihaguri", name: "UDBHOB Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026261", officialEmail: "nobudoyasomi@gmail.com", pass: "Udbhob@2026", gstUsername: "Udbhobasomi", gstPass: "GstUdbhob@2026", gstin: "18AABCA2024A154" },
  { slNo: 55, district: "Sonitpur", block: "Naduar", name: "Araidhya Asomi Mahila Farmers Producer Company Limited", cin: "U01113AS2024PTC026256", officialEmail: "araidhyaasomi@gmail.com", pass: "Araidhya@2026", gstUsername: "ARAIDHYAASOMI", gstPass: "GstAraidhya@2026", gstin: "18AABCA2024A155" },
  { slNo: 56, district: "Tinsukia", block: "Itakhuli", name: "Growers united Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026021", officialEmail: "growersunitedasomi@gmail.com", pass: "GrowersUnited@2026", gstUsername: "Growersasomi_24", gstPass: "GstGrowers@2026", gstin: "18AABCA2024A156" },
  { slNo: 57, district: "Tinsukia", block: "Kakopathar", name: "Farm2table Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026108", officialEmail: "farmtableasomi@gmail.com", pass: "Farm2Table@2026", gstUsername: "farm2table_2024", gstPass: "GstFarm2Table@2026", gstin: "18AABCA2024A157" },
  { slNo: 58, district: "Udalguri", block: "Bhergaon", name: "Okrang Samridhi Mahila Kisan Producer Company Ltd", cin: "U01113AS2024PTC026358", officialEmail: "okrangfpc@gmail.com", pass: "Okrang@2026", gstUsername: "okrangfpc", gstPass: "GstOkrang@2026", gstin: "18AABCA2024A158" },
  { slNo: 59, district: "Udalguri", block: "Rowta", name: "Udgamita Asomi Mahila farmers producer company limited", cin: "U01113AS2024PTC026158", officialEmail: "SANJIVNIASOMI@GMAIL.COM", pass: "Udgamita@2026", gstUsername: "udgamita_asomi", gstPass: "GstUdgamita@2026", gstin: "18AABCA2024A159" },
];

export function fpcCompany(row: string[]): Company {
  const [name, district, block, ceo, ceoMob, ceoEmail, acc, accMob, accEmail] = row;
  const c = newCompany(name, { district, block, ceo, ceoMob, ceoEmail, acc, accMob, accEmail });
  c.users.push({ id: uid(), name: fpcUsername(name), role: 'Admin', pass: FPC_PASS });
  return c;
}

function matchFPCMaster(companyName: string): FPCMasterUpdate | undefined {
  const un = fpcUsername(companyName);
  return UPDATED_FPC_MASTERS.find(m => {
    const mun = fpcUsername(m.name);
    return mun === un || m.name.toLowerCase().includes(un) || companyName.toLowerCase().includes(mun);
  });
}

export function seedFPCs(db: { companies: Company[]; active: string | null }): number {
  let n = 0;

  // 1. First seed any missing companies from SEED_FPCS
  const existingMap = new Map<string, Company>();
  db.companies.forEach(c => {
    const key = fpcUsername(c.name);
    if (key) existingMap.set(key, c);
  });

  SEED_FPCS.forEach(row => {
    const name = row[0];
    const key = fpcUsername(name);
    if (!existingMap.has(key)) {
      const newCo = fpcCompany(row);
      db.companies.push(newCo);
      existingMap.set(key, newCo);
      n++;
    }
  });

  // 2. Update all companies with new official Email, CIN, District, Block, Password, GST Username & GST Password
  db.companies.forEach(c => {
    const master = matchFPCMaster(c.name);
    if (master) {
      c.cin = master.cin || c.cin || '';
      c.gstin = master.gstin || c.gstin || `18AABCA2024A1${String(master.slNo).padStart(2, '0')}`;
      c.meta = c.meta || {};
      c.meta.cin = master.cin || c.meta.cin || '';
      c.meta.officialEmail = master.officialEmail;
      c.meta.district = master.district;
      c.meta.block = master.block;
      c.meta.pass = master.pass;
      c.meta.gstUsername = master.gstUsername || fpcUsername(c.name);
      c.meta.gstPass = master.gstPass || master.pass;
      c.meta.gstin = c.gstin;

      const username = fpcUsername(c.name);
      let user = c.users.find(u => u.name.toLowerCase() === username.toLowerCase());
      if (user) {
        user.pass = master.pass;
      } else {
        c.users.push({
          id: uid(),
          name: username,
          role: 'Admin',
          pass: master.pass,
        });
      }

      if (master.gstUsername && master.gstUsername.toLowerCase() !== username.toLowerCase()) {
        let gstUser = c.users.find(u => u.name.toLowerCase() === master.gstUsername?.toLowerCase());
        if (gstUser) {
          gstUser.pass = master.gstPass || master.pass;
        } else {
          c.users.push({
            id: uid(),
            name: master.gstUsername,
            role: 'Admin',
            pass: master.gstPass || master.pass,
          });
        }
      }
    }
  });

  return n;
}
