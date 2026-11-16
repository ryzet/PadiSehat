import { SAMPLE_PRODUCTS, WHATSAPP_NUMBER } from './products.js';
import { filterProducts, buildWhatsAppUrl, summarize, saveProducts, createSeedProducts } from './store.js';

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

  return h('header', { class: 'site-header' }, [
    h('div', { class: 'container header__inner' }, [
      brand, nav,
      h('a', { class: 'header__cta', text: activeView === 'dashboard' ? 'Lihat Toko' : 'Kelola Produk', attrs: { href: activeView === 'dashboard' ? '#katalog' : '#dashboard' } }),
    ]),
  ]);
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
    h('button', { class: 'button button--secondary reset-demo-button', text: 'Reset Data Contoh', attrs: { type: 'button' } }),
  ]);
  const tableWrap = h('div', { class: 'table-scroll' });
  const table = h('table', { class: 'dashboard-table' });
  const thead = h('thead', {}, [h('tr', {}, ['Produk', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map((title) => h('th', { text: title, attrs: { scope: 'col' } })))]);
  const tbody = h('tbody');
  table.append(thead, tbody);
  tableWrap.append(table);
  tablePanel.append(tableHeading, tableWrap);

  const note = h('p', { class: 'dashboard-storage-note', text: 'Mode demo: data disimpan pada localStorage di perangkat ini. Tidak menggunakan login, password, sesi, atau backend.' });

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
  let toastMessage = '';

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
