function initOrders() {
  const list = document.getElementById('orders-list');
  const alert = document.getElementById('orders-alert');
  if (!list) return;
  if (!Auth.requireLogin('orders.html')) return;
  API.request('/orders').then(({ data }) => {
    const orders = data.orders || [];
    if (!orders.length) { list.innerHTML = '<div class="empty">You have not placed an order yet. <a href="index.html">Start shopping</a></div>'; return; }
    list.innerHTML = orders.map((order) => `<article class="order-card"><div class="order-meta"><div><strong>Order #${order.id}</strong><div class="kicker">${new Date(order.createdAt).toLocaleString()}</div></div><div><span class="status">${escapeHtml(order.status)}</span><strong> ${money(order.totalAmount)}</strong></div></div><ul class="order-items">${(order.items || []).map((item) => `<li>${escapeHtml(item.name)} × ${item.quantity} — ${money(item.price * item.quantity)}</li>`).join('')}</ul><p class="kicker">Ship to: ${escapeHtml(order.shippingAddress).replace(/\n/g, '<br>')}</p></article>`).join('');
  }).catch((err) => { list.innerHTML = ''; setAlert(alert, err.message, 'error'); });
}
document.addEventListener('DOMContentLoaded', initOrders);
