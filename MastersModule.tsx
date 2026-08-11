import React, { useState } from 'react';
import { Company } from '../types';
import { uid } from '../data/seedFPCs';

interface MastersModuleProps {
  co: Company;
  update: (fn: (c: Company) => void) => void;
  view: 'masters' | 'ledgers' | 'inventory' | 'assets';
}

export const MastersModule: React.FC<MastersModuleProps> = ({ co, update, view }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledgers' | 'groups' | 'items' | 'assets' | 'units' | 'godowns'>(
    view === 'inventory' ? 'items' : view === 'assets' ? 'assets' : 'ledgers'
  );

  // Edit / Add modal states
  const [editingLedger, setEditingLedger] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  // Form states for New / Edit
  const [ledName, setLedName] = useState('');
  const [ledGrp, setLedGrp] = useState('g_ie');
  const [ledOB, setLedOB] = useState('0');
  const [ledOBT, setLedOBT] = useState<'Dr' | 'Cr'>('Dr');
  const [ledGstin, setLedGstin] = useState('');
  const [ledMobile, setLedMobile] = useState('');

  const [itemName, setItemName] = useState('');
  const [itemUnit, setItemUnit] = useState('Qtl');
  const [itemHsn, setItemHsn] = useState('1006');
  const [itemGst, setItemGst] = useState('0');
  const [itemRate, setItemRate] = useState('0');
  const [itemOpenQty, setItemOpenQty] = useState('0');

  const [assetName, setAssetName] = useState('');
  const [assetCls, setAssetCls] = useState('Plant & Machinery');
  const [assetCost, setAssetCost] = useState('0');
  const [assetDate, setAssetDate] = useState('2025-04-01');

  const openEditLedger = (l?: any) => {
    if (l) {
      setEditingLedger(l);
      setLedName(l.name);
      setLedGrp(l.grp);
      setLedOB(String(l.ob || 0));
      setLedOBT(l.obt || 'Dr');
      setLedGstin(l.gstin || '');
      setLedMobile(l.mobile || '');
    } else {
      setEditingLedger('NEW');
      setLedName('');
      setLedGrp('g_ie');
      setLedOB('0');
      setLedOBT('Dr');
      setLedGstin('');
      setLedMobile('');
    }
  };

  const saveLedger = () => {
    if (!ledName.trim()) return;
    update(c => {
      if (editingLedger === 'NEW') {
        c.ledgers.push({
          id: uid(),
          name: ledName.trim(),
          grp: ledGrp,
          ob: +ledOB || 0,
          obt: ledOBT,
          gstin: ledGstin.trim(),
          mobile: ledMobile.trim(),
        });
      } else if (editingLedger?.id) {
        const l = c.ledgers.find(x => x.id === editingLedger.id);
        if (l) {
          l.name = ledName.trim();
          l.grp = ledGrp;
          l.ob = +ledOB || 0;
          l.obt = ledOBT;
          l.gstin = ledGstin.trim();
          l.mobile = ledMobile.trim();
        }
      }
    });
    setEditingLedger(null);
  };

  const openEditItem = (it?: any) => {
    if (it) {
      setEditingItem(it);
      setItemName(it.name);
      setItemUnit(it.unit);
      setItemHsn(it.hsn || '');
      setItemGst(String(it.gst || 0));
      setItemRate(String(it.rate || 0));
      setItemOpenQty(String(it.openingQty || 0));
    } else {
      setEditingItem('NEW');
      setItemName('');
      setItemUnit('Qtl');
      setItemHsn('1006');
      setItemGst('0');
      setItemRate('0');
      setItemOpenQty('0');
    }
  };

  const saveItem = () => {
    if (!itemName.trim()) return;
    update(c => {
      if (editingItem === 'NEW') {
        c.stockItems.push({
          id: uid(),
          name: itemName.trim(),
          unit: itemUnit,
          hsn: itemHsn.trim(),
          gst: +itemGst || 0,
          rate: +itemRate || 0,
          openingQty: +itemOpenQty || 0,
        });
      } else if (editingItem?.id) {
        const it = c.stockItems.find(x => x.id === editingItem.id);
        if (it) {
          it.name = itemName.trim();
          it.unit = itemUnit;
          it.hsn = itemHsn.trim();
          it.gst = +itemGst || 0;
          it.rate = +itemRate || 0;
          it.openingQty = +itemOpenQty || 0;
        }
      }
    });
    setEditingItem(null);
  };

  const openEditAsset = (ast?: any) => {
    if (ast) {
      setEditingAsset(ast);
      setAssetName(ast.name);
      setAssetCls(ast.cls);
      setAssetCost(String(ast.cost || 0));
      setAssetDate(ast.date || '2025-04-01');
    } else {
      setEditingAsset('NEW');
      setAssetName('');
      setAssetCls('Plant & Machinery');
      setAssetCost('0');
      setAssetDate('2025-04-01');
    }
  };

  const saveAsset = () => {
    if (!assetName.trim()) return;
    update(c => {
      if (editingAsset === 'NEW') {
        c.assets.push({
          id: uid(),
          name: assetName.trim(),
          cls: assetCls,
          cost: +assetCost || 0,
          date: assetDate,
          method: 'WDV',
        });
      } else if (editingAsset?.id) {
        const a = c.assets.find(x => x.id === editingAsset.id);
        if (a) {
          a.name = assetName.trim();
          a.cls = assetCls;
          a.cost = +assetCost || 0;
          a.date = assetDate;
        }
      }
    });
    setEditingAsset(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-100">🗂️ Accounting Masters &amp; Inventory Management</h2>
          <p className="text-xs text-slate-400">
            Create, Edit &amp; Configure Ledgers, Groups, Stock Items, Fixed Assets &amp; Units
          </p>
        </div>

        <div className="flex gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('ledgers')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'ledgers' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Ledgers ({co.ledgers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('items')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'items' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Stock Items ({co.stockItems.length})
          </button>
          <button
            onClick={() => setActiveSubTab('assets')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'assets' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Fixed Assets ({co.assets.length})
          </button>
          <button
            onClick={() => setActiveSubTab('groups')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeSubTab === 'groups' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Groups ({co.groups.length})
          </button>
        </div>
      </div>

      {/* LEDGERS SUBTAB */}
      {activeSubTab === 'ledgers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Ledger Accounts Master</h3>
            <button
              onClick={() => openEditLedger()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium"
            >
              ➕ Create New Ledger
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Ledger Name</th>
                  <th className="py-2.5 px-3">Under Group</th>
                  <th className="py-2.5 px-3">GSTIN / Mobile</th>
                  <th className="py-2.5 px-3 text-right">Opening Balance</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.ledgers.map(l => {
                  const grpName = co.groups.find(g => g.id === l.grp)?.name || l.grp;
                  return (
                    <tr key={l.id} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-medium text-slate-200">{l.name}</td>
                      <td className="py-2.5 px-3 text-slate-400">{grpName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {l.gstin ? <span className="text-blue-400 font-bold">{l.gstin}</span> : null}
                        {l.mobile ? <span className="ml-2 text-slate-300">📱 {l.mobile}</span> : null}
                        {!l.gstin && !l.mobile ? '—' : null}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        {l.ob ? `₹${l.ob.toLocaleString('en-IN')} ${l.obt}` : '₹0.00'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => openEditLedger(l)}
                          className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded text-xs"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STOCK ITEMS SUBTAB */}
      {activeSubTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Inventory Stock Items Master</h3>
            <button
              onClick={() => openEditItem()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium"
            >
              ➕ Create Stock Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Item Name</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3 font-mono">HSN Code</th>
                  <th className="py-2.5 px-3 text-right">GST %</th>
                  <th className="py-2.5 px-3 text-right">Master Rate ₹</th>
                  <th className="py-2.5 px-3 text-right">Opening Qty</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.stockItems.map(it => (
                  <tr key={it.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{it.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{it.unit}</td>
                    <td className="py-2.5 px-3 font-mono text-blue-400">{it.hsn || '1006'}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{it.gst}%</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-100">₹{it.rate}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{it.openingQty}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEditItem(it)}
                        className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded text-xs"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FIXED ASSETS SUBTAB */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Fixed Asset Master (FAR)</h3>
            <button
              onClick={() => openEditAsset()}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-medium"
            >
              ➕ Register Fixed Asset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Asset Description</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Acquisition Date</th>
                  <th className="py-2.5 px-3 text-right">Cost Price ₹</th>
                  <th className="py-2.5 px-3 text-right">Depreciation Method</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {co.assets.map(ast => (
                  <tr key={ast.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-medium text-slate-200">{ast.name}</td>
                    <td className="py-2.5 px-3 text-slate-400">{ast.cls}</td>
                    <td className="py-2.5 px-3 text-slate-300">{ast.date}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                      ₹{ast.cost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400">{ast.method || 'WDV'}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => openEditAsset(ast)}
                        className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-2.5 py-1 rounded text-xs"
                      >
                        ✏️ Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GROUPS SUBTAB */}
      {activeSubTab === 'groups' && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Primary Account Groups (20 Core Groups)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {co.groups.map(g => (
              <div key={g.id} className="p-3 bg-slate-800/40 border border-slate-800 rounded-lg text-xs space-y-1">
                <div className="font-bold text-slate-200">{g.name}</div>
                <div className="text-slate-400 flex justify-between">
                  <span>Nature: {g.nat}</span>
                  <span className="font-mono text-blue-400">{g.side}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LEDGER EDIT MODAL */}
      {editingLedger && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">
              {editingLedger === 'NEW' ? 'Create Ledger' : 'Edit Ledger'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ledger Name</label>
                <input
                  value={ledName}
                  onChange={e => setLedName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Under Group</label>
                <select
                  value={ledGrp}
                  onChange={e => setLedGrp(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                >
                  {co.groups.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Opening Balance ₹</label>
                  <input
                    type="number"
                    value={ledOB}
                    onChange={e => setLedOB(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Dr / Cr</label>
                  <select
                    value={ledOBT}
                    onChange={e => setLedOBT(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    <option value="Dr">Dr</option>
                    <option value="Cr">Cr</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">GSTIN</label>
                  <input
                    value={ledGstin}
                    onChange={e => setLedGstin(e.target.value)}
                    placeholder="15-digit GSTIN"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mobile No.</label>
                  <input
                    value={ledMobile}
                    onChange={e => setLedMobile(e.target.value)}
                    placeholder="10-digit Mobile"
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingLedger(null)} className="px-3 py-1.5 text-xs text-slate-400">
                Cancel
              </button>
              <button onClick={saveLedger} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium">
                Save Ledger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STOCK ITEM EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">
              {editingItem === 'NEW' ? 'Create Stock Item' : 'Edit Stock Item'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Item Name</label>
                <input
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Unit</label>
                  <input
                    value={itemUnit}
                    onChange={e => setItemUnit(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Master Rate ₹</label>
                  <input
                    type="number"
                    value={itemRate}
                    onChange={e => setItemRate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">HSN Code</label>
                  <input
                    value={itemHsn}
                    onChange={e => setItemHsn(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GST %</label>
                  <input
                    type="number"
                    value={itemGst}
                    onChange={e => setItemGst(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Opening Qty</label>
                  <input
                    type="number"
                    value={itemOpenQty}
                    onChange={e => setItemOpenQty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingItem(null)} className="px-3 py-1.5 text-xs text-slate-400">
                Cancel
              </button>
              <button onClick={saveItem} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium">
                Save Stock Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIXED ASSET EDIT MODAL */}
      {editingAsset && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4">
            <h3 className="text-sm font-bold text-slate-100">
              {editingAsset === 'NEW' ? 'Register Fixed Asset' : 'Edit Asset'}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Asset Description</label>
                <input
                  value={assetName}
                  onChange={e => setAssetName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Classification</label>
                <input
                  value={assetCls}
                  onChange={e => setAssetCls(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Cost Price ₹</label>
                  <input
                    type="number"
                    value={assetCost}
                    onChange={e => setAssetCost(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Acquisition Date</label>
                  <input
                    type="date"
                    value={assetDate}
                    onChange={e => setAssetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingAsset(null)} className="px-3 py-1.5 text-xs text-slate-400">
                Cancel
              </button>
              <button onClick={saveAsset} className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs font-medium">
                Save Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
