const form = document.querySelector('#search-form');
const field = document.querySelector('#search-query');
const scope = document.querySelector('#search-scope');
if (form && field && scope) {
  form.addEventListener('submit', () => {
    form.action = scope.value === 'athletes' ? 'https://paddlestats.eu/athletes' : 'https://paddlestats.eu/results';
    field.value = field.value.trim();
  });
  for (const suggestion of document.querySelectorAll('[data-query]')) {
    suggestion.addEventListener('click', () => {
      field.value = suggestion.dataset.query;
      scope.value = suggestion.dataset.scope;
      field.focus();
    });
  }
}
// Navigation only: no cookies, fingerprinting, analytics SDK or API credentials.
