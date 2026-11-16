import { SAMPLE_PRODUCTS, WHATSAPP_NUMBER } from './products.js';
import { filterProducts, buildWhatsAppUrl, summarize, saveProducts, createSeedProducts, importProductsJson, exportProductsJson, getStorageNotice } from './store.js';

const ASSET_BASE = import.meta.env.BASE_URL;

const CATEGORY_EMOJI = {
  Pupuk: '🪴',
  Benih: '🌾',
  Bibit: '🌱',
  'Media Tanam': '🪵',
};

const h = (tag, options = {}, children = []) => {
  const element = document.createElement(tag);
  if (options.class) element.className = options.class;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) {
      if (value !== undefined && value !== null) element.setAttribute(name, value);
    }
  }
  for (const child of [].concat(children)) if (child) element.append(child);
  return element;
};

export function formatRupiah(value) {
  return `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)}`;
}


function buildHeader(activeView, navigate) {
  const brand = h('a', { class: 'brand', attrs: { href: '#katalog', 'aria-label': 'PadiSehat, katalog' } }, [
    h('span', { class: 'brand__mark', text: '🌾', attrs: { 'aria-hidden': 'true' } }),
    h('span', { class: 'brand__name', text: 'PADISEHAT' }),
  ]);
  brand.addEventListener('click', (event) => { event.preventDefault(); navigate('katalog'); });

  const nav = h('nav', { class: 'site-nav', attrs: { 'aria-label': 'Navigasi utama' } }, [
    h('a', { class: `nav__link${activeView === 'katalog' ? ' nav__link--active' : ''}`, text: 'Katalog', attrs: { href: '#katalog', 'aria-current': activeView === 'katalog' ? 'page' : null } }),
    h('a', { class: `nav__link${activeView === 'dashboard' ? ' nav__link--active' : ''}`, text: 'Dashboard', attrs: { href: '#dashboard', 'aria-current': activeView === 'dashboard' ? 'page' : null } }),
  ]);
  nav.querySelectorAll('a').forEach((link, index) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      navigate(index === 0 ? 'katalog' : 'dashboard');
    });
  });

  const cta = h('button', { class: 'header__cta', text: activeView === 'dashboard' ? 'Lihat Toko' : 'Kelola Produk', attrs: { type: 'button' } });
  cta.addEventListener('click', (event) => {
    event.preventDefault();
    navigate(activeView === 'dashboard' ? 'katalog' : 'dashboard');
  });

  return h('header', { class: 'site-header' }, [
    h('div', { class: 'container header__inner' }, [brand, nav, cta]),
  ]);
}

function buildHero() {
  const copy = h('div', { class: 'hero__copy' }, [
    h('p', { class: 'hero__eyebrow', text: 'SAHABAT PETANI LOKAL' }),
    h('h1', { class: 'hero__title', text: 'Rawat tanaman, tumbuhkan harapan bersama PadiSehat.' }),
    h('p', { class: 'hero__text', text: 'Temukan pupuk, benih, dan bibit pilihan untuk mendukung kebutuhan kebun dan lahan pertanianmu.' }),
    h('div', { class: 'hero__actions' }, [
      h('a', { class: 'button button--primary', text: 'Jelajahi Katalog', attrs: { href: '#produk' } }),
      h('a', { class: 'button button--secondary', text: 'Lihat Kategori', attrs: { href: '#kategori' } }),
    ]),
    h('p', { class: 'hero__note', text: 'Pilihan kebutuhan pertanian dalam satu tempat.' }),
  ]);

  const art = h('div', { class: 'hero__art', attrs: { 'aria-hidden': 'true' } }, [
    h('span', { class: 'hero__emoji hero__emoji--large', text: '🌾' }),
    h('span', { class: 'hero__emoji', text: '🌱' }),
    h('span', { class: 'hero__emoji', text: '🚜' }),
    h('span', { class: 'hero__emoji', text: '🌻' }),
    h('span', { class: 'hero__emoji', text: '🍅' }),
    h('span', { class: 'hero__emoji', text: '🧑‍🌾' }),
  ]);

  return h('section', { class: 'hero container', attrs: { id: 'beranda', 'aria-labelledby': 'hero-title' } }, [
    h('div', { class: 'hero__inner' }, [
      h('div', { class: 'hero__copy' }, [
        copy.children[0],
        h('h1', { class: 'hero__title', text: 'Rawat tanaman, tumbuhkan harapan bersama PadiSehat.', attrs: { id: 'hero-title' } }),
        ...Array.from(copy.children).slice(2),
      ]),
      art,
    ]),
  ]);
}

function buildCategories(products) {
  const categories = [...new Set(products.map((product) => product.kategori))].sort((a, b) => a.localeCompare(b, 'id'));
  const categoryItems = categories.map((category) => {
    const count = products.filter((product) => product.kategori === category).length;
    return h('a', { class: 'category-card', attrs: { href: '#produk', 'aria-label': `${category}, ${count} produk` } }, [
      h('span', { class: 'category-card__emoji', text: CATEGORY_EMOJI[category] || '🌿', attrs: { 'aria-hidden': 'true' } }),
      h('span', { class: 'category-card__name', text: category }),
      h('span', { class: 'category-card__count', text: `${count} produk` }),
    ]);
  });

  return h('section', { class: 'section category-section container', attrs: { id: 'kategori', 'aria-labelledby': 'kategori-title' } }, [
    h('div', { class: 'section__head' }, [
      h('div', {}, [
        h('p', { class: 'section__eyebrow', text: 'PILIH SESUAI KEBUTUHAN' }),
        h('h2', { class: 'section__title', text: 'Jelajahi Kategori', attrs: { id: 'kategori-title' } }),
      ]),
      h('p', { class: 'section__meta', text: `${categories.length} kategori tersedia` }),
    ]),
    h('div', { class: 'category-grid' }, categoryItems),
  ]);
}

function buildProductCard(product) {
  const isOut = product.stok === 0;
  const stockLabel = isOut ? 'Stok habis' : product.stok <= 3 ? `Tersisa ${product.stok}` : `Stok ${product.stok}`;
  const media = h('div', { class: 'card__media' }, [
    h('span', { class: 'product-emoji', text: CATEGORY_EMOJI[product.kategori] || '🌿', attrs: { 'aria-hidden': 'true' } }),
    h('span', { class: 'product-emoji__accent', text: product.kategori === 'Benih' ? '🌱' : '🍃', attrs: { 'aria-hidden': 'true' } }),
  ]);

  if (product.unggulan) media.append(h('span', { class: 'badge', text: '★ Unggulan' }));

  const meta = h('div', { class: 'card__meta' }, [
    h('span', { class: 'card__category', text: product.kategori }),
    h('span', { class: `card__stock card__stock--${isOut ? 'out' : product.stok <= 3 ? 'low' : 'ok'}`, text: stockLabel }),
  ]);

  const body = h('div', { class: 'card__body' }, [
    meta,
    h('h3', { class: 'card__title', text: product.nama }),
    h('p', { class: 'card__description', text: product.deskripsi }),
    h('p', { class: 'card__price', text: formatRupiah(product.harga) }),
    isOut
      ? h('button', {
          class: 'button card__button card__button--disabled',
          text: 'Stok Habis',
          attrs: { type: 'button', disabled: '' },
        })
      : h('a', {
          class: 'button card__button button--primary',
          text: 'Pesan via WhatsApp',
          attrs: {
            href: buildWhatsAppUrl(WHATSAPP_NUMBER, product),
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': `Pesan ${product.nama} via WhatsApp`,
          },
        }),
  ]);

  return h('article', { class: `card${isOut ? ' card--out' : ''}` }, [media, body]);
}

function buildCatalog(products) {
  const categories = [...new Set(products.map((product) => product.kategori))]
    .sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
  const controls = h('div', { class: 'catalog-toolbar', attrs: { 'aria-label': 'Pencarian dan penyaringan produk' } });
  const searchWrap = h('div', { class: 'search-wrap' }, [
    h('span', { class: 'search-icon', text: '⌕', attrs: { 'aria-hidden': 'true' } }),
    h('label', { class: 'visually-hidden', text: 'Cari produk', attrs: { for: 'product-search' } }),
  ]);
  const search = h('input', {
    class: 'search-input',
    attrs: { id: 'product-search', type: 'search', placeholder: 'Cari pupuk, benih, atau bibit…', autocomplete: 'off' },
  });
  const clearSearch = h('button', {
    class: 'search-clear',
    text: '×',
    attrs: { type: 'button', 'aria-label': 'Hapus pencarian', hidden: '' },
  });
  searchWrap.append(search, clearSearch);

  const chips = h('div', { class: 'category-chips', attrs: { role: 'group', 'aria-label': 'Filter kategori' } });
  const sortLabel = h('label', { class: 'visually-hidden', text: 'Urutkan produk', attrs: { for: 'product-sort' } });
  const sort = h('select', { class: 'sort-select', attrs: { id: 'product-sort' } }, [
    h('option', { text: 'Unggulan & Nama A–Z', attrs: { value: 'unggulan' } }),
    h('option', { text: 'Nama A–Z', attrs: { value: 'nama' } }),
    h('option', { text: 'Nama Z–A', attrs: { value: 'nama-desc' } }),
    h('option', { text: 'Harga termurah → termahal', attrs: { value: 'harga-asc' } }),
    h('option', { text: 'Harga termahal → termurah', attrs: { value: 'harga-desc' } }),
    h('option', { text: 'Stok tersedikit → terbanyak', attrs: { value: 'stok-asc' } }),
  ]);
  const sortWrap = h('div', { class: 'sort-wrap' }, [sortLabel, sort]);
  controls.append(searchWrap, chips, sortWrap);

  const count = h('p', { class: 'results-count', attrs: { 'aria-live': 'polite' } });
  const grid = h('div', { class: 'product-grid' });
  const empty = h('div', { class: 'empty-state', attrs: { hidden: '' } }, [
    h('span', { class: 'empty-state__icon', text: '🌱', attrs: { 'aria-hidden': 'true' } }),
    h('h3', { text: 'Produk tidak ditemukan' }),
    h('p', { text: 'Coba kata kunci lain atau atur ulang filter pencarian.' }),
    h('button', { class: 'button button--primary', text: 'Reset filter', attrs: { type: 'button' } }),
  ]);
  const resetButton = empty.querySelector('button');

  let state = { query: '', kategori: 'Semua Kategori', sort: 'unggulan' };
  const render = () => {
    const visible = filterProducts(products, state);
    count.textContent = `Menampilkan ${visible.length} dari ${products.length} produk`;
    grid.replaceChildren(...visible.map(buildProductCard));
    grid.hidden = visible.length === 0;
    empty.hidden = visible.length !== 0;
    clearSearch.hidden = state.query.length === 0;
    chips.replaceChildren();
    ['Semua Kategori', ...categories].forEach((category) => {
      const active = state.kategori.toLocaleLowerCase('id-ID') === category.toLocaleLowerCase('id-ID');
      const chip = h('button', {
        class: `category-chip${active ? ' category-chip--active' : ''}`,
        text: category,
        attrs: { type: 'button', 'aria-pressed': String(active) },
      });
      chip.addEventListener('click', () => {
        state = { ...state, kategori: category };
        render();
      });
      chips.append(chip);
    });
  };

  search.addEventListener('input', () => {
    state = { ...state, query: search.value };
    render();
  });
  clearSearch.addEventListener('click', () => {
    search.value = '';
    state = { ...state, query: '' };
    search.focus();
    render();
  });
  sort.addEventListener('change', () => {
    state = { ...state, sort: sort.value };
    render();
  });
  resetButton.addEventListener('click', () => {
    state = { query: '', kategori: 'Semua Kategori', sort: 'unggulan' };
    search.value = '';
    sort.value = 'unggulan';
    render();
    search.focus();
  });

  const section = h('section', { class: 'section catalog-section container', attrs: { id: 'produk', 'aria-labelledby': 'produk-title' } }, [
    h('div', { class: 'section__head' }, [
      h('div', {}, [
        h('p', { class: 'section__eyebrow', text: 'PRODUK PILIHAN' }),
        h('h2', { class: 'section__title', text: 'Kebutuhan Pertanianmu', attrs: { id: 'produk-title' } }),
        h('p', { class: 'section__intro', text: 'Produk pilihan untuk membantu aktivitas tanam dari awal hingga perawatan.' }),
      ]),
    ]),
    controls,
    count,
    grid,
    empty,
  ]);
  render();
  return section;
}

function buildDashboard(products, onChange) {
  const summary = summarize(products);
  const lowStock = products.filter((product) => product.stok > 0 && product.stok <= 3).length;
  const categories = [...new Set(['Pupuk', 'Benih', 'Bibit', 'Media Tanam', ...products.map((p) => p.kategori)])]
    .sort((a, b) => a.localeCompare(b, 'id', { sensitivity: 'base' }));
  let editingId = null;

  const page = h('section', { class: 'dashboard-page container', attrs: { 'aria-labelledby': 'dashboard-title' } });
  const heading = h('div', { class: 'dashboard-heading' }, [
    h('div', {}, [
      h('p', { class: 'section__eyebrow', text: 'AREA PENGELOLA TOKO · DEMO' }),
      h('h1', { class: 'dashboard-title', text: 'Dashboard', attrs: { id: 'dashboard-title' } }),
      h('p', { class: 'dashboard-subtitle', text: 'Kelola produk dan pantau ketersediaan stok PadiSehat.' }),
    ]),
    h('button', { class: 'button button--primary', text: '+ Tambah Produk', attrs: { type: 'button' } }),
  ]);
  const addButton = heading.querySelector('button');

  const metrics = h('div', { class: 'dashboard-metrics' }, [
    metricCard('📦', summary.totalProduk, 'Total Produk'),
    metricCard('🌱', summary.totalStok, 'Total Stok'),
    metricCard('🏷️', summary.jumlahKategori, 'Kategori Aktif'),
    metricCard('⚠️', lowStock, 'Stok Menipis'),
  ]);

  const formPanel = h('section', { class: 'dashboard-form-panel', attrs: { hidden: '' } });
  const formTitle = h('h2', { class: 'dashboard-panel-title', text: 'Tambah Produk' });
  const form = h('form', { class: 'product-form', attrs: { novalidate: '' } });
  const fields = {};
  const errors = {};

  function addField(key, labelText, type, options = {}) {
    const wrap = h('div', { class: `form-field form-field--${key}` });
    const id = `product-${key}`;
    const label = h('label', { text: labelText, attrs: { for: id } });
    let input;
    if (type === 'select') {
      input = h('select', { attrs: { id, name: key, required: '' } },
        options.values.map((value) => h('option', { text: value, attrs: { value } })));
    } else if (type === 'textarea') {
      input = h('textarea', { attrs: { id, name: key, rows: '3', required: '' } });
    } else if (type === 'checkbox') {
      input = h('input', { attrs: { id, name: key, type: 'checkbox' } });
    } else {
      input = h('input', { attrs: { id, name: key, type, required: options.required !== false, ...(options.attrs || {}) } });
    }
    const error = h('p', { class: 'field-error', attrs: { id: `${id}-error`, 'aria-live': 'polite' } });
    if (type !== 'checkbox') input.setAttribute('aria-describedby', error.id);
    wrap.append(label, input, error);
    form.append(wrap);
    fields[key] = input;
    errors[key] = error;
  }

  addField('nama', 'Nama produk *', 'text', { attrs: { minlength: '3', maxlength: '60', placeholder: 'Contoh: Pupuk NPK Padi 1 kg' } });
  addField('kategori', 'Kategori *', 'select', { values: categories });
  addField('harga', 'Harga (Rp) *', 'number', { attrs: { min: '0', step: '1', placeholder: '45000' } });
  addField('stok', 'Stok *', 'number', { attrs: { min: '0', step: '1', placeholder: '24' } });
  addField('deskripsi', 'Deskripsi *', 'textarea');
  addField('imageUrl', 'Jalur gambar (opsional)', 'text', { required: false, attrs: { placeholder: '/img/nama-produk.svg' } });
  addField('unggulan', 'Tampilkan sebagai produk unggulan', 'checkbox');

  const formActions = h('div', { class: 'form-actions' }, [
    h('button', { class: 'button button--secondary', text: 'Batal', attrs: { type: 'button' } }),
    h('button', { class: 'button button--primary', text: 'Simpan Produk', attrs: { type: 'submit' } }),
  ]);
  const cancelButton = formActions.querySelector('button');
  form.append(formActions);
  formPanel.append(formTitle, form);

  const tablePanel = h('section', { class: 'dashboard-table-panel' });
  const tableHeading = h('div', { class: 'dashboard-table-heading' }, [
    h('div', {}, [
      h('h2', { class: 'dashboard-panel-title', text: 'Daftar Produk' }),
      h('p', { class: 'dashboard-table-note', text: 'Perubahan di sini langsung diperbarui pada katalog publik.' }),
    ]),
    h('div', { class: 'dashboard-data-actions' }, [
      h('button', { class: 'button button--secondary export-json-button', text: 'Export JSON', attrs: { type: 'button' } }),
      h('button', { class: 'button button--secondary import-json-button', text: 'Import JSON', attrs: { type: 'button' } }),
      h('button', { class: 'button button--secondary reset-demo-button', text: 'Reset Demo', attrs: { type: 'button' } }),
    ]),
  ]);
  const tableWrap = h('div', { class: 'table-scroll' });
  const table = h('table', { class: 'dashboard-table' });
  const thead = h('thead', {}, [h('tr', {}, ['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map((title) => h('th', { text: title, attrs: { scope: 'col' } })))]);
  const tbody = h('tbody');
  table.append(thead, tbody);
  tableWrap.append(table);
  tablePanel.append(tableHeading, tableWrap);

  const note = h('p', { class: 'dashboard-storage-note', text: 'Mode demo: data disimpan pada localStorage perangkat ini dengan key padisehat:products:v1. Tidak menggunakan login, password, sesi, atau backend.' });

  function metricCard(emoji, value, label) {
    return h('article', { class: 'metric-card' }, [
      h('span', { class: 'metric-card__icon', text: emoji, attrs: { 'aria-hidden': 'true' } }),
      h('strong', { class: 'metric-card__value', text: String(value) }),
      h('span', { class: 'metric-card__label', text: label }),
    ]);
  }

  function clearErrors() {
    Object.keys(errors).forEach((key) => {
      errors[key].textContent = '';
      fields[key].removeAttribute('aria-invalid');
    });
  }

  function closeForm() {
    editingId = null;
    form.reset();
    clearErrors();
    formPanel.hidden = true;
    formTitle.textContent = 'Tambah Produk';
  }

  function openForm(product = null) {
    editingId = product ? product.id : null;
    form.reset();
    clearErrors();
    formTitle.textContent = product ? 'Ubah Produk' : 'Tambah Produk';
    fields.nama.value = product?.nama || '';
    fields.kategori.value = product?.kategori || categories[0];
    fields.harga.value = product ? String(product.harga) : '';
    fields.stok.value = product ? String(product.stok) : '';
    fields.deskripsi.value = product?.deskripsi || '';
    fields.imageUrl.value = product?.imageUrl || '';
    fields.unggulan.checked = product?.unggulan === true;
    formPanel.hidden = false;
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    fields.nama.focus();
  }

  function validate() {
    clearErrors();
    const values = {
      nama: fields.nama.value.trim(),
      kategori: fields.kategori.value.trim(),
      harga: fields.harga.value.trim(),
      stok: fields.stok.value.trim(),
      deskripsi: fields.deskripsi.value.trim(),
    };
    const allowedCategories = new Set(categories);
    if (!values.nama) errors.nama.textContent = 'Nama produk wajib diisi.';
    else if (values.nama.length < 3 || values.nama.length > 60) errors.nama.textContent = 'Nama harus terdiri dari 3–60 karakter.';
    if (!allowedCategories.has(values.kategori)) errors.kategori.textContent = 'Pilih kategori yang tersedia.';
    if (values.harga === '' || !Number.isFinite(Number(values.harga)) || !Number.isInteger(Number(values.harga)) || Number(values.harga) < 0) errors.harga.textContent = 'Harga wajib berupa angka bulat minimal 0.';
    if (values.stok === '' || !Number.isFinite(Number(values.stok)) || !Number.isInteger(Number(values.stok)) || Number(values.stok) < 0) errors.stok.textContent = 'Stok wajib berupa bilangan bulat minimal 0.';
    if (values.deskripsi.length < 10 || values.deskripsi.length > 300) errors.deskripsi.textContent = 'Deskripsi wajib 10–300 karakter.';
    if (fields.imageUrl.value.trim() && !/^\/(?:img\/)[\w./-]+\.svg$/i.test(fields.imageUrl.value.trim())) {
      errors.imageUrl.textContent = 'Gunakan jalur placeholder lokal, misalnya /img/produk.svg.';
    }
    Object.entries(errors).forEach(([key, error]) => {
      if (error.textContent) fields[key].setAttribute('aria-invalid', 'true');
    });
    return Object.values(errors).every((error) => !error.textContent);
  }

  function renderRows() {
    tbody.replaceChildren();
    if (products.length === 0) {
      const emptyRow = h('tr', {}, [h('td', { text: 'Belum ada produk. Tambahkan produk pertama melalui tombol Tambah Produk.', attrs: { colspan: '6' } })]);
      tbody.append(emptyRow);
      return;
    }
    products.forEach((product) => {
      const status = product.stok === 0 ? 'Stok habis' : product.stok <= 3 ? 'Menipis' : 'Tersedia';
      const edit = h('button', { class: 'table-action table-action--edit', text: 'Ubah', attrs: { type: 'button' } });
      const remove = h('button', { class: 'table-action table-action--delete', text: 'Hapus', attrs: { type: 'button' } });
      edit.addEventListener('click', () => openForm(product));
      remove.addEventListener('click', () => {
        if (!window.confirm(`Hapus produk "${product.nama}"? Produk ini akan dihapus dari katalog dan tidak dapat dipulihkan.`)) return;
        const next = products.filter((item) => item.id !== product.id);
        onChange(next, 'Produk berhasil dihapus.');
      });
      tbody.append(h('tr', {}, [
        h('td', { class: 'table-product-name', text: product.nama }),
        h('td', { text: product.kategori }),
        h('td', { text: formatRupiah(product.harga) }),
        h('td', { text: String(product.stok) }),
        h('td', { text: status }),
        h('td', { class: 'table-actions' }, [edit, remove]),
      ]));
    });
  }

  addButton.addEventListener('click', () => openForm());
  cancelButton.addEventListener('click', closeForm);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validate()) {
      const firstInvalid = Object.keys(errors).find((key) => errors[key].textContent);
      fields[firstInvalid]?.focus();
      return;
    }
    const previous = products.find((item) => item.id === editingId);
    const nextProduct = {
      id: editingId || (globalThis.crypto?.randomUUID?.() || `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      nama: fields.nama.value.trim(),
      kategori: fields.kategori.value.trim(),
      harga: Number(fields.harga.value),
      stok: Number(fields.stok.value),
      deskripsi: fields.deskripsi.value.trim(),
      imageUrl: fields.imageUrl.value.trim() || previous?.imageUrl || '',
      unggulan: fields.unggulan.checked,
    };
    const next = editingId
      ? products.map((item) => item.id === editingId ? nextProduct : item)
      : [...products, nextProduct];
    onChange(next, editingId ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.');
  });

  const importInput = h('input', { attrs: { type: 'file', accept: 'application/json,.json', hidden: '' } });
  tableHeading.append(importInput);

  tableHeading.querySelector('.export-json-button').addEventListener('click', () => {
    try {
      const blob = new Blob([exportProductsJson(products)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = h('a', { attrs: { href: url, download: 'padisehat-products.json' } });
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(error.message || 'Data gagal diekspor.');
    }
  });

  tableHeading.querySelector('.import-json-button').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const imported = importProductsJson(await file.text());
      if (!window.confirm(`Impor ${imported.length} produk? Data produk saat ini akan diganti.`)) return;
      onChange(imported, 'Data JSON berhasil diimpor.');
    } catch (error) {
      window.alert(error.message || 'Impor gagal. Data lama tetap aman.');
    } finally {
      importInput.value = '';
    }
  });

  tableHeading.querySelector('.reset-demo-button').addEventListener('click', () => {
    if (!window.confirm('Pulihkan delapan produk contoh? Semua perubahan produk saat ini akan diganti.')) return;
    onChange(createSeedProducts(), 'Data contoh berhasil dipulihkan.');
  });

  page.append(heading, metrics, formPanel, tablePanel, note);
  renderRows();
  return page;
}

function buildFooter() {
  return h('footer', { class: 'site-footer' }, [
    h('div', { class: 'container footer__inner' }, [
      h('div', {}, [
        h('p', { class: 'footer__brand', text: '🌾 PADISEHAT' }),
        h('p', { class: 'footer__text', text: 'Teman tumbuh untuk kebutuhan pertanian lokal.' }),
      ]),
      h('div', { class: 'footer__links' }, [
        h('a', { text: 'Katalog', attrs: { href: '#katalog' } }),
        h('a', { text: 'Dashboard', attrs: { href: '#dashboard' } }),
      ]),
      h('p', { class: 'footer__note', text: 'Data produk tersimpan di perangkat ini. Nomor WhatsApp contoh — ganti sebelum dipakai.' }),
    ]),
  ]);
}

export function renderApp(root, { products = SAMPLE_PRODUCTS } = {}) {
  let currentProducts = products.map((product) => ({ ...product }));
  let activeView = 'katalog';
  let toastMessage = getStorageNotice();

  const render = () => {
    const navigate = (view) => {
      activeView = view;
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    const notifyChange = (nextProducts, message) => {
      if (!saveProducts(nextProducts)) {
        window.alert('Perubahan tidak dapat disimpan. Penyimpanan browser mungkin penuh atau tidak tersedia.');
        return;
      }
      currentProducts = nextProducts;
      toastMessage = message;
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const mainContent = activeView === 'dashboard'
      ? buildDashboard(currentProducts, notifyChange)
      : h('main', { attrs: { id: 'konten-utama' } }, [
          buildHero(),
          buildCategories(currentProducts),
          buildCatalog(currentProducts),
        ]);

    root.replaceChildren(buildHeader(activeView, navigate), mainContent, buildFooter());
    if (toastMessage) {
      const toast = h('div', { class: 'app-toast', text: toastMessage, attrs: { role: 'status', 'aria-live': 'polite' } });
      root.append(toast);
      toastMessage = '';
    }
    document.title = activeView === 'dashboard'
      ? 'Dashboard PadiSehat — Kelola Produk'
      : 'PadiSehat — Kebutuhan Pertanian Petani Lokal';
  };

  render();
}
