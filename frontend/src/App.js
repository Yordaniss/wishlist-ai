import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Wishlist from "./components/Wishlist";
import Header from "./components/Header";
import SharedWishlist from "./components/SharedWishlist";
import "@progress/kendo-theme-default/dist/all.css";
import "./App.css";

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist/:id" element={<Wishlist />} />
          <Route path="/shared/:shareId" element={<SharedWishlist />} /> {/* ✅ Add shared route */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
