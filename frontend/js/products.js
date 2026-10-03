async function loadCatalog() {
  const grid = document.getElementById('product-grid');
  const empty = document.getElementById('catalog-empty');
  const errorBox = document.getElementById('catalog-error');
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');

  if (!grid) return;

  grid.innerHTML = '<div class="loading">Loading products from the store...</div>';
  empty.hidden = true;
  errorBox.hidden = true;

  try {
    const params = new URLSearchParams();
    if (searchInput.value.trim()) params.set('search', searchInput.value.trim());
    if (categorySelect.value && categorySelect.value !== 'all') params.set('category', categorySelect.value);

    const query = params.toString() ? `?${params.toString()}` : '';
    const { data } = await API.request(`/products${query}`);
    const products = data.products || [];
    const categories = data.categories || [];

    const current = categorySelect.value || 'all';
    categorySelect.innerHTML = '<option value="all">All categories</option>' +
      categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    categorySelect.value = categories.includes(current) ? current : 'all';

    if (!products.length) {
      grid.innerHTML = '';
      empty.hidden = false;
      return;
    }

    grid.innerHTML = products.map((product) => productCard(product)).join('');
    grid.querySelectorAll('[data-add]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = Number(button.getAttribute('data-add'));
        const product = products.find((item) => item.id === id);
        try {
          Cart.add(product, 1);
          showToast(`${product.name} added to cart`);
        } catch (err) {
          showToast(err.message);
        }
      });
    });
  } catch (err) {
    grid.innerHTML = '';
    errorBox.hidden = false;
    errorBox.textContent = err.message;
  }
}

function productCard(product) {
  const inStock = product.stock > 0;
  return `
    <article class="product-card">
      <div class="thumb"><img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}"></div>
      <div class="body">
        <div class="kicker">${escapeHtml(product.category)}</div>
        <h2>${escapeHtml(product.name)}</h2>
        <div class="price">${money(product.price)}</div>
        <div class="stock ${inStock ? 'in' : 'out'}">${inStock ? `${product.stock} in stock` : 'Out of stock'}</div>
        <div class="actions">
          <a class="btn btn-ghost" href="product.html?id=${product.id}">View Details</a>
          <button class="btn btn-primary" data-add="${product.id}" ${inStock ? '' : 'disabled'}>Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

async function loadProductDetail() {
  const root = document.getElementById('product-root');
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) {
    root.innerHTML = '<div class="error-box">No product selected. <a href="index.html">Back to store</a></div>';
    return;
  }

  root.innerHTML = '<div class="loading">Loading product...</div>';

  try {
    const { data } = await API.request(`/products/${encodeURIComponent(id)}`);
    const product = data.product;
    const inStock = product.stock > 0;
    document.title = `${product.name} · Hardware Desk`;

    root.innerHTML = `
      <article class="product-detail">
        <div class="art"><img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}"></div>
        <div>
          <div class="kicker">${escapeHtml(product.category)}</div>
          <h1>${escapeHtml(product.name)}</h1>
          <p>${escapeHtml(product.description)}</p>
          <p class="price">${money(product.price)}</p>
          <p class="stock ${inStock ? 'in' : 'out'}">${inStock ? `${product.stock} in stock` : 'Out of stock'}</p>
          <div class="qty-row">
            <label for="qty">Quantity</label>
            <input id="qty" type="number" min="1" max="${product.stock || 1}" value="1" ${inStock ? '' : 'disabled'}>
          </div>
          <button class="btn btn-primary" id="add-detail" ${inStock ? '' : 'disabled'}>Add to Cart</button>
        </div>
      </article>
    `;

    document.getElementById('add-detail').addEventListener('click', () => {
      const quantity = Number(document.getElementById('qty').value);
      try {
        Cart.add(product, quantity);
        showToast(`${product.name} added to cart`);
      } catch (err) {
        showToast(err.message);
      }
    });
  } catch (err) {
    root.innerHTML = `<div class="error-box">${escapeHtml(err.message)} <a href="index.html">Back to store</a></div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('product-grid')) {
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    searchInput.addEventListener('input', debounce(loadCatalog, 250));
    categorySelect.addEventListener('change', loadCatalog);
    loadCatalog();
  }
  loadProductDetail();
});

function debounce(fn, wait) {
  let timer;
  return function wrapped(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}
