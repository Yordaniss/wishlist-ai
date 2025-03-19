import React, { useState, useEffect } from "react";
import { Input } from "@progress/kendo-react-inputs";
import { Button } from "@progress/kendo-react-buttons";
import { useNavigate } from "react-router-dom";
import { getDoc, setDoc, doc, db } from "../api/firebase"; // 🔹 Import Firestore instance

const Home = () => {
  const [wishlistId, setWishlistId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedId = localStorage.getItem("wishlistUserId");
    if (savedId) {
      setWishlistId(savedId);
    }
  }, []);

  const createNewWishlist = async () => {
    const wishlistId = Math.random().toString(36).substring(2, 10);
    const shareId = Math.random().toString(36).substring(2, 10); // ✅ Generate a share ID

    localStorage.setItem("wishlistUserId", wishlistId);

    try {
      await setDoc(doc(db, "wishlists", wishlistId), {
        shareId,
        createdAt: new Date(),
      });

      navigate(`/wishlist/${wishlistId}`);
    } catch (error) {
      console.error("Error creating wishlist:", error);
    }
  };

  const openWishlist = async () => {
    if (wishlistId === "") {
      alert("Please enter a valid Wishlist ID! ❌");
      return;
    }

    setLoading(true);

    try {
      const wishlistRef = doc(db, "wishlists", wishlistId);
      const wishlistSnap = await getDoc(wishlistRef);

      if (!wishlistSnap.exists()) {
        throw new Error("Wishlist not found ❌");
      }

      navigate(`/wishlist/${wishlistId}`);
    } catch (error) {
      alert("This Wishlist ID does not exist! ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "auto",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h2>🎁 Welcome to Wishlist App</h2>

      <Button
        primary={true}
        onClick={createNewWishlist}
        style={{ marginBottom: "15px" }}
      >
        ➕ Create New Wishlist
      </Button>

      <h3>🔍 Find Your Wishlist</h3>
      <Input
        value={wishlistId}
        onChange={(e) => setWishlistId(e.target.value)}
        placeholder="Enter Wishlist ID"
        disabled={loading}
      />
      <Button
        onClick={openWishlist}
        style={{ marginTop: "10px" }}
        disabled={loading}
      >
        {loading ? "🔄 Checking..." : "📂 Open Wishlist"}
      </Button>
    </div>
  );
};

export default Home;
