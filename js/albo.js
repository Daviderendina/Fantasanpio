async function load() {
    const [td, sd] = await Promise.all([
      fetch('data/squadre.json').then(r => r.json()),
      fetch('data/stagioni.json').then(r => r.json())
    ]);
  
    const teams = Object.fromEntries(td.squadre.map(t => [t.id, t]));
    const s = sortSeasons(sd.stagioni);
  
    // Statistiche iniziali
    const st = {};
    td.squadre.forEach(t => st[t.id] = { f: 0, s: 0, t: 0, c: 0, a: 0 });
  
    // Calcolo statistiche
    s.forEach(x => {
      if (st[x.campione]) st[x.campione].f++;
      if (st[x.secondo]) st[x.secondo].s++;
      if (st[x.terzo]) st[x.terzo].t++;
  
      // Coppa può mancare
      if (x.coppa && st[x.coppa]) st[x.coppa].c++;
  
      x.partecipanti.forEach(id => {
        if (st[id]) st[id].a++;
      });
    });
  
    // Ranking
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
          <div class="podium-team">${t[x[a[0]]].nome}</div>
          <div class="podium-block">${a[3]}</div>
        </div>
      `).join('');
  }
  
  function renderCup(x, t, st) {
    if (!x.coppa || !t[x.coppa]) {
      document.querySelector('#cup-podium').innerHTML =
        `<div class="cup-icon">♛</div><div><strong>Nessuna coppa</strong></div>`;
      return;
    }
  
    document.querySelector('#cup-podium').innerHTML = `
      <div class="cup-icon">♛</div>
      <div>
        <strong>${t[x.coppa].nome}</strong>
        <small>
          Vincitore ${x.anno} · ${st[x.coppa].c}
          ${st[x.coppa].c === 1 ? 'vittoria' : 'vittorie'}
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
          <div class="honor-name">${t[x.id].nome}</div>
          <div class="honor-stat">${st[x.id].f}</div>
          <div class="honor-stat">${st[x.id].s}</div>
          <div class="honor-stat">${st[x.id].t}</div>
          <div class="honor-stat">${st[x.id].c}</div>
        </div>
      `).join('');
  }
  
  function renderHistory(s,t){
    document.querySelector('#history').innerHTML=
      s.map(x=>`<article class="season-card">
        <div class="season-year">${x.anno}</div>
        <div>
          <div class="season-winner">${t[x.campione].nome}</div>
          <div class="season-meta">🥈 ${t[x.secondo].nome} · 🥉 ${t[x.terzo].nome}</div>
        </div>
        <div class="season-cup">COPPA<strong>${x.coppa?t[x.coppa].nome:'-'}</strong></div>
      </article>`).join('')
  }
  
  function renderParticipation(s, teams) {
    document.querySelector('#participation').innerHTML =
      `<div class="grid-row grid-head">
        <div class="grid-cell">Squadra</div>
        ${s.map(x => `<div class="grid-cell">${x.anno.slice(2)}</div>`).join('')}
      </div>` +
      teams.map(t => `
        <div class="grid-row">
          <div class="grid-cell">${t.nome}</div>
          ${s.map(x => `
            <div class="grid-cell">
              <span class="dot ${x.partecipanti.includes(t.id) ? 'active' : ''}"></span>
            </div>
          `).join('')}
        </div>
      `).join('');
  }

  function sortSeasons(s) {
    return s.sort((a, b) => {
      const [ay1, ay2] = a.anno.split('/').map(Number);
      const [by1, by2] = b.anno.split('/').map(Number);
  
      // Dal più recente al più vecchio
      return ay1 - by1 || ay2 - by2;
    });
  }
  
  
  
  load().catch(console.error);
  