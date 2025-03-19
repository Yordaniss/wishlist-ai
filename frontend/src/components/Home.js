import React, { useState } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [wishlistId, setWishlistId] = useState("");
  const navigate = useNavigate();

  const createNewWishlist = () => {
    const newId = Math.random().toString(36).substring(2, 10);
    localStorage.setItem("wishlistUserId", newId);
    navigate(`/wishlist/${newId}`);
  };

  const openWishlist = () => {
    if (wishlistId.trim() !== "") {
      navigate(`/wishlist/${wishlistId}`);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", textAlign: "center", padding: "20px" }}>
      <h2>🎁 Welcome to Wishlist App</h2>
      
      <Button primary={true} onClick={createNewWishlist} style={{ marginBottom: "15px" }}>
        ➕ Create New Wishlist
      </Button>

      <h3>🔍 Find Your Wishlist</h3>
      <Input
        value={wishlistId}
        onChange={(e) => setWishlistId(e.target.value)}
        placeholder="Enter Wishlist ID"
      />
      <Button onClick={openWishlist} style={{ marginTop: "10px" }}>
        📂 Open Wishlist
      </Button>
    </div>
  );
};

export default Home;
