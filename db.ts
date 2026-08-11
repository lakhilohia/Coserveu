import { AppDatabase, Company } from '../types';
import { seedFPCs } from '../data/seedFPCs';
import { INITIAL_BACKUP } from '../data/initialBackup';
import { resolveTallyGroup, sanitizeVouchers } from './tallyImporter';

const LS_KEY = 'sahajledger_db_v1';
const LIC_KEY = 'coservu_license_v1';
const PREMIUM_KEY = 'coservu_premium_v1';

export function normalizeDB(db: any): AppDatabase {
  if (!db || !Array.isArray(db.companies)) return db;
  db.companies.sort((a: any, b: any) => (a.name || '').localeCompare(b.name || ''));
  db.companies.forEach((co: any) => {
    if (co.ledgers && Array.isArray(co.ledgers)) {
      co.ledgers.forEach((l: any) => {
        l.ob = +l.ob || 0;
        // Auto-fix misclassified ledger groups
        const correctGrp = resolveTallyGroup('', l.name);
        if (l.grp === 'g_dr' || l.grp === 'g_ii' || l.grp === 'g_di') {
          if (correctGrp === 'g_ie' || correctGrp === 'g_de' || correctGrp === 'g_fa' || correctGrp === 'g_pur') {
            l.grp = correctGrp;
          }
        }
      });
    }
    if (co.vouchers && Array.isArray(co.vouchers) && co.ledgers && Array.isArray(co.ledgers)) {
      co.vouchers.forEach((v: any) => {
        if (v.entries && Array.isArray(v.entries)) {
          v.entries.forEach((e: any) => {
            e.dr = +e.dr || 0;
            e.cr = +e.cr || 0;
          });
        }
        if (v.inv && Array.isArray(v.inv)) {
          v.inv.forEach((i: any) => {
            i.qty = +i.qty || 0;
            i.rate = +i.rate || 0;
          });
        }
      });
      co.vouchers = sanitizeVouchers(co.vouchers, co.ledgers);
    }
    if (co.msme && Array.isArray(co.msme)) {
      co.msme.forEach((m: any) => {
        m.amount = +m.amount || 0;
      });
    }
  });
  return db as AppDatabase;
}

export function loadDB(): AppDatabase {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (d && d.companies && d.companies.length > 0) {
        // Merge initial backup vouchers / ledgers / items / observations if missing in local storage
        INITIAL_BACKUP.companies.forEach((bCo: any) => {
          let co = d.companies.find((c: Company) => c.id === bCo.id || c.name === bCo.name);
          if (!co) {
            d.companies.push(JSON.parse(JSON.stringify(bCo)));
          } else {
            // Merge vouchers
            if (bCo.vouchers && bCo.vouchers.length > 0) {
              const existingVids = new Set(co.vouchers.map((v: any) => v.id));
              bCo.vouchers.forEach((v: any) => {
                if (!existingVids.has(v.id)) {
                  co.vouchers.push(JSON.parse(JSON.stringify(v)));
                }
              });
            }
            // Merge ledgers
            if (bCo.ledgers && bCo.ledgers.length > 0) {
              const existingLeds = new Set(co.ledgers.map((l: any) => l.id));
              bCo.ledgers.forEach((l: any) => {
                if (!existingLeds.has(l.id)) {
                  co.ledgers.push(JSON.parse(JSON.stringify(l)));
                }
              });
            }
            // Merge stock items
            if (bCo.stockItems && bCo.stockItems.length > 0) {
              const existingItems = new Set(co.stockItems.map((s: any) => s.id));
              bCo.stockItems.forEach((s: any) => {
                if (!existingItems.has(s.id)) {
                  co.stockItems.push(JSON.parse(JSON.stringify(s)));
                }
              });
            }
            // Merge observations
            if (bCo.observations && bCo.observations.length > 0) {
              co.observations = co.observations || [];
              const existingObs = new Set(co.observations.map((o: any) => o.id));
              bCo.observations.forEach((o: any) => {
                if (!existingObs.has(o.id)) {
                  co.observations.push(JSON.parse(JSON.stringify(o)));
                }
              });
            }
            // Merge MSME
            if (bCo.msme && bCo.msme.length > 0 && (!co.msme || co.msme.length === 0)) {
              co.msme = JSON.parse(JSON.stringify(bCo.msme));
            }
          }
        });

        seedFPCs(d);
        normalizeDB(d);
        if (typeof d.visitorCount !== 'number' || d.visitorCount === 1482) d.visitorCount = 0;
        if (!Array.isArray(d.visitorLogs)) d.visitorLogs = [];
        if (!Array.isArray(d.loginRegister)) {
          d.loginRegister = [
            {
              id: 'log_init1',
              username: 'admin',
              personName: 'System Administrator',
              contactNumber: '+91 98765 43210',
              role: 'Admin',
              companyName: d.companies[0]?.name || 'Agri-Accounting Suite',
              timestamp: new Date(Date.now() - 3600000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
              status: 'Success',
              loginType: 'Demo',
              ipAddress: '127.0.0.1 (System Session)',
              region: 'Assam (Guwahati)'
            },
            {
              id: 'log_init2',
              username: 'domainexpert',
              personName: 'CA Domain Expert',
              contactNumber: '+91 98100 12345',
              role: 'Domain Expert',
              companyName: d.companies[0]?.name || 'Agri-Accounting Suite',
              timestamp: new Date(Date.now() - 7200000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
              status: 'Success',
              loginType: 'Standard',
              ipAddress: '127.0.0.1 (Web Access)',
              region: 'Assam (Jorhat)'
            }
          ];
        }
        saveDB(d);
        return d;
      }
    }
  } catch (e) {
    console.error('Error loading DB from localStorage:', e);
  }

  const db: AppDatabase = JSON.parse(JSON.stringify(INITIAL_BACKUP));
  seedFPCs(db);
  normalizeDB(db);
  db.visitorCount = 0;
  db.visitorLogs = [];
  db.loginRegister = [
    {
      id: 'log_init1',
      username: 'admin',
      personName: 'System Administrator',
      contactNumber: '+91 98765 43210',
      role: 'Admin',
      companyName: db.companies[0]?.name || 'Agri-Accounting Suite',
      timestamp: new Date(Date.now() - 3600000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
      status: 'Success',
      loginType: 'Demo',
      ipAddress: '127.0.0.1 (System Session)',
      region: 'Assam (Guwahati)'
    },
    {
      id: 'log_init2',
      username: 'domainexpert',
      personName: 'CA Domain Expert',
      contactNumber: '+91 98100 12345',
      role: 'Domain Expert',
      companyName: db.companies[0]?.name || 'Agri-Accounting Suite',
      timestamp: new Date(Date.now() - 7200000).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }),
      status: 'Success',
      loginType: 'Standard',
      ipAddress: '127.0.0.1 (Web Access)',
      region: 'Assam (Jorhat)'
    }
  ];
  if (db.companies.length > 0 && !db.active) {
    db.active = db.companies[0].id;
  }
  saveDB(db);
  return db;
}

export function saveDB(db: AppDatabase): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save DB to localStorage', e);
  }
}

/* IndexedDB storage for large files & attachments */
export function idbOpen(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('coservu_files', 1);
    r.onupgradeneeded = () => {
      if (!r.result.objectStoreNames.contains('att')) {
        r.result.createObjectStore('att');
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

export async function idbPut(key: string, val: any): Promise<void> {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const t = db.transaction('att', 'readwrite');
    t.objectStore('att').put(val, key);
    t.oncomplete = () => res();
    t.onerror = () => rej(t.error);
  });
}

export async function idbGet(key: string): Promise<any> {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const t = db.transaction('att', 'readonly');
    const rq = t.objectStore('att').get(key);
    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}

export function loadLicense() {
  try {
    const l = JSON.parse(localStorage.getItem(LIC_KEY) || '');
    if (l) return l;
  } catch (e) {}
  const d = new Date();
  d.setDate(d.getDate() + 365); // 1 year free
  const nl = { paidUntil: d.toISOString(), trial: true, startedAt: new Date().toISOString() };
  try {
    localStorage.setItem(LIC_KEY, JSON.stringify(nl));
  } catch (e) {}
  return nl;
}

export function saveLicense(l: any) {
  try {
    localStorage.setItem(LIC_KEY, JSON.stringify(l));
  } catch (e) {}
}

export function licenseDaysLeft(l: any) {
  if (!l || !l.paidUntil) return 0;
  return Math.ceil((new Date(l.paidUntil).getTime() - new Date().getTime()) / 86400000);
}

export function loadPremium() {
  try {
    return JSON.parse(localStorage.getItem(PREMIUM_KEY) || '');
  } catch (e) {
    return null;
  }
}

export function savePremium(l: any) {
  try {
    localStorage.setItem(PREMIUM_KEY, JSON.stringify(l));
  } catch (e) {}
}

export function premiumDaysLeft(l: any) {
  if (!l || !l.until) return 0;
  return Math.ceil((new Date(l.until).getTime() - new Date().getTime()) / 86400000);
}
