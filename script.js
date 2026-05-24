let primaryDeadline = null;
let allDeadlines = [];
let lastSec = -1;

function pad(n) { return String(n).padStart(2, '0'); }

function flick(el) {
  el.classList.remove('flick');
  void el.offsetWidth;
  el.classList.add('flick');
}

function formatCompact(diff) {
  if (diff <= 0) return 'passed';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDateBadge(date) {
  const day  = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const d    = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return `${day} · ${d} · ${time}`;
}

function formatShortDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    + ' · '
    + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function tick() {
  if (!primaryDeadline) return;

  const now    = new Date();
  const target = primaryDeadline._date;
  const origin = primaryDeadline._start;
  const diff   = target - now;
  const total  = target - origin;

  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id =>
      document.getElementById(id).textContent = '00'
    );
    document.getElementById('progress').style.width = '100%';
    document.getElementById('pct-label').textContent = '100%';
    document.getElementById('status').innerHTML = '<span>Deadline reached!</span>';
    document.getElementById('app').classList.add('done');
    updateSecondaryList();
    return;
  }

  document.getElementById('app').classList.remove('done');

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  document.getElementById('days').textContent    = pad(d);
  document.getElementById('hours').textContent   = pad(h);
  document.getElementById('minutes').textContent = pad(m);

  const secEl = document.getElementById('seconds');
  if (s !== lastSec) {
    secEl.textContent = pad(s);
    flick(secEl);
    lastSec = s;
  }

  const elapsed = total - diff;
  const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
  document.getElementById('progress').style.width = pct.toFixed(3) + '%';
  document.getElementById('pct-label').textContent = pct.toFixed(1) + '%';

  const totalMins = d * 1440 + h * 60 + m;
  document.getElementById('status').innerHTML =
    `<span>${totalMins.toLocaleString()}</span> minutes remaining &mdash; make them count.`;

  updateSecondaryList();
}

function updateSecondaryList() {
  const now = new Date();
  document.querySelectorAll('.deadline-remaining').forEach(el => {
    const diff = Number(el.dataset.target) - now;
    el.textContent = formatCompact(diff);
  });
}

function renderHeader(deadline) {
  document.getElementById('main-title').innerHTML =
    `<em>${deadline.name}</em>` + (deadline.label ? ` <span class="title-label">${deadline.label}</span>` : '');
  document.getElementById('main-date').textContent = formatDateBadge(deadline._date);
  document.getElementById('progress-start').textContent =
    deadline._start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function renderSecondaryDeadlines(deadlines) {
  const section = document.getElementById('deadlines-section');
  const list    = document.getElementById('deadlines-list');

  if (deadlines.length === 0) { section.style.display = 'none'; return; }
  section.style.display = '';
  list.innerHTML = '';

  const now = new Date();
  deadlines.forEach(dl => {
    const diff = dl._date - now;
    const item = document.createElement('div');
    item.className = 'deadline-item' + (diff < 0 ? ' past' : '');
    item.innerHTML = `
      <div class="deadline-info">
        <span class="deadline-name">${dl.name}</span>
        ${dl.label ? `<span class="deadline-label">${dl.label}</span>` : ''}
      </div>
      <div class="deadline-meta">
        <span class="deadline-remaining" data-target="${dl._date.getTime()}">${formatCompact(diff)}</span>
        <span class="deadline-date">${formatShortDate(dl._date)}</span>
      </div>`;
    list.appendChild(item);
  });
}

async function init() {
  try {
    if (!window.DEADLINES) throw new Error('deadlines.js not loaded — run the generate script first');
    const data = window.DEADLINES;

    allDeadlines = (data.deadlines || []).map(d => {
      const date = new Date(d.datetime);
      const start = d.start
        ? new Date(d.start)
        : new Date(date - 30 * 86400000);
      return { ...d, _date: date, _start: start };
    }).sort((a, b) => a._date - b._date);

    const now      = new Date();
    const upcoming = allDeadlines.filter(d => d._date > now);
    primaryDeadline = upcoming.length > 0 ? upcoming[0] : allDeadlines[allDeadlines.length - 1];

    const secondary = allDeadlines.filter(d => d !== primaryDeadline);

    renderHeader(primaryDeadline);
    renderSecondaryDeadlines(secondary);
    tick();
    setInterval(tick, 1000);
  } catch (err) {
    console.error(err);
    document.getElementById('status').innerHTML =
      `<span>Could not load deadlines.js — ${err.message}</span>`;
  }
}

init();
