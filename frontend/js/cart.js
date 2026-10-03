const CART_KEY = 'hd_cart';

const Cart = {
  read() {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    try {
      const items = JSON.parse(raw);
      return Array.isArray(items) ? items : [];
    } catch (err) {
      return [];
    }
  },

  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Auth.updateNav();
  },

  totalQuantity() {
    return this.read().reduce((sum, item) => sum + Number(item.quantity), 0);
  },

  subtotal() {
    return this.read().reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  },

  add(product, quantity = 1) {
    const parsedQuantity = Number(quantity);
    const qty = Number.isInteger(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
    if (product.stock <= 0) {
      throw new Error('This product is out of stock.');
    }

    const items = this.read();
    const existing = items.find((item) => item.productId === product.id);
    const nextQty = existing ? existing.quantity + qty : qty;

    if (nextQty > product.stock) {
      throw new Error(`Only ${product.stock} in stock.`);
    }

    if (existing) {
      existing.quantity = nextQty;
    } else {
      items.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        quantity: qty
      });
    }

    this.write(items);
  },

  setQuantity(productId, quantity, stock) {
    const items = this.read();
    const item = items.find((entry) => entry.productId === productId);
    if (!item) return;

    const max = stock != null ? Number(stock) : Number(item.stock);
    const nextQuantity = Number(quantity);
    if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
      this.remove(productId);
      return;
    }
    if (nextQuantity > max) {
      throw new Error(`Only ${max} in stock.`);
    }
    item.quantity = nextQuantity;
    this.write(items);
  },

  remove(productId) {
    this.write(this.read().filter((item) => item.productId !== productId));
  },

  clear() {
    this.write([]);
  }
};

window.Cart = Cart;
