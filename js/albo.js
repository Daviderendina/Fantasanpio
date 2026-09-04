async function load() {
  const [td, sd] = await Promise.all([
    fetch('data/squadre.json').then(r => r.json()),
    fetch('data/stagioni.json').then(r => r.json())
  ]);

  const teams = Object.fromEntries(td.squadre.map(t => [t.id, t]));
  const s = sortSeasons(sd.stagioni);

  const st = {};
  td.squadre.forEach(t => st[t.id] = { f: 0, s: 0, t: 0, c: 0, a: 0 });

  s.forEach(x => {
    if (st[x.campione]) st[x.campione].f++;
    if (st[x.secondo]) st[x.secondo].s++;
    if (st[x.terzo]) st[x.terzo].t++;
    if (x.coppa && st[x.coppa]) st[x.coppa].c++;
    x.partecipanti.forEach(id => { if (st[id]) st[id].a++; });
  });

  const rank = [...td.squadre].sort((a, b) =>
    st[b.id].f - st[a.id].f ||
    st[b.id].s - st[a.id].s
  );

  const last = s.at(-1);
  document.getElementById('last-season-title').textContent += ' ' + last.anno;

  renderPodium(last, teams);
  renderCup(last, teams, st);
  renderHonor(rank, teams, st);
  renderHistory([...s].reverse(), teams);
  renderParticipation(s, td.squadre);
}

function renderPodium(x, t) {
  const e = [
    ['secondo', 'place-2', '🥈', '2°'],
    ['campione', 'place-1', '🥇', '1°'],
    ['terzo', 'place-3', '🥉', '3°']
  ];

  document.querySelector('#champion-podium').innerHTML =
    e.map(a => `
      <div class="podium-place ${a[1]}">
        <div class="medal">${a[2]}</div>
        <div class="podium-team">${getTeamName(t[x[a[0]]], x.anno)}</div>
        <div class="podium-block" id="${a[1]}">${a[3]}</div>
      </div>
    `).join('');
}

function renderCup(x, t, st) {
  if (!x.coppa || !t[x.coppa]) {
    document.querySelector('#cup-podium').innerHTML =
      `<div class="cup-icon">🏆</div><div><strong>Nessuna coppa</strong></div>`;
    return;
  }

  document.querySelector('#cup-podium').innerHTML = `
    <div class="cup-icon">🏆</div>
    <div>
      <strong>${getTeamName(t[x.coppa], x.anno)}</strong>
      <small>
        Vincitore coppa
        &nbsp·&nbsp
        Secondo classificato <b>${getTeamName(t[x.secondocoppa], x.anno)}</b>
      </small>
    </div>
  `;
}

function renderHonor(r, t, st) {
  document.querySelector('#honor-roll').innerHTML =
    `<div class="honor-row honor-head">
      <div>Squadra</div>
      <div class="honor-stat">🥇</div>
      <div class="honor-stat">🥈</div>
      <div class="honor-stat">🥉</div>
      <div class="honor-stat">🏆</div>
    </div>` +
    r.map(x => `
      <div class="honor-row">
        <div class="honor-name">${getTeamName(t[x.id], "common")}</div>
        <div class="honor-stat">${st[x.id].f}</div>
        <div class="honor-stat">${st[x.id].s}</div>
        <div class="honor-stat">${st[x.id].t}</div>
        <div class="honor-stat">${st[x.id].c}</div>
      </div>
    `).join('');
}

function renderHistory(s, t) {
  document.querySelector('#history').innerHTML =
//   VECCHIO CODICE
// <article class="season-card">
//   <div class="season-year">${x.anno}</div>
//   <div>
//     <div class="season-winner">🥇 ${getTeamName(t[x.campione], x.anno)}</div>
//     <div class="season-meta">🥈 ${getTeamName(t[x.secondo], x.anno)} · 🥉 ${getTeamName(t[x.terzo], x.anno)}</div>
//   </div>
//   <div class="season-cup">COPPA<strong>${x.coppa ? getTeamName(t[x.coppa], x.anno) : '-'}</strong></div>
// </article>
    s.map(x => `     
      <article class="season-card">
        <div class="season-year">${x.anno}</div>
          <div>
            <span class="season-winner">🥇 ${getTeamName(t[x.campione], x.anno)} </span>
            <span class="season-non-winner">&nbsp&nbsp·&nbsp&nbsp🥈 ${getTeamName(t[x.secondo], x.anno)} </span>
            <span class="season-non-winner">&nbsp&nbsp·&nbsp&nbsp🥉 ${getTeamName(t[x.terzo], x.anno)} </span>
            ${x.coppa ? `
              </br>
              <span class="season-cup">COPPA</span>&nbsp 
              <span class="season-winner">${getTeamName(t[x.coppa], x.anno)}</span>
              <span class="season-non-winner">&nbsp&nbsp·&nbsp&nbsp ${getTeamName(t[x.secondocoppa], x.anno)}</span>
              ` : ''}
          </div>
        </div>
      </article>
    `).join('');
}

function renderParticipation(s, teams) {
  const sorted = [...teams].sort((a, b) =>
    getTeamName(a, "common").localeCompare(getTeamName(b, "common"))
  );

  document.querySelector('#participation').innerHTML =
    sorted.map(t => `
      <div class="line-row">
        <div class="line-team">${getTeamName(t, "common")}</div>
        <div class="line-track">
          ${s.map(x => `
            <span class="line-seg ${x.partecipanti.includes(t.id) ? 'on' : 'off'}"></span>
          `).join('')}
        </div>
      </div>
    `).join('');
}

function sortSeasons(s) {
  return s.sort((a, b) => {
    const [ay1, ay2] = a.anno.split('/').map(Number);
    const [by1, by2] = b.anno.split('/').map(Number);
    return ay1 - by1 || ay2 - by2;
  });
}

function getTeamName(t, season) {
  if (typeof t.nome === "string") return t.nome;
  return t.nome[season] || t.nome.common || Object.values(t.nome)[0];
}

load().catch(console.error);
