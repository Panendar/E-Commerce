import React, { useEffect, useMemo, useState } from "react";
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import ProductDetail from './components/ProductDetails';
import "./App.css";

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function App() {
  const [mode, setMode] = useState("login");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const storagePrefix = currentUser ? `user:${currentUser}` : "guest";

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cartItems, setCartItems] = useState(() => loadFromStorage(`${storagePrefix}:cart`, []));
  const [orders, setOrders] = useState(() => loadFromStorage(`${storagePrefix}:orders`, []));

  useEffect(() => {
    // Reload user-specific data when user changes.
    setCartItems(loadFromStorage(`${storagePrefix}:cart`, []));
    setOrders(loadFromStorage(`${storagePrefix}:orders`, []));
  }, [storagePrefix]);

  useEffect(() => {
    saveToStorage(`${storagePrefix}:cart`, cartItems);
  }, [storagePrefix, cartItems]);

  useEffect(() => {
    saveToStorage(`${storagePrefix}:orders`, orders);
  }, [storagePrefix, orders]);

  useEffect(() => {
    if (mode !== "productDetail" || !selectedProductId) return;

    setDetailLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${selectedProductId}`)
      .then((res) => res.json())
      .then((data) => {
        setSelectedProduct(data);
        setDetailLoading(false);
      })
      .catch(() => {
        setSelectedProduct(null);
        setDetailLoading(false);
      });
  }, [mode, selectedProductId]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0);
  }, [cartItems]);

  const addToCart = (product) => {
    if (!product || !product.id) return;

    setCartItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: (p.quantity || 1) + 1 } : p));
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    alert("Added to cart");
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
  };

  const placeOrder = () => {
    if (!cartItems.length) return;

    const newOrder = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      items: cartItems,
      total: cartTotal,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setMode("orders");
  };

  const styles = {
    page: {
      maxWidth: 980,
      margin: "0 auto",
      padding: 16,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      padding: 12,
      border: "1px solid #ddd",
      borderRadius: 12,
      background: "#fff",
      marginBottom: 12,
    },
    title: { margin: 0 },
    nav: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
    btn: {
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #ccc",
      background: "#f7f7f7",
      cursor: "pointer",
    },
    primaryBtn: {
      padding: "10px 14px",
      borderRadius: 10,
      border: "1px solid #111",
      background: "#111",
      color: "#fff",
      cursor: "pointer",
    },
    card: {
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 12,
      background: "#fff",
      marginTop: 12,
    },
    muted: { color: "#666" },
    row: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
    list: { listStyle: "none", padding: 0, margin: 0 },
    listItem: {
      padding: 10,
      border: "1px solid #eee",
      borderRadius: 10,
      marginTop: 10,
      background: "#fafafa",
    },
  };

  const scopedCss = `
    .app { background: #f5f6f8; min-height: 100vh; }

    .products-page > div > div {
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .products-page img {
      width: 160px;
      height: 160px;
      object-fit: contain;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 10px;
    }

    .products-page h3 { margin-top: 0; }

    .products-page button {
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid #111;
      background: #111;
      color: #fff;
      cursor: pointer;
    }

    .product-detail-page img {
      max-width: 360px;
      max-height: 360px;
      width: 100%;
      height: auto;
      object-fit: contain;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 12px;
    }
  `;

  return(
    <div className = "app" style={styles.page}>
      <style>{scopedCss}</style>
      <div style={styles.header}>
        <h1 style={styles.title}>E-Commerce Website</h1>

        <div style={styles.nav}>
          {!currentUser ? (
            <>
              <button style={styles.btn} onClick={() => setMode('login')}>Login</button>
              <button style={styles.btn} onClick={() => setMode('register')}>Register</button>
            </>
          ) : (
            <>
              <span style={styles.muted}>Welcome, {currentUser}</span>
              <button style={styles.btn} onClick={() => setMode('products')}>Products</button>
              <button style={styles.btn} onClick={() => setMode('cart')}>Cart ({cartItems.length})</button>
              <button style={styles.btn} onClick={() => setMode('orders')}>Orders ({orders.length})</button>
              <button
                style={styles.btn}
                onClick={() => {
                  setCurrentUser(null);
                  setSelectedProductId(null);
                  setSelectedProduct(null);
                  setMode('login');
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>


      {mode === 'login' && (
        <Login
              onLoginSuccess={(username) => {
                setCurrentUser(username);
                setMode('products');
              }}
        />
      )}

      {mode === 'register' && <Register onRegisterSuccess= {() => setMode('login')} />}
      {mode === 'products' && (
        <div className="products-page">
          <Products
            onSelectProduct={(id) => {
              setSelectedProductId(id);
              setMode('productDetail');
            }}
          />
        </div>
      )}
      {mode === 'productDetail' && (
        <div className="product-detail-page">
          <ProductDetail 
            productId={selectedProductId}
            currentUser = {currentUser} 
            onBack={() => setMode('products')} 
          />

          <div style={styles.card}>
            <div style={styles.row}>
              <div>
                <div style={{ fontWeight: 600 }}>Quick Add</div>
                <div style={styles.muted}>Items: {cartItems.length}</div>
              </div>

              <button
                style={styles.primaryBtn}
                onClick={() => addToCart(selectedProduct)}
                disabled={detailLoading || !selectedProduct}
                title={!selectedProduct ? "Product not loaded" : ""}
              >
                {detailLoading ? "Loading..." : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'cart' && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Your Cart</h2>

          {cartItems.length === 0 ? (
            <p style={styles.muted}>Cart is empty</p>
          ) : (
            <>
              <ul style={styles.list}>
                {cartItems.map((item) => (
                  <li key={item.id} style={styles.listItem}>
                    <div style={styles.row}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <div style={styles.muted}>
                          Qty: {item.quantity || 1} • Price: ₹{item.price}
                        </div>
                      </div>

                      <button style={styles.btn} onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div style={{ ...styles.row, marginTop: 12 }}>
                <div style={{ fontWeight: 700 }}>Total: ₹{cartTotal}</div>
                <button style={styles.primaryBtn} onClick={placeOrder}>
                  Place Order
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {mode === 'orders' && (
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>Orders</h2>
          {orders.length === 0 ? (
            <p style={styles.muted}>No orders yet</p>
          ) : (
            <ul style={styles.list}>
              {orders.map((order) => (
                <li key={order.id} style={styles.listItem}>
                  <div style={{ fontWeight: 700 }}>Order #{order.id}</div>
                  <div style={styles.muted}>{new Date(order.createdAt).toLocaleString()}</div>
                  <div style={{ marginTop: 6 }}>Items: {order.items?.length || 0}</div>
                  <div style={{ fontWeight: 700, marginTop: 6 }}>Total: ₹{order.total}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

    </div>
  );
}

export default App;