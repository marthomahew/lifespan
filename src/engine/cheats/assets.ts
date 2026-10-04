import {
  HOME_TYPE_BY_ID,
  HOME_TYPES,
  POSSESSIONS,
  POSSESSION_BY_ID,
  VEHICLES,
  VEHICLE_BY_ID,
} from '../../content/assets';
import { formatMoney, money } from '../economy';
import type { InvestKey } from '../types';
import { clampStat } from '../util';
import type { CheatDef } from './types';

const catalog = (): { value: string; label: string }[] => [
  ...HOME_TYPES.map((h) => ({ value: `home:${h.id}`, label: `${h.emoji} ${h.label}` })),
  ...VEHICLES.map((v) => ({ value: `vehicle:${v.id}`, label: `${v.emoji} ${v.label}` })),
  ...POSSESSIONS.map((p) => ({ value: `item:${p.id}`, label: `${p.emoji} ${p.label}` })),
];
const assetIds = (
  s: Parameters<NonNullable<CheatDef['isOn']>>[0],
): { value: string; label: string }[] => [
  ...s.assets.homes.map((h) => ({ value: String(h.id), label: `${h.id}: ${h.name}` })),
  ...s.assets.vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.id}: ${VEHICLE_BY_ID[v.model]?.label ?? v.model}`,
  })),
  ...s.assets.possessions.map((p) => ({
    value: String(p.id),
    label: `${p.id}: ${POSSESSION_BY_ID[p.item]?.label ?? p.item}`,
  })),
];

export const ASSET_CHEATS: CheatDef[] = [
  {
    id: 'asset.spawn',
    group: 'money',
    label: 'Spawn any asset',
    syntax: 'asset spawn {asset}',
    help: 'Get any home, vehicle, or item from the catalog for free. Example: asset spawn vehicle:meridian_gt',
    params: [{ name: 'asset', type: 'enum', options: catalog }],
    run: (ctx, p) => {
      const s = ctx.s;
      const [kind, id] = String(p['asset']).split(':');
      const aid = s.assets.nextAssetId++;
      if (kind === 'home') {
        const t = HOME_TYPE_BY_ID[id ?? ''];
        if (!t) return 'Unknown home';
        const value = money(s, t.price);
        s.assets.homes.push({
          id: aid,
          type: t.id,
          name: t.names[0] ?? t.label,
          value,
          paid: 0,
          condition: 90,
          bought: s.year,
          city: s.player.city,
          country: s.player.country,
          livingIn: !s.assets.homes.some((h) => h.livingIn),
        });
        if (s.player.age >= 18 && s.assets.housing !== 'prison' && s.assets.housing !== 'barracks')
          s.assets.housing = 'owning';
        return `Spawned ${t.label} (${aid})`;
      }
      if (kind === 'vehicle') {
        const v = VEHICLE_BY_ID[id ?? ''];
        if (!v) return 'Unknown vehicle';
        s.assets.vehicles.push({
          id: aid,
          model: v.id,
          value: money(s, v.price),
          paid: 0,
          condition: 100,
          bought: s.year,
        });
        return `Spawned ${v.label} (${aid})`;
      }
      const it = POSSESSION_BY_ID[id ?? ''];
      if (!it) return 'Unknown item';
      s.assets.possessions.push({
        id: aid,
        item: it.id,
        value: money(s, it.price),
        paid: 0,
        condition: 100,
        bought: s.year,
      });
      return `Spawned ${it.label} (${aid})`;
    },
  },
  {
    id: 'asset.value',
    group: 'money',
    label: "Set an asset's value",
    syntax: 'asset {id} value {amount}',
    help: 'Set the value of a home, vehicle, or item in local currency.',
    params: [
      { name: 'id', type: 'enum', options: assetIds },
      { name: 'amount', type: 'number', min: 0, max: 1e13 },
    ],
    run: (ctx, p) => {
      const id = Number(p['id']);
      const a = [...ctx.s.assets.homes, ...ctx.s.assets.vehicles, ...ctx.s.assets.possessions].find(
        (x) => x.id === id,
      );
      if (!a) return 'No such asset';
      a.value = Math.round(Number(p['amount']));
      return `Value: ${formatMoney(ctx.s, a.value)}`;
    },
  },
  {
    id: 'asset.condition',
    group: 'money',
    label: "Set an asset's condition",
    syntax: 'asset {id} condition {value}',
    help: 'Set condition 0–100.',
    params: [
      { name: 'id', type: 'enum', options: assetIds },
      { name: 'value', type: 'int', min: 0, max: 100 },
    ],
    run: (ctx, p) => {
      const id = Number(p['id']);
      const a = [...ctx.s.assets.homes, ...ctx.s.assets.vehicles, ...ctx.s.assets.possessions].find(
        (x) => x.id === id,
      );
      if (!a) return 'No such asset';
      a.condition = clampStat(Number(p['value']));
      return `Condition: ${a.condition}`;
    },
  },
  {
    id: 'invest.set',
    group: 'money',
    label: 'Set an investment value',
    syntax: 'invest set {fund} {amount}',
    help: 'Set the value held in bonds, index, growth, or coin.',
    params: [
      {
        name: 'fund',
        type: 'enum',
        options: () => ['bonds', 'index', 'growth', 'coin'].map((k) => ({ value: k, label: k })),
      },
      { name: 'amount', type: 'number', min: 0, max: 1e13 },
    ],
    run: (ctx, p) => {
      const k = p['fund'] as InvestKey;
      ctx.s.money.holdings[k] = Math.round(Number(p['amount']));
      return `${k}: ${formatMoney(ctx.s, ctx.s.money.holdings[k])}`;
    },
  },
  {
    id: 'salary.set',
    group: 'money',
    label: 'Set salary',
    syntax: 'salary {amount}',
    help: 'Set your yearly salary in local currency (needs a job).',
    params: [{ name: 'amount', type: 'number', min: 0, max: 1e12 }],
    run: (ctx, p) => {
      if (!ctx.s.career.jobId) return 'You have no job';
      ctx.s.career.salary = Math.round(Number(p['amount']));
      return `Salary: ${formatMoney(ctx.s, ctx.s.career.salary)}`;
    },
  },
];
