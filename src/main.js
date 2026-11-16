import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/plus-jakarta-sans';
import './style.css';

import { loadProducts, summarize } from './store.js';
import { renderApp } from './ui.js';

const products = loadProducts();
const summary = summarize(products);

renderApp(document.querySelector('#app'), { products, summary });
