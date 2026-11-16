import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/plus-jakarta-sans';
import './style.css';
import './commerce.css';

import { loadProducts, summarize } from './store.js';
import { renderApp } from './ui.js';
import { initCommerce } from './commerce.js';

const products = loadProducts();
const summary = summarize(products);
const app = document.querySelector('#app');

renderApp(app, { products, summary });
initCommerce(app, products);
