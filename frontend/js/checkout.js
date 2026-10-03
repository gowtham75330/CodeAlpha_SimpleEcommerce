function renderCartPage() {
  const list = document.getElementById('cart-list');
  const summary = document.getElementById('cart-summary');
  if (!list || !summary) return;
  const items = Cart.read();
  if (!items.length) { list.innerHTML = '<div class="empty">Your cart is empty. <a href="index.html">Continue shopping</a></div>'; summary.innerHTML = ''; return; }
  list.innerHTML = items.map((item) => `<div class="cart-item"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}"><div><strong>${escapeHtml(item.name)}</strong><div class="kicker">${money(item.price)} each</div><div class="qty-controls"><button type="button" data-dec="${item.productId}">−</button><span>${item.quantity}</span><button type="button" data-inc="${item.productId}">+</button><button type="button" class="linkish" data-remove="${item.productId}">Remove</button></div></div><div class="price">${money(item.price * item.quantity)}</div></div>`).join('');
  const subtotal = Cart.subtotal();
  summary.innerHTML = `<h2>Summary</h2><div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div><div class="summary-row total"><span>Total</span><span>${money(subtotal)}</span></div><p><a class="btn btn-ghost btn-block" href="index.html">Continue shopping</a></p><p><a class="btn btn-primary btn-block" href="checkout.html">Proceed to checkout</a></p>`;
  list.querySelectorAll('[data-inc], [data-dec]').forEach((button) => button.addEventListener('click', () => { const id = Number(button.dataset.inc || button.dataset.dec); const item = Cart.read().find((entry) => entry.productId === id); try { Cart.setQuantity(id, item.quantity + (button.dataset.inc ? 1 : -1), item.stock); renderCartPage(); } catch (err) { showToast(err.message); } }));
  list.querySelectorAll('[data-remove]').forEach((button) => button.addEventListener('click', () => { Cart.remove(Number(button.dataset.remove)); renderCartPage(); }));
}
function renderCheckout() {
  const form = document.getElementById('checkout-form');
  const summary = document.getElementById('checkout-summary');
  if (!form || !summary) return;
  if (!Auth.requireLogin('checkout.html')) return;
  const items = Cart.read();
  if (!items.length) { summary.innerHTML = '<div class="empty">Your cart is empty. <a href="index.html">Shop products</a></div>'; form.hidden = true; return; }
  summary.innerHTML = `<h2>Order summary</h2>${items.map((item) => `<div class="summary-row"><span>${escapeHtml(item.name)} × ${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join('')}<div class="summary-row total"><span>Total</span><span>${money(Cart.subtotal())}</span></div>`;
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); const alert = document.getElementById('checkout-alert'); const button = form.querySelector('button[type="submit"]'); button.disabled = true; setAlert(alert, '', ''); const data = new FormData(form);
    const payload = { items: Cart.read().map((item) => ({ productId: item.productId, quantity: item.quantity })), fullName: data.get('fullName'), phone: data.get('phone'), address: data.get('address'), city: data.get('city'), state: data.get('state'), postalCode: data.get('postalCode') };
    try { const response = await API.request('/orders', { method: 'POST', body: JSON.stringify(payload) }); Cart.clear(); form.hidden = true; summary.innerHTML = `<div class="alert ok"><strong>Order confirmed.</strong><br>Order #${response.data.order.id} has been placed.</div><p><a class="btn btn-primary btn-block" href="orders.html">View my orders</a></p><p><a class="btn btn-ghost btn-block" href="index.html">Continue shopping</a></p>`; setAlert(alert, 'Thank you — your order was placed successfully.', 'ok'); } catch (err) { setAlert(alert, err.message, 'error'); button.disabled = false; }
  });
}
document.addEventListener('DOMContentLoaded', () => { renderCartPage(); renderCheckout(); });
