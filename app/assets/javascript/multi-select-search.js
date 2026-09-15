(function () {
  document.documentElement.classList.add('js-enabled');

  var modules = document.querySelectorAll('[data-module="searchable-checkboxes"]');
  if (!modules.length) return;

  modules.forEach(function (container) {
    if (!(container instanceof HTMLElement)) return;

    var searchInput = container.querySelector('input[type="text"]');
    if (!(searchInput instanceof HTMLInputElement)) return;

    var listEl = container.querySelector('[data-js-hidden]');
    if (!(listEl instanceof HTMLElement)) return;

    var tagsList = container.querySelector('ul[id$="-tags"]');
    if (!(tagsList instanceof HTMLElement)) return;

    var noneTextEl = container.querySelector('p[id$="-none"]');
    if (!(noneTextEl instanceof HTMLElement)) return;

    var tagsId = container.getAttribute('data-tags-id');
    if (!tagsId) return;

    var items = container.querySelectorAll('.searchable-item');
    var checkboxes = container.querySelectorAll('input[type="checkbox"]');

    /* ------------------------------
       SHOW / FILTER LIST
    ------------------------------ */
    searchInput.addEventListener('input', function () {
      var term = searchInput.value.trim().toLowerCase();

      if (term.length > 0) {
        listEl.classList.add('is-visible');
      } else {
        listEl.classList.remove('is-visible');
      }

      items.forEach(function (item) {
        if (!(item instanceof HTMLElement)) return;
        var label = item.dataset.label || '';
        item.style.display = label.indexOf(term) !== -1 ? '' : 'none';
      });
    });

    /* ------------------------------
       ESC KEY = EXIT LIST
    ------------------------------ */
    function closeListAndReturnFocus() {
      listEl.classList.remove('is-visible');

      searchInput.focus();

      var val = searchInput.value;
      searchInput.value = '';
      searchInput.value = val;
    }

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeListAndReturnFocus();
      }
    });

    listEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeListAndReturnFocus();
      }
    });

    /* ------------------------------
       RENDER TAGS + COUNT
    ------------------------------ */
function renderTags() {
  tagsList.innerHTML = '';

  var checked = container.querySelectorAll('input[type="checkbox"]:checked');

  var countEl = container.querySelector('[id$="-tags-count"]');
  if (countEl instanceof HTMLElement) {
    countEl.textContent = String(checked.length);
  }

  // Toggle empty state
  if (checked.length === 0) {
    noneTextEl.style.display = '';
    tagsList.style.display = 'none';
  } else {
    noneTextEl.style.display = 'none';
    tagsList.style.display = '';
  }

  checked.forEach(function (checkbox) {
    if (!(checkbox instanceof HTMLInputElement)) return;

    var labelEl = container.querySelector('label[for="' + checkbox.id + '"]');
    if (!(labelEl instanceof HTMLLabelElement)) return;

    var li = document.createElement('li');
    li.className = 'nhsuk-tag nhsuk-tag--blue nhsuk-tag--filter nhsuk-u-margin-right-2';

    var text = document.createElement('span');
    text.className = 'nhsuk-tag__text';
    text.textContent = labelEl.textContent;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nhsuk-tag__remove';
    btn.setAttribute('aria-label', 'Remove ' + labelEl.textContent);

    btn.innerHTML = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="16"
        height="16"
        aria-hidden="true"
        focusable="false">
        <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 1 0 5.7 7.12L10.59 12l-4.9 4.89a1 1 0 0 0 1.42 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.42L13.41 12l4.9-4.89a1 1 0 0 0-.01-1.4z"></path>
      </svg>
    `;

    btn.addEventListener('click', function () {
      checkbox.checked = false;
      renderTags();
      searchInput.focus();
    });

    li.appendChild(text);
    li.appendChild(btn);
    tagsList.appendChild(li);
  });
}
    /* ------------------------------
       CHECKBOX CHANGE
    ------------------------------ */
    checkboxes.forEach(function (cb) {
      if (cb instanceof HTMLInputElement) {
        cb.addEventListener('change', renderTags);
      }
    });

    renderTags();
  });
})();