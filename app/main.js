import { deals, comparisons } from './data.js';
import { listPage, resultsView, dealPage, notFound, dateTime } from './views.js';

const app = document.getElementById('app');
const summaryEl = document.getElementById('summary');
const DEFAULTS = { q: '', cat: '', store: '', min: '0', sort: 'discount', verdict: '' };
const RANK = { 'NEW LOW': 0, 'STRONG DEAL': 1, 'ROUTINE SALE': 2, 'INFLATED': 3 };

let state = { ...DEFAULTS };

const pct = (d) => Math.round((1 - d.price / d.was) * 100);
const ts = (d) => Date.parse(d.checked) || 0;

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const i = raw.indexOf('?');
  const path = i < 0 ? raw : raw.slice(0, i);
  const params = new URLSearchParams(i < 0 ? '' : raw.slice(i + 1));
  const s = { ...DEFAULTS };
  for (const k of Object.keys(DEFAULTS)) if (params.has(k)) s[k] = params.get(k);
  return { path, state: s };
}

function writeHash() {
  const p = new URLSearchParams();
  for (const k of Object.keys(DEFAULTS)) if (state[k] !== DEFAULTS[k]) p.set(k, state[k]);
  const qs = p.toString();
  history.replaceState(null, '', '#/' + (qs ? '?' + qs : ''));
}

function applyFilters() {
  const q = state.q.trim().toLowerCase();
  const min = Number(state.min) || 0;
  const out = deals.filter((d) =>
    (!q || [d.title, d.store, d.category].some((v) => String(v).toLowerCase().includes(q))) &&
    (!state.cat || d.category === state.cat) &&
    (!state.store || d.store === state.store) &&
    (!state.verdict || d.verdict === state.verdict) &&
    pct(d) >= min);
  const by = {
    discount: (a, b) => pct(b) - pct(a),
    verdict: (a, b) => (RANK[a.verdict] - RANK[b.verdict]) || (pct(b) - pct(a)),
    price: (a, b) => a.price - b.price,
    newest: (a, b) => ts(b) - ts(a),
  };
  return out.sort(by[state.sort] || by.discount);
}

function updateSummary() {
  if (!deals.length) { summaryEl.textContent = 'Deals are being checked.'; return; }
  const times = deals.map(ts).filter(Boolean).sort((a, b) => a - b);
  const day = (t) => dateTime(new Date(t).toISOString()).replace(/,\s*\d+:\d+\s*[AP]M UTC$/, '');
  const range = times.length
    ? (day(times[0]) === day(times[times.length - 1]) ? day(times[0]) : `${day(times[0])} to ${day(times[times.length - 1])}`)
    : '';
  summaryEl.textContent = `${deals.length} deals · prices checked ${range} (UTC)`;
}

function renderList() {
  app.innerHTML = listPage({ all: deals, filtered: applyFilters(), comparisons, state });
  document.title = 'Deal Beacon — Black Friday deal finder';
}

function updateResults() {
  const box = document.getElementById('results');
  if (box) box.innerHTML = resultsView(applyFilters(), deals.length);
}

function render() {
  window.__shotReady = false;
  const { path, state: s } = parseHash();
  const m = path.match(/^\/deal\/(.+)$/);
  if (m) {
    let id = m[1];
    try { id = decodeURIComponent(id); } catch { /* keep raw id */ }
    const deal = deals.find((d) => d.id === id);
    app.innerHTML = deal ? dealPage(deal, deals) : notFound();
    document.title = deal ? `${deal.title} — Deal Beacon` : 'Deal Beacon — Black Friday deal finder';
    window.scrollTo(0, 0);
  } else {
    state = s;
    renderList();
  }
  updateSummary();
  window.__shotReady = true;
}

app.addEventListener('input', (e) => {
  const el = e.target;
  if (!el.closest || !el.closest('#controls') || !(el.name in DEFAULTS)) return;
  state[el.name] = el.value;
  writeHash();
  updateResults();
});

app.addEventListener('submit', (e) => e.preventDefault());

app.addEventListener('click', (e) => {
  const btn = e.target.closest && e.target.closest('[data-action="clear"]');
  if (!btn) return;
  state = { ...DEFAULTS };
  writeHash();
  renderList();
});

window.addEventListener('hashchange', render);
render();
