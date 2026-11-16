const API = '/api';
const rupiah = (amount) => 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);
const node = (tag, text, className) => {
  const item = document.createElement(tag);
  if (text !== undefined) item.textContent = text;
  if (className) item.className = className;
  return item;
};
const button = (text, action, className = 'button button--primary') => {
  const item = node('button', text, className);
  item.type = 'button';
  item.dataset.action = action;
  return item;
};

export function initCommerce(root, products) {
  let user = null;
  let selected = null;
  let order = null;
  let pendingBuy = null;

  const overlay = node('div', undefined, 'shop-overlay');
  overlay.hidden = true;
  const dialog = node('section', undefined, 'shop-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-labelledby', 'shop-title');
  const close = button('×', 'close', 'shop-close');
  close.setAttribute('aria-label', 'Tutup');
  const title = node('h2', 'PadiSehat', 'shop-title');
  title.id = 'shop-title';
  const content = node('div', undefined, 'shop-content');
  dialog.append(close, title, content);
  overlay.append(dialog);
  document.body.append(overlay);

  function show(heading, child) {
    title.textContent = heading;
    content.replaceChildren(child);
    overlay.hidden = false;
    document.body.classList.add('shop-open');
    close.focus();
  }
  function hide() {
    overlay.hidden = true;
    document.body.classList.remove('shop-open');
  }
  function formField(labelText, type, name, attrs = {}) {
    const wrap = node('label', labelText, 'shop-field');
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') input.type = type;
    input.name = name;
    input.required = attrs.required !== false;
    if (attrs.minLength) input.minLength = attrs.minLength;
    if (attrs.autocomplete) input.autocomplete = attrs.autocomplete;
    if (attrs.accept) input.accept = attrs.accept;
    wrap.append(input);
    return [wrap, input];
  }
  function message(text, kind = '') {
    const result = node('p', text, 'shop-message ' + kind);
    result.setAttribute('role', 'status');
    return result;
  }
  function addHeaderAccount() {
    const bar = root.querySelector('.header__inner');
    if (!bar || bar.querySelector('.shop-account')) return;
    const account = button(user ? user.name : 'Masuk / Daftar', 'account', 'button button--secondary shop-account');
    bar.append(account);
  }
  function findProduct(name) { return products.find((item) => item.nama === name); }
  function detail(product) {
    selected = product;
    const wrap = node('div', undefined, 'shop-product');
    const cover = node('div', undefined, 'shop-product__cover');
    if (product.imageUrl) {
      const image = node('img');
      image.src = product.imageUrl;
      image.alt = product.nama;
      cover.append(image);
    } else cover.textContent = '🌾';
    const details = node('div', undefined, 'shop-product__details');
    details.append(node('span', product.kategori, 'shop-kicker'), node('h3', product.nama), node('p', product.deskripsi), node('strong', rupiah(product.harga), 'shop-price'));
    const stock = node('p', product.stok > 0 ? '✓ Tersedia · ' + product.stok + ' stok' : 'Stok sedang habis', 'shop-stock');
    details.append(stock);
    const quantityLabel = node('label', 'Jumlah', 'shop-field');
    const quantity = node('input');
    quantity.type = 'number';
    quantity.min = '1';
    quantity.max = String(Math.max(1, product.stok));
    quantity.value = '1';
    quantity.disabled = product.stok === 0;
    quantityLabel.append(quantity);
    details.append(quantityLabel);
    const actions = node('div', undefined, 'shop-actions');
    const buy = button('Checkout transfer', 'buy');
    buy.disabled = product.stok === 0;
    buy.addEventListener('click', () => {
      const count = Number(quantity.value);
      if (!Number.isInteger(count) || count < 1 || count > product.stok) {
        details.append(message('Jumlah melebihi stok yang tersedia.', 'shop-error'));
        return;
      }
      pendingBuy = { product, quantity: count };
      if (!user) auth('register');
      else checkout();
    });
    const ask = node('a', 'Tanya owner via WhatsApp', 'button button--secondary');
    ask.href = 'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo PadiSehat, saya ingin bertanya tentang ' + product.nama + '.');
    ask.target = '_blank';
    ask.rel = 'noopener noreferrer';
    actions.append(buy, ask);
    details.append(actions);
    wrap.append(cover, details);
    show('Detail Produk', wrap);
  }
  function auth(mode = 'login') {
    const form = node('form', undefined, 'shop-form');
    const intro = node('p', mode === 'register' ? 'Buat akun untuk menyimpan pesanan dan bukti transfer.' : 'Masuk untuk melanjutkan checkout dan melihat pesananmu.', 'shop-copy');
    form.append(intro);
    let nameInput;
    if (mode === 'register') {
      const [field, input] = formField('Nama lengkap', 'text', 'name', { minLength: 2, autocomplete: 'name' });
      nameInput = input;
      form.append(field);
    }
    const [emailField, email] = formField('Email', 'email', 'email', { autocomplete: 'email' });
    const [passwordField, password] = formField('Kata sandi (minimal 8 karakter)', 'password', 'password', { minLength: 8, autocomplete: mode === 'register' ? 'new-password' : 'current-password' });
    form.append(emailField, passwordField);
    let confirm;
    if (mode === 'register') {
      const [confirmField, input] = formField('Konfirmasi kata sandi', 'password', 'confirmPassword', { minLength: 8, autocomplete: 'new-password' });
      confirm = input;
      form.append(confirmField);
      confirm.addEventListener('input', () => { confirm.setCustomValidity(confirm.value !== password.value ? 'Konfirmasi kata sandi belum cocok.' : ''); });
    }
    const feedback = message('');
    const submit = node('button', mode === 'register' ? 'Buat akun' : 'Masuk', 'button button--primary shop-submit');
    submit.type = 'submit';
    const switcher = button(mode === 'register' ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar', 'switch-auth', 'shop-link');
    switcher.dataset.mode = mode === 'register' ? 'login' : 'register';
    form.append(feedback, submit, switcher);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (confirm && password.value !== confirm.value) {
        feedback.textContent = 'Konfirmasi kata sandi belum cocok.';
        feedback.classList.add('shop-error');
        return;
      }
      submit.disabled = true;
      feedback.textContent = 'Memproses…';
      try {
        const response = await fetch(API + '/auth/' + (mode === 'register' ? 'register' : 'login'), {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ name: nameInput?.value, email: email.value, password: password.value, confirmPassword: confirm?.value }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Tidak dapat memproses akun.');
        user = result.user;
        addHeaderAccount();
        if (pendingBuy) checkout();
        else showOrders();
      } catch (error) {
        feedback.textContent = error.message;
        feedback.classList.add('shop-error');
        submit.disabled = false;
      }
    });
    show(mode === 'register' ? 'Daftar akun' : 'Masuk ke PadiSehat', form);
  }
  async function checkout() {
    if (!user) return auth('login');
    const data = pendingBuy;
    if (!data) return;
    const [addressField, address] = formField('Alamat pengiriman lengkap', 'textarea', 'address');
    address.rows = 3;
    const form = node('form', undefined, 'shop-form');
    form.append(node('p', data.product.nama + ' · ' + data.quantity + ' × ' + rupiah(data.product.harga), 'shop-copy'), addressField);
    const feedback = message('');
    const submit = node('button', 'Buat pesanan', 'button button--primary shop-submit');
    submit.type = 'submit';
    form.append(feedback, submit);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      submit.disabled = true;
      feedback.textContent = 'Membuat pesanan…';
      try {
        const response = await fetch(API + '/orders', {
          method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ items: [{ productId: data.product.id, quantity: data.quantity }], address: address.value }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Pesanan gagal dibuat.');
        order = result.order;
        pendingBuy = null;
        payment(result.bank);
      } catch (error) {
        feedback.textContent = error.message;
        feedback.classList.add('shop-error');
        submit.disabled = false;
      }
    });
    show('Alamat pengiriman', form);
  }
  function payment(bank) {
    const wrap = node('div', undefined, 'shop-form');
    wrap.append(node('p', 'Pesanan ' + order.id + ' berhasil dibuat. Transfer sesuai jumlah berikut, lalu unggah bukti pembayaran.', 'shop-copy'));
    wrap.append(node('div', undefined, 'shop-bank'));
    const bankCard = wrap.lastChild;
    bankCard.append(node('span', bank.name, 'shop-kicker'), node('strong', bank.account, 'shop-account-number'), node('span', 'a.n. ' + bank.holder));
    bankCard.append(node('strong', rupiah(order.total), 'shop-price'));
    const [fileField, file] = formField('Bukti transfer (PNG, JPG, WebP; maksimal 3 MB)', 'file', 'proof', { accept: 'image/png,image/jpeg,image/webp' });
    wrap.append(fileField);
    const feedback = message('');
    const submit = node('button', 'Kirim bukti pembayaran', 'button button--primary shop-submit');
    submit.type = 'button';
    submit.addEventListener('click', async () => {
      const imageFile = file.files?.[0];
      if (!imageFile) { feedback.textContent = 'Pilih gambar bukti transfer terlebih dahulu.'; feedback.classList.add('shop-error'); return; }
      if (imageFile.size > 3 * 1024 * 1024) { feedback.textContent = 'Ukuran bukti maksimal 3 MB.'; feedback.classList.add('shop-error'); return; }
      const reader = new FileReader();
      reader.onload = async () => {
        submit.disabled = true;
        feedback.textContent = 'Mengunggah bukti…';
        try {
          const response = await fetch(API + '/orders/' + order.id + '/proof', {
            method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ image: reader.result }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Unggah bukti gagal.');
          order = result.order;
          wrap.replaceChildren(node('span', '🌱', 'shop-success-mark'), node('h3', 'Bukti pembayaran terkirim'), node('p', 'Pesanan ' + order.id + ' menunggu verifikasi manual dari owner.'), button('Lihat pesanan', 'orders'));
        } catch (error) {
          feedback.textContent = error.message;
          feedback.classList.add('shop-error');
          submit.disabled = false;
        }
      };
      reader.readAsDataURL(imageFile);
    });
    wrap.append(feedback, submit);
    show('Pembayaran transfer', wrap);
  }
  async function showOrders() {
    try {
      const response = await fetch(API + '/orders', { credentials: 'same-origin' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Pesanan tidak dapat dimuat.');
      const list = node('div', undefined, 'shop-order-list');
      if (!result.orders.length) list.append(node('p', 'Belum ada pesanan. Pilih produk di katalog untuk memulai.'));
      result.orders.forEach((entry) => {
        const card = node('article', undefined, 'shop-order');
        card.append(node('strong', entry.id), node('span', rupiah(entry.total)), node('span', entry.status.replaceAll('_', ' ')));
        list.append(card);
      });
      show('Pesanan saya', list);
    } catch (error) { show('Pesanan saya', message(error.message, 'shop-error')); }
  }

  close.addEventListener('click', hide);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) hide(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !overlay.hidden) hide(); });
  root.addEventListener('click', (event) => {
    const detailButton = event.target.closest('.commerce-detail');
    if (detailButton) {
      event.preventDefault();
      const product = findProduct(detailButton.dataset.productName);
      if (product) detail(product);
      return;
    }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'account') user ? showOrders() : auth('login');
    if (action.dataset.action === 'switch-auth') auth(action.dataset.mode);
    if (action.dataset.action === 'orders') showOrders();
  });

  function upgradeCards() {
    root.querySelectorAll('.card').forEach((card) => {
      if (card.dataset.commerceReady) return;
      const name = card.querySelector('.card__title')?.textContent || '';
      const product = findProduct(name);
      const old = card.querySelector('.card__button');
      const body = card.querySelector('.card__body');
      if (!product || !old || !body || old.disabled) return;
      const detailButton = button('Lihat detail & beli', 'detail', 'button card__button button--primary commerce-detail');
      detailButton.dataset.productName = name;
      const question = node('a', 'Tanya owner', 'commerce-question');
      question.href = 'https://wa.me/6281234567890?text=' + encodeURIComponent('Halo PadiSehat, saya ingin bertanya tentang ' + name + '.');
      question.target = '_blank';
      question.rel = 'noopener noreferrer';
      question.setAttribute('aria-label', 'Tanya owner tentang ' + name + ' melalui WhatsApp');
      old.replaceWith(detailButton);
      body.append(question);
      card.dataset.commerceReady = 'true';
    });
  }
  const observer = new MutationObserver(upgradeCards);
  observer.observe(root, { childList: true, subtree: true });
  upgradeCards();
  addHeaderAccount();
  fetch(API + '/auth/me', { credentials: 'same-origin' })
    .then((response) => response.ok ? response.json() : null)
    .then((result) => { if (result?.user) { user = result.user; addHeaderAccount(); } })
    .catch(() => { /* API offline: katalog tetap bisa dibaca */ });
}
