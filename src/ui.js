const ASSET_BASE = import.meta.env.BASE_URL;

/** Format Rupiah tanpa desimal, contoh: 45000 -> "Rp 45.000". */
export function formatRupiah(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 'Rp 0';
  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Math.round(number));
  return `Rp ${formatted}`;
}

function h(tag, options = {}, children = []) {
  const element = document.createElement(tag);
  if (options.class) element.className = options.class;
  if (options.text !== undefined) element.textContent = options.text;
  if (options.attrs) {
    for (const [name, value] of Object.entries(options.attrs)) {
      if (value !== undefined && value !== null) element.setAttribute(name, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child) element.append(child);
  }
  return element;
}

function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  return `${ASSET_BASE}${imageUrl.replace(/^\/+/, '')}`;
}

function initialsOf(nama) {
  return nama
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function describeStock(stok) {
  if (stok === 0) return { label: 'Stok habis', variant: 'out' };
  if (stok <= 3) return { label: `stok tersisa ${stok}`, variant: 'low' };
  return { label: `stok ${stok}`, variant: 'ok' };
}

function buildProductCard(product) {
  const stock = describeStock(product.stok);
  const media = h('div', { class: 'card__media' });
  const imageUrl = resolveImageUrl(product.imageUrl);

  if (imageUrl) {
    const image = h('img', {
      class: 'card__image',
      attrs: {
        src: imageUrl,
        alt: product.nama,
        loading: 'lazy',
        width: '800',
        height: '600',
      },
    });
    image.addEventListener('error', () => {
      image.replaceWith(
        h('div', {
          class: 'card__fallback',
          text: initialsOf(product.nama),
          attrs: { 'aria-hidden': 'true' },
        }),
      );
    });
    media.append(image);
  } else {
    media.append(
      h('div', {
        class: 'card__fallback',
        text: initialsOf(product.nama),
        attrs: { 'aria-hidden': 'true' },
      }),
    );
  }

  if (product.unggulan) {
    media.append(h('span', { class: 'badge', text: '★ Unggulan' }));
  }

  const meta = h('p', { class: 'card__meta' }, [
    h('span', { text: product.kategori }),
    h('span', { class: 'card__dot', text: '·', attrs: { 'aria-hidden': 'true' } }),
    h('span', {
      class: `card__stock card__stock--${stock.variant}`,
      text: stock.label,
    }),
  ]);

  const body = h('div', { class: 'card__body' }, [
    meta,
    h('h3', { class: 'card__title', text: product.nama }),
    h('p', { class: 'card__price', text: formatRupiah(product.harga) }),
  ]);

  return h(
    'article',
    {
      class: product.stok === 0 ? 'card card--out' : 'card',
      attrs: { 'aria-label': product.nama },
    },
    [media, body],
  );
}

function buildHeader() {
  const logo = h(
    'a',
    { class: 'brand', attrs: { href: '#produk', 'aria-label': 'PADISEHAT, ke katalog' } },
    [
      h('span', { class: 'brand__mark', text: '🌾', attrs: { 'aria-hidden': 'true' } }),
      h('span', { class: 'brand__name', text: 'PADISEHAT' }),
    ],
  );

  const nav = h('nav', { attrs: { 'aria-label': 'Navigasi utama' } }, [
    h('ul', { class: 'nav__list' }, [
      h('li', {}, [
        h('a', {
          class: 'nav__link nav__link--active',
          text: 'Katalog',
          attrs: { href: '#produk', 'aria-current': 'page' },
        }),
      ]),
    ]),
  ]);

  return h('header', { class: 'site-header' }, [
    h('div', { class: 'container header__inner' }, [logo, nav]),
  ]);
}

function buildHero() {
  const copy = h('div', { class: 'hero__copy' }, [
    h('p', { class: 'hero__eyebrow', text: 'Katalog Pertanian' }),
    h('h1', { class: 'hero__title', text: 'Pupuk & bibit untuk panen yang lebih sehat' }),
    h('p', {
      class: 'hero__text',
      text: 'Pilih kebutuhan kebunmu, dari pupuk, benih, bibit, hingga media tanam.',
    }),
    h('a', { class: 'button button--primary', text: 'Lihat Produk', attrs: { href: '#produk' } }),
  ]);

  const emojis = ['🌾', '🌱', '🧑‍🌾', '🚜', '🌻', '🍅'];
  const art = h(
    'div',
    { class: 'hero__art', attrs: { 'aria-hidden': 'true' } },
    emojis.map((emoji, index) =>
      h('span', {
        class: `hero__emoji hero__emoji--${index + 1}`,
        text: emoji,
      }),
    ),
  );

  return h('section', { class: 'hero' }, [h('div', { class: 'container hero__inner' }, [copy, art])]);
}

function buildCatalog(products, summary) {
  const heading = h('div', { class: 'section__head' }, [
    h('h2', {
      class: 'section__title',
      text: 'Semua Produk',
      attrs: { id: 'produk-judul' },
    }),
    h('p', {
      class: 'section__meta',
      text: `${summary.totalProduk} produk · ${summary.jumlahKategori} kategori`,
    }),
  ]);

  const grid = h(
    'div',
    { class: 'product-grid' },
    products.map((product) => buildProductCard(product)),
  );

  return h(
    'section',
    { class: 'section', attrs: { id: 'produk', 'aria-labelledby': 'produk-judul' } },
    [h('div', { class: 'container' }, [heading, grid])],
  );
}

function buildFooter() {
  return h('footer', { class: 'site-footer' }, [
    h('div', { class: 'container footer__inner' }, [
      h('div', {}, [
        h('p', { class: 'footer__brand', text: '🌾 PADISEHAT' }),
        h('p', {
          class: 'footer__text',
          text: 'Katalog latihan untuk kebutuhan pupuk dan tanaman.',
        }),
      ]),
      h('p', {
        class: 'footer__note',
        text: 'Data produk disimpan di perangkat ini (localStorage).',
      }),
    ]),
  ]);
}

/** Merender seluruh tampilan katalog ke dalam elemen root. */
export function renderApp(root, { products, summary }) {
  root.replaceChildren(
    buildHeader(),
    h('main', { attrs: { id: 'konten-utama' } }, [buildHero(), buildCatalog(products, summary)]),
    buildFooter(),
  );

  document.title = 'PADISEHAT — Pupuk & Bibit untuk Panen Sehat';
}
