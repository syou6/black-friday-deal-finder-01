// Deal Beacon views: pure functions returning HTML strings.
// Every data value passes through esc() before reaching markup.

export const VERDICTS = ['NEW LOW', 'STRONG DEAL', 'ROUTINE SALE', 'INFLATED'];

const VERDICT_TEXT = {
  'NEW LOW': 'The lowest price we could find in the price history.',
  'STRONG DEAL': 'Clearly below the usual price, though not a record low.',
  'ROUTINE SALE': 'A normal sale price that this product hits fairly often.',
  'INFLATED': 'The "usual price" looks padded, so the discount is not what it seems.',
};

export function esc(v) {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const moneyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2,
});
export const money = (n) => moneyFmt.format(Number(n) || 0);

const dateFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
});
export const dateTime = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? esc(iso) : dateFmt.format(d) + ' UTC';
};

const dayFmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric',
});
export const dateDay = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? esc(iso) : dayFmt.format(d);
};

export const discountPct = (d) => Math.round((1 - d.price / d.was) * 100);
const slug = (v) => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-');
const safeUrl = (u) => {
  try {
    return new URL(String(u)).protocol === 'https:' ? esc(u) : '#';
  } catch {
    return '#';
  }
};
const dealHref = (d) => '#/deal/' + encodeURIComponent(d.id);

export const badge = (verdict) =>
  `<span class="badge v-${slug(verdict)}">${esc(verdict)}</span>`;

const storeLink = (d, cls = 'btn') =>
  `<a class="${cls}" href="${safeUrl(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)}</a>`;

const wasNote = (d) => (d.wasNote ? ` <span class="was-note">${esc(d.wasNote)}</span>` : '');

// Display-only short names for the grid card line; detail page keeps the full source.
const SOURCE_SHORT = {
  'The Verge Black Friday guide': 'The Verge',
  'CNN Underscored beauty guide': 'CNN Underscored',
  'TheTechHacker (Best Buy store page)': 'TheTechHacker',
};
const shortSource = (s) => SOURCE_SHORT[s] || s;

export function dealCard(d) {
  return `<article class="card">
  <div class="card-top">${badge(d.verdict)}<span class="pct">${discountPct(d)}% off</span></div>
  <h3 class="card-title"><a href="${dealHref(d)}">${esc(d.title)}</a></h3>
  <p class="meta">${esc(d.store)} · ${esc(d.category)}</p>
  <p class="price"><strong>${money(d.price)}</strong> <s>${money(d.was)}</s>${wasNote(d)}</p>
  <p class="save">You save ${money(d.was - d.price)}</p>
  ${d.drop ? `<p class="drop">▼ ${esc(d.drop)}</p>` : ''}${d.ends ? `<p class="ends">Sale ends ${esc(d.ends)}</p>` : ''}
  <p class="small checked" title="${esc(d.source)}">Checked ${dateTime(d.checked)} · ${esc(shortSource(d.source))}</p>
  ${d.code ? `<p class="code">Code / condition: <b>${esc(d.code)}</b></p>` : ''}
  ${storeLink(d)}
</article>`;
}

export function methodStrip() {
  return `<section class="method" aria-labelledby="method-h"><h2 id="method-h">How we check</h2>
    <p>Every price was read on Nov 28, 2026 at the named store or a named deals source (CNN Underscored, The Verge, Android Authority, DealNews, MacRumors, Gizmodo). Was prices are the source's stated list price, or worked out from a stated discount. Prices move hourly and stock sells out — verify at the store before you buy.</p></section>`;
}

export function comparePage(comparisons) {
  const list = comparisons || [];
  const cards = list.map((c) => {
    const low = Math.min(...c.entries.map((e) => e.price));
    const rows = c.entries.map((e) => `<tr${e.price === low ? ' class="cheapest"' : ''}>
        <td>${esc(e.store)}${e.price === low ? ' <span class="tag">Lowest</span>' : ''}${e.cond ? `<br><span class="small">${esc(e.cond)}</span>` : ''}</td>
        <td class="num">${money(e.price)}</td>
        <td><a href="${safeUrl(e.url)}" target="_blank" rel="noopener">View at ${esc(e.store)}</a></td></tr>`).join('');
    return `<article class="cmp-card"><h3>${esc(c.product)}</h3>
      <table><thead><tr><th>Store</th><th class="num">Price</th><th>Link</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="cmp-note">${esc(c.note)}</p>
      <p class="small">Checked ${dateTime(c.entries[0].checked)}</p></article>`;
  }).join('');
  return `<div class="compare-page"><a class="back" href="#/">← All deals</a>
    <h1>Same product, compared — all ${list.length}</h1>
    <div class="cmp-grid">${cards}</div>
    ${methodStrip()}</div>`;
}

export function compareSection(allComparisons) {
  if (!allComparisons || !allComparisons.length) return '';
  const comparisons = allComparisons.slice(0, 4);
  const cards = comparisons.map((c) => {
    const low = Math.min(...c.entries.map((e) => e.price));
    const lowEntry = c.entries.find((e) => e.price === low);
    const others = c.entries.filter((e) => e !== lowEntry);
    const otherParts = others.map((e) => ` · ${esc(e.store)} ${money(e.price)}`).join('');
    const save = others.length ? Math.max(...others.map((e) => e.price)) - low : 0;
    return `<div class="compare-card"><h3 title="${esc(c.product)}">${esc(c.product)}</h3>
      <p class="cmp-line"><b>${esc(lowEntry.store)} ${money(low)}</b> <span class="tag">★ Lowest</span>${otherParts} · <span class="cmp-save">Save ${money(save)}</span></p></div>`;
  }).join('');
  const checked = comparisons[0].entries[0].checked;
  return `<section class="compare" aria-labelledby="cmp-h"><h2 id="cmp-h">Same product, compared</h2>
    <a class="cmp-all" href="#/compare">See all ${allComparisons.length} comparisons</a>
    <p class="small cmp-checked">Prices checked ${dateDay(checked)} (UTC).</p>
    <div class="compare-grid">${cards}</div></section>`;
}

export function verdictLegend() {
  const items = VERDICTS.map((v) => `<li>${badge(v)} <span>${esc(VERDICT_TEXT[v])}</span></li>`).join('');
  return `<section class="legend" aria-labelledby="leg-h"><h2 id="leg-h">What the verdicts mean</h2><ul>${items}</ul></section>`;
}

const clearBtn = '<button type="button" class="btn-ghost" data-action="clear">Clear filters</button>';

// Count line + grid (or empty state). Re-rendered on every filter change.
export function resultsView(filtered, total) {
  const count = `<p class="count" aria-live="polite">Showing ${filtered.length} of ${total} deals</p>`;
  if (!filtered.length) {
    return `${count}<div class="empty"><p>No deals match these filters.</p>${clearBtn}</div>`;
  }
  return `${count}<div class="grid">${filtered.map(dealCard).join('')}</div>`;
}

const uniq = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b));

function select(id, label, options, value) {
  const opts = options.map(([v, t]) =>
    `<option value="${esc(v)}"${String(v) === String(value) ? ' selected' : ''}>${esc(t)}</option>`).join('');
  return `<label class="field" for="${id}"><span>${label}</span><select id="${id}" name="${id}">${opts}</select></label>`;
}

export function listPage({ all, filtered, comparisons, state }) {
  if (!all.length) {
    return '<div class="empty"><p>Deals are being checked — check back soon.</p></div>';
  }
  const controls = `<form class="controls" id="controls" role="search">
    <label class="field grow" for="q"><span>Search</span>
      <input id="q" name="q" type="search" placeholder="Title, store or category" value="${esc(state.q)}" autocomplete="off"></label>
    ${select('cat', 'Category', [['', 'All'], ...uniq(all.map((d) => d.category)).map((c) => [c, c])], state.cat)}
    ${select('store', 'Store', [['', 'All'], ...uniq(all.map((d) => d.store)).map((s) => [s, s])], state.store)}
    ${select('min', 'Min discount', [['0', 'Any'], ['20', '20%+'], ['30', '30%+'], ['40', '40%+'], ['50', '50%+']], state.min)}
    ${select('sort', 'Sort by', [['discount', 'Biggest % off'], ['verdict', 'Best verdict'], ['price', 'Lowest price'], ['newest', 'Newest checked']], state.sort)}
    ${select('verdict', 'Verdict', [['', 'All'], ...VERDICTS.map((v) => [v, v])], state.verdict)}
    ${clearBtn}
  </form>`;
  return `${controls}${compareSection(comparisons)}<div id="results">${resultsView(filtered, all.length)}</div>${methodStrip()}${verdictLegend()}`;
}

export function dealPage(d, all) {
  const more = all.filter((o) => o.category === d.category && o.id !== d.id).slice(0, 4);
  const moreHtml = more.length
    ? `<section class="more"><h2>More deals like this</h2><ul>${more.map((o) => `<li>
        <a href="${dealHref(o)}">${esc(o.title)}</a>
        <span class="small">${esc(o.store)} · ${money(o.price)} <s>${money(o.was)}</s> · ${discountPct(o)}% off</span></li>`).join('')}</ul></section>`
    : '';
  return `<article class="detail">
  <a class="back" href="#/">← All deals</a>
  <h1>${esc(d.title)}</h1>
  <div class="verdict-box">${badge(d.verdict)}<p>${esc(d.evidence)}</p></div>
  <p class="meta">${esc(d.store)} · ${esc(d.category)}</p>
  <div class="price-panel">
    <div><span class="lbl">Sale price</span><strong class="big">${money(d.price)}</strong></div>
    <div><span class="lbl">Usual price</span><s class="was">${money(d.was)}</s>${wasNote(d)}</div>
    <div><span class="lbl">Discount</span><span class="pct">${discountPct(d)}% off</span></div>
    <div><span class="lbl">You save</span><strong class="save-amt">${money(d.was - d.price)}</strong></div>
  </div>
  <p class="small">Checked ${dateTime(d.checked)}</p>
  <p class="small">Price read at: ${esc(d.source)}</p>
  ${d.code ? `<p class="code">Code / condition: <b>${esc(d.code)}</b></p>` : ''}
  ${storeLink(d, 'btn btn-big')}
  ${moreHtml}
</article>`;
}

export function notFound() {
  return '<div class="empty"><p>We could not find that deal.</p><a class="back" href="#/">← All deals</a></div>';
}
