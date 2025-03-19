import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Wishlist from "./components/Wishlist";
import '@progress/kendo-theme-default/dist/all.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wishlist/:id" element={<Wishlist />} />
      </Routes>
    </Router>
  );
};

export default App;
