import { SAMPLE_PRODUCTS } from './products.js';

const ASSET_BASE = import.meta.env.BASE_URL;

// Nomor contoh untuk demo. GANTI dengan nomor resmi toko sebelum digunakan.
const WHATSAPP_STORE_NUMBER = '6281234567890';

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

function buildWhatsAppUrl(product) {
  const message = `Halo PadiSehat, saya ingin bertanya tentang ${product.nama} (${formatRupiah(product.harga)}). Apakah stoknya tersedia?`;
  return `https://wa.me/${WHATSAPP_STORE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buildHeader() {
  const brand = h('a', { class: 'brand', attrs: { href: '#beranda', 'aria-label': 'PadiSehat, beranda' } }, [
    h('span', { class: 'brand__mark', text: '🌾', attrs: { 'aria-hidden': 'true' } }),
    h('span', { class: 'brand__name', text: 'PADISEHAT' }),
  ]);

  const nav = h('nav', { class: 'site-nav', attrs: { 'aria-label': 'Navigasi utama' } }, [
    h('a', { class: 'nav__link nav__link--active', text: 'Beranda', attrs: { href: '#beranda' } }),
    h('a', { class: 'nav__link', text: 'Kategori', attrs: { href: '#kategori' } }),
    h('a', { class: 'nav__link', text: 'Katalog', attrs: { href: '#produk' } }),
  ]);

  return h('header', { class: 'site-header' }, [
    h('div', { class: 'container header__inner' }, [brand, nav,
      h('a', { class: 'header__cta', text: 'Lihat Produk', attrs: { href: '#produk' } }),
    ]),
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
    h('a', {
      class: `button card__button${isOut ? ' card__button--disabled' : ' button--primary'}`,
      text: 'Pesan via WhatsApp',
      attrs: isOut
        ? { 'aria-disabled': 'true', tabindex: '-1' }
        : { href: buildWhatsAppUrl(product), target: '_blank', rel: 'noopener noreferrer' },
    }),
  ]);

  return h('article', { class: `card${isOut ? ' card--out' : ''}` }, [media, body]);
}

function buildCatalog(products) {
  return h('section', { class: 'section catalog-section container', attrs: { id: 'produk', 'aria-labelledby': 'produk-title' } }, [
    h('div', { class: 'section__head' }, [
      h('div', {}, [
        h('p', { class: 'section__eyebrow', text: 'PRODUK PILIHAN' }),
        h('h2', { class: 'section__title', text: 'Kebutuhan Pertanianmu', attrs: { id: 'produk-title' } }),
        h('p', { class: 'section__intro', text: 'Produk pilihan untuk membantu aktivitas tanam dari awal hingga perawatan.' }),
      ]),
      h('p', { class: 'section__meta', text: `Menampilkan ${products.length} produk` }),
    ]),
    h('div', { class: 'product-grid' }, products.map(buildProductCard)),
  ]);
}

function buildFooter() {
  return h('footer', { class: 'site-footer' }, [
    h('div', { class: 'container footer__inner' }, [
      h('div', {}, [
        h('p', { class: 'footer__brand', text: '🌾 PADISEHAT' }),
        h('p', { class: 'footer__text', text: 'Teman tumbuh untuk kebutuhan pertanian lokal.' }),
      ]),
      h('div', { class: 'footer__links' }, [
        h('a', { text: 'Kategori', attrs: { href: '#kategori' } }),
        h('a', { text: 'Katalog Produk', attrs: { href: '#produk' } }),
      ]),
      h('p', { class: 'footer__note', text: 'Harga dan stok pada katalog ini merupakan data contoh.' }),
    ]),
  ]);
}

export function renderApp(root, { products = SAMPLE_PRODUCTS } = {}) {
  root.replaceChildren(
    buildHeader(),
    h('main', { attrs: { id: 'konten-utama' } }, [
      buildHero(),
      buildCategories(products),
      buildCatalog(products),
    ]),
    buildFooter(),
  );
  document.title = 'PadiSehat — Kebutuhan Pertanian Petani Lokal';
}
