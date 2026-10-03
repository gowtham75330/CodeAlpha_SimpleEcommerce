# Hardware Desk — CodeAlpha Simple Ecommerce

Hardware Desk is a small full-stack ecommerce application for the CodeAlpha Task 1 internship project. It provides a product catalog, product detail pages, a browser cart, account registration and login, authenticated checkout, and order history backed by MySQL.

## CodeAlpha Task 1 Requirements

| CodeAlpha requirement | Implementation location | Verification |
|---|---|---|
| Product listings | `frontend/index.html`, `frontend/js/products.js`, `GET /api/products` | **COMPLETE** — products load from MySQL with search and category filters |
| Product details | `frontend/product.html`, `frontend/js/products.js`, `GET /api/products/:id` | **COMPLETE** — valid and invalid product IDs are handled |
| Shopping cart | `frontend/cart.html`, `frontend/js/cart.js`, `frontend/js/checkout.js` | **COMPLETE** — localStorage persistence, quantity limits, removal, subtotal, and cart count |
| Order processing | `frontend/checkout.html`, `backend/src/services/orderService.js`, `POST /api/orders` | **COMPLETE** — transactional order creation and stock decrement verified |
| User registration | `frontend/register.html`, `backend/src/controllers/authController.js` | **COMPLETE** — bcrypt hashing and duplicate-email `409` handling verified |
| User login | `frontend/login.html`, JWT middleware and `frontend/js/auth-pages.js` | **COMPLETE** — JWT storage, invalid credentials, logout, and protected-page redirects verified |
| Database for products, users, and orders | `database/schema.sql`, `database/seed.sql`, MySQL models | **COMPLETE** — `users`, `products`, `orders`, and `order_items` verified |
| HTML, CSS, and vanilla JavaScript | `frontend/*.html`, `frontend/css/style.css`, `frontend/js/*.js` | **COMPLETE** — no frontend framework is used |
| Express.js backend | `backend/src/app.js`, routes, controllers, services | **COMPLETE** — health, catalog, auth, orders, and static frontend serving verified |

The final audit found no remaining task-blocking issue. The only expected local setup dependency is that MySQL must be installed and running before `npm run setup-db` or `npm run dev`.

## Features

- Product listings with search and category filtering
- Product detail pages with stock-aware add-to-cart controls
- Local-storage shopping cart with quantity changes and removal
- User registration and login with JWT authentication
- Authenticated order checkout with shipping information
- Transactional order creation, stock checks, and stock decrementing
- Per-user order history; order queries are scoped to the authenticated user
- Locally bundled SVG product artwork with no external image dependency
- Friendly validation and API error responses, including malformed JSON handling

## Technologies

- HTML, CSS, and vanilla JavaScript
- Node.js and Express.js
- MySQL 8+
- mysql2, bcrypt, jsonwebtoken, cors, and dotenv

## Folder structure

```text
.
├── backend/
│   ├── src/              # Express app, routes, controllers, models, services
│   ├── .env              # Local environment values (do not commit real secrets)
│   └── package.json
├── database/
│   ├── schema.sql        # Idempotent schema creation
│   └── seed.sql          # Sample products
├── frontend/
│   ├── assets/           # Local product SVG artwork
│   ├── css/style.css
│   ├── js/               # API, auth, cart, catalog, checkout, and orders logic
│   └── *.html
├── mysql-dev.ini
└── start-local-mysql.bat
```

## MySQL setup

Install MySQL Server 8 and make sure the `mysql` and `mysqld` tools are available. The included Windows launcher initializes `.mysql-data` **only when no data directory exists**, then starts MySQL without deleting existing data. Run it from the project folder:

```bat
start-local-mysql.bat
```

On another OS, start MySQL normally and then run the database setup script below. The setup applies `database/schema.sql` and seeds products only when the products table is empty, so normal restarts do not wipe data.

## Environment variables

Copy `.env.example` to `backend/.env` and set values appropriate for your machine:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=codealpha_ecommerce
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
```

`backend/.env` is loaded by the backend configuration. Use a long random `JWT_SECRET` outside local development and never commit real credentials.

## Installation and startup

```bash
cd backend
npm install
npm run setup-db
npm start
```

The API and frontend are served together at <http://localhost:5000>. Open the URL printed by the server. If port 5000 is already occupied, the application automatically tries the next available ports (5001, 5002, and so on) and prints the correct URL. The frontend uses the current server origin, so it also works on a fallback port. For development with Node's built-in watcher, use `npm run dev`.

## API endpoints

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List products, optionally with `search` and `category` |
| GET | `/api/products/:id` | No | Product details |
| POST | `/api/auth/register` | No | Create an account and return a JWT |
| POST | `/api/auth/login` | No | Log in and return a JWT |
| GET | `/api/auth/me` | Bearer token | Return the current user |
| POST | `/api/orders` | Bearer token | Validate cart and create an order |
| GET | `/api/orders` | Bearer token | List the current user's orders |
| GET | `/api/orders/:id` | Bearer token | Read one of the current user's orders |

Order creation expects `items` with `productId` and `quantity`, plus `fullName`, `phone`, `address`, `city`, `state`, and `postalCode`. Prices are always read from the database; the browser cannot set the order total.

## Authentication and order flow

The frontend stores the returned JWT and public user object in local storage. Protected pages redirect to `login.html` with a `next` parameter. At checkout, the backend locks and rechecks products inside a MySQL transaction, rejects unavailable stock, inserts the order and order items, decreases stock, and commits the transaction. The cart is cleared only after a successful API response.

## Testing

Automated smoke checks can be run after MySQL is available:

```bash
cd backend
npm run setup-db
npm start
```

In another terminal:

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/products
curl -i -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

For the complete browser flow, register, log in, add a product, change quantity, remove an item, place an order, and verify it appears on My Orders. Also verify invalid credentials, duplicate email, out-of-stock quantities, malformed JSON, and access to another user's order are rejected.

## Future improvements

- Add automated integration tests and browser tests
- Add product administration and image upload tooling
- Add pagination and richer product filtering
- Add email notifications and a production payment provider
- Add secure cookie-based sessions and CSRF protection for a production deployment
