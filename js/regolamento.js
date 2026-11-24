const chips = document.querySelector('#chips');
const rules = document.querySelector('#rules');

let data;
let active = 'tutte';

async function load() {
  data = await fetch('data/regolamento.json').then(r => r.json());
  renderChips();
  renderRules();
}

function renderChips() {
  chips.innerHTML = [
    { id: 'tutte', nome: 'Tutte' },
    ...data.categorie
  ]
    .map(c => `
      <button
        class="chip ${active === c.id ? 'active' : ''}"
        data-category="${esc(c.id)}"
      >${esc(c.nome)}</button>
    `)
    .join('');

  chips.querySelectorAll('.chip').forEach(button => {
    button.onclick = () => {
      active = button.dataset.category;
      renderChips();
      renderRules();
    };
  });
}

function renderRules() {
  const categoriePerId = Object.fromEntries(
    data.categorie.map(c => [c.id, c.nome])
  );

  const list = active === 'tutte'
    ? data.regole
    : data.regole.filter(regola => regola.categorie.includes(active));

  rules.innerHTML = list.map((regola, index) => {
    const nomiCategorie = regola.categorie
      .map(id => categoriePerId[id] || id)
      .join(', ');

    return `
      <article class="rule-card">
        <div class="rule-top">
          <span class="rule-number">${String(index + 1).padStart(2, '0')}</span>
          <span class="rule-category">${esc(nomiCategorie)}</span>
        </div>
        <h3>${esc(regola.titolo)}</h3>
        <p>${esc(regola.descrizione)}</p>
      </article>
    `;
  }).join('');
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[char]);
}

load().catch(() => {
  rules.innerHTML =
    '<article class="rule-card">Impossibile caricare il regolamento.</article>';
});
