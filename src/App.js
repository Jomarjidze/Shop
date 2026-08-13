import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';

// ჩაანაცვლეთ თქვენი Firebase-ის რეალური მონაცემებით, რომელიც ფაირბეისის კონსოლიდან მოგეცემათ
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// ვრთავთ Firebase-ს
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');

  // ვადევნებთ თვალყურს მომხმარებლის რეალურ სტატუსს (შესულია თუ არა)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // რეალური Google-ით შესვლა
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("ავტორიზაციის შეცდომა:", error);
      alert("ავტორიზაცია ვერ მოხერხდა. შეამოწმეთ Firebase-ის პარამეტრები.");
    }
  };

  // რეალური Facebook-ით შესვლა
  const loginWithFacebook = async () => {
    const provider = new FacebookAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setShowLoginModal(false);
    } catch (error) {
      console.error("ავტორიზაციის შეცდომა:", error);
      alert("ავტორიზაცია ვერ მოხერხდა.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setCart([]);
  };

  // რეალური გათბობის ქვაბების სურათები და მონაცემები
  const boilersList = [
    { id: 1, name: "Bosch Condens 24kW", price: 2800, image: "https://images.unsplash.com/photo-1585938389612-a5e2a282626a?w=400&auto=format&fit=crop&q=80" },
    { id: 2, name: "Ariston Clas One 30kW", price: 3200, image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=400&auto=format&fit=crop&q=80" },
    { id: 3, name: "Vaillant ecoTEC Pro", price: 3500, image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80" },
    { id: 4, name: "Baxi Eco Four 24F", price: 2400, image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80" },
    { id: 5, name: "Immergas Eolo Mythos", price: 2100, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
    { id: 6, name: "Bosch Gaz 6000 W", price: 2600, image: "https://images.unsplash.com/photo-1542013936693-844e4d6c4d72?w=400&auto=format&fit=crop&q=80" }
  ];

  const allBoilers = [];
  for (let i = 1; i <= 60; i++) {
    const template = boilersList[(i - 1) % boilersList.length];
    allBoilers.push({
      id: i,
      name: `${template.name} (#${i})`,
      price: template.price + (i * 10) % 500,
      image: template.image
    });
  }

  const itemsPerPage = 20;
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentBoilers = allBoilers.slice(indexOfFirst, indexOfLast);

  const addToCart = (boiler) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setCart([...cart, boiler]);
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);

  const handleSimulatedPayment = (method) => {
    setPaymentStatus(`მიმდინარეობს დაკავშირება (${method})...`);
    setTimeout(() => {
      setPaymentStatus(`წარმატებით დასრულდა! შეკვეთა მიღებულია.`);
      setCart([]);
      setTimeout(() => {
        setShowCheckout(false);
        setPaymentStatus('');
      }, 2000);
    }, 1500);
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b", margin: 0, padding: 0 }}>
      
      {/* ნავიგაცია */}
      <nav style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <h2 style={{ margin: 0, fontSize: "22px", color: "#0f172a", fontWeight: "800" }}>
          🔥 THERMO<span style={{ color: "#2563eb" }}>GEORGIA</span>
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#475569" }}>👤 {user.displayName || user.email}</span>
              <button 
                onClick={() => setShowCart(true)}
                style={{ background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", padding: "8px 16px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                🛒 კალათა ({cart.length})
              </button>
              <button 
                onClick={handleLogout}
                style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                გასვლა
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLoginModal(true)}
              style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
            >
              შესვლა / რეგისტრაცია
            </button>
          )}
        </div>
      </nav>

      {/* მთავარი კონტენტი */}
      <main style={{ maxWidth: "1280px", margin: "40px auto", padding: "0 20px" }}>
        
        <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", color: "white", padding: "50px", borderRadius: "16px", marginBottom: "40px" }}>
          <h1 style={{ margin: "0 0 10px 0", fontSize: "36px", fontWeight: "800" }}>პრემიუმ კლასის გათბობის ქვაბები</h1>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "18px" }}>აირჩიეთ ევროპული ბრენდები ოფიციალური გარანტიით.</p>
        </div>

        {/* პროდუქტების სია */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" }}>
          {currentBoilers.map(boiler => (
            <div key={boiler.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
              <div style={{ height: "200px", overflow: "hidden", background: "#f1f5f9" }}>
                <img src={boiler.image} alt={boiler.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "17px", fontWeight: "700", color: "#0f172a" }}>{boiler.name}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px" }}>
                  <span style={{ fontSize: "20px", fontWeight: "800", color: "#2563eb" }}>{boiler.price} ₾</span>
                  <button 
                    onClick={() => addToCart(boiler)}
                    style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "600", cursor: "pointer" }}
                  >
                    დამატება
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* გვერდები */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", margin: "50px 0" }}>
          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                border: currentPage === num ? "none" : "1px solid #cbd5e1",
                background: currentPage === num ? "#2563eb" : "white",
                color: currentPage === num ? "white" : "#475569",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {num}
            </button>
          ))}
        </div>
      </main>

      {/* ავტორიზაციის რეალური არჩევანის ფანჯარა */}
      {showLoginModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1200 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", width: "400px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ margin: "0 0 10px 0" }}>ავტორიზაცია</h2>
            <p style={{ color: "#64748b", marginBottom: "25px" }}>აირჩიეთ სოციალური ქსელი სისტემაში შესასვლელად:</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <button onClick={loginWithGoogle} style={{ padding: "12px", background: "#ffffff", color: "#1e293b", border: "1px solid #cbd5e1", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                🔴 შესვლა Google-ით
              </button>
              <button onClick={loginWithFacebook} style={{ padding: "12px", background: "#1877f2", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                🔵 შესვლა Facebook-ით
              </button>
            </div>

            <button onClick={() => setShowLoginModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "600" }}>
              დახურვა
            </button>
          </div>
        </div>
      )}

      {/* კალათა */}
      {showCart && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "flex-end", zIndex: 1000 }}>
          <div style={{ background: "white", width: "450px", height: "100%", padding: "30px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px" }}>
              <h2 style={{ margin: 0, fontSize: "20px" }}>🛒 თქვენი კალათა</h2>
              <button onClick={() => setShowCart(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}>
              {cart.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8", marginTop: "50px" }}>კალათა ცარიელია</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", paddingBottom: "15px", borderBottom: "1px solid #f1f5f9" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", fontSize: "14px" }}>{item.name}</h4>
                      <span style={{ color: "#2563eb", fontWeight: "700" }}>{item.price} ₾</span>
                    </div>
                    <button onClick={() => removeFromCart(idx)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>წაშლა</button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "18px", fontWeight: "800" }}>
                  <span>სულ ჯამი:</span>
                  <span style={{ color: "#2563eb" }}>{totalPrice} ₾</span>
                </div>
                <button 
                  onClick={() => { setShowCart(false); setShowCheckout(true); }}
                  style={{ width: "100%", background: "#16a34a", color: "white", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "16px" }}
                >
                  შეკვეთის გაფორმება
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* გადახდის იმიტაცია */}
      {showCheckout && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "16px", width: "420px", textAlign: "center" }}>
            <h2 style={{ margin: "0 0 10px 0" }}>გადახდის იმიტაცია</h2>
            <p style={{ color: "#64748b", marginBottom: "25px" }}>სულ გადასახდელია: <strong style={{ color: "#0f172a" }}>{totalPrice} ₾</strong></p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "25px" }}>
              <button onClick={() => handleSimulatedPayment('საქართველოს ბანკი')} style={{ padding: "14px", background: "#fff7ed", color: "#c2410c", border: "1px solid #ffedd5", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                💳 საქართველოს ბანკი (BoG)
              </button>
              <button onClick={() => handleSimulatedPayment('TBC ბანკი')} style={{ padding: "14px", background: "#f0fdf4", color: "#15803d", border: "1px solid #dcfce7", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                💳 TBC ბანკი
              </button>
              <button onClick={() => handleSimulatedPayment('ონლაინ განვადება')} style={{ padding: "14px", background: "#f1f5f9", color: "#334155", border: "1px solid #e2e8f0", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
                📋 ონლაინ განვადება
              </button>
            </div>

            {paymentStatus && <p style={{ fontWeight: "700", color: "#16a34a", marginBottom: "20px" }}>{paymentStatus}</p>}

            <button onClick={() => setShowCheckout(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontWeight: "600" }}>
              დახურვა
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
