import React, { useState, useEffect } from "react";
import { Button } from "@progress/kendo-react-buttons";
import { Input, TextArea, Checkbox } from "@progress/kendo-react-inputs";
import { DropDownList } from "@progress/kendo-react-dropdowns";
import { Avatar } from "@progress/kendo-react-layout";
import { Chip } from "@progress/kendo-react-buttons";
import { Animation } from "@progress/kendo-react-animation";
import { Notification } from "@progress/kendo-react-notification";
import { ProgressBar } from "@progress/kendo-react-progressbars";
import {
  db,
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
} from "../api/firebase";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ id: "", shareId: "", items: [] });
  const [item, setItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    favorite: false,
  });
  const [userId, setUserId] = useState(null);
  const [showItems, setShowItems] = useState({});
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch wishlist on component mount
  useEffect(() => {
    let storedId = localStorage.getItem("wishlistUserId");
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("wishlistUserId", storedId);
    }
    setUserId(storedId);
    fetchWishlist(storedId);
  }, []);

  // ✅ Fetch Wishlist (Metadata + Items)
  const fetchWishlist = async (uid) => {
    try {
      const wishlistRef = doc(db, "wishlists", uid);
      const wishlistSnap = await getDoc(wishlistRef);

      if (!wishlistSnap.exists()) {
        alert("❌ Wishlist not found!");
        return;
      }

      const wishlistData = wishlistSnap.data(); // 🔹 Get shareId

      const itemsQuerySnapshot = await getDocs(
        collection(db, `wishlists/${uid}/items`)
      );
      const items = itemsQuerySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setWishlist({ id: uid, shareId: wishlistData.shareId, items });
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  // ✅ Add New Item
  const addItem = async () => {
    if (!item.name) return;
    const newItem = { ...item, reservedBy: null };

    const docRef = await addDoc(
      collection(db, `wishlists/${userId}/items`),
      newItem
    );
    setWishlist((prev) => ({
      ...prev,
      items: [...prev.items, { id: docRef.id, ...newItem }],
    }));

    setItem({
      name: "",
      price: "",
      description: "",
      category: "",
      favorite: false,
    });
    setShowItems((prev) => ({ ...prev, [docRef.id]: true }));
  };

  // ✅ Share Wishlist
  const shareWishlist = () => {
    if (!wishlist.shareId) {
      alert("❌ Error: Share ID not found!");
      return;
    }

    const shareLink = `${window.location.origin}/shared/${wishlist.shareId}`;
    navigator.clipboard.writeText(shareLink);
    alert("📋 Wishlist link copied! Share it with friends.");
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setProgress(0); // Reset progress

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          clearInterval(interval);
          return oldProgress;
        }
        return oldProgress + 5;
      });
    }, 300);

    try {
      const response = await fetch(
        "http://localhost:5000/api/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: wishlist.items.map((i) => i.name) }),
        }
      );

      const data = await response.json();
      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }

      setRecommendations(data.split("\n"));
      setShowRecommendations(true);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => setLoading(false), 500);
    }
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, `wishlists/${userId}/items`, id));
    setWishlist(wishlist.items.filter((item) => item.id !== id));
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2>🎁 My Wishlist</h2>
      <Button
        onClick={shareWishlist}
        primary={true}
        style={{ marginBottom: "10px" }}
      >
        📢 Share Wishlist
      </Button>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Input
          value={item.name}
          onChange={(e) => setItem({ ...item, name: e.value })}
          placeholder="Item Name"
        />
        <Input
          value={item.price}
          onChange={(e) => setItem({ ...item, price: e.value })}
          placeholder="Price"
        />
        <TextArea
          value={item.description}
          onChange={(e) => setItem({ ...item, description: e.value })}
          placeholder="Description"
        />
        <DropDownList
          data={["Electronics", "Clothing", "Books", "Accessories"]}
          value={item.category || null}
          onChange={(e) => setItem({ ...item, category: e.target.value })}
          defaultItem="Select Category"
        />
      </div>
      <div style={{ marginTop: "10px" }}>
        <Checkbox
          checked={item.favorite}
          label="❤️ Mark as Favorite"
          onChange={(e) => setItem({ ...item, favorite: e.value })}
        />
        <Button onClick={addItem} primary={true} style={{ marginTop: "10px" }}>
          ➕ Add to Wishlist
        </Button>
      </div>

      <h3 style={{ marginTop: "20px" }}>📜 Wishlist Items</h3>
      {wishlist.length === 0 ? <p>No items yet!</p> : null}

      <div
        style={{
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px",
          margin: "10px 0",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {wishlist.items.map((wishlistItem) => (
          <Animation
            key={wishlistItem.id}
            transitionName="fade"
            appear={showItems[wishlistItem.id]}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px",
              }}
            >
              <Avatar
                shape="circle"
                type="text"
                style={{
                  backgroundColor: "#6a1b9a",
                  color: "white",
                  fontSize: "14px",
                }}
              >
                {wishlistItem.name.charAt(0)}
              </Avatar>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  margin: "10px",
                  width: "500px",
                }}
              >
                {/* Left Section: Item Details */}
                <div
                  style={{
                    flexGrow: 1,
                    opacity: wishlistItem.reserved ? 0.6 : 1, // Dim reserved items
                    textDecoration: wishlistItem.reserved
                      ? "line-through"
                      : "none", // Strike-through
                  }}
                >
                  <strong>{wishlistItem.name}</strong> - ${wishlistItem.price}
                  <p
                    style={{
                      fontSize: "12px",
                      color: wishlistItem.reserved ? "#888" : "#666",
                      margin: 0,
                    }}
                  >
                    {wishlistItem.description}
                  </p>
                </div>

                {/* Right Section: Favorite Chip & Remove Button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginLeft: "200px",
                  }}
                >
                  {wishlistItem.favorite && (
                    <Chip
                      text="❤️"
                      style={{
                        backgroundColor: "#ff6f61",
                        color: "#fff",
                      }}
                    />
                  )}

                  <Button
                    onClick={() => removeItem(wishlistItem.id)}
                    look="flat"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            </div>
          </Animation>
        ))}
      </div>
      <div>
        <Button
          onClick={fetchRecommendations}
          primary={true}
          look="flat"
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            fontSize: "16px",
            fontWeight: "bold",
            borderRadius: "8px",
            background: "linear-gradient(45deg, #6a1b9a, #ff6f61)",
            color: "white",
            transition: "all 0.3s ease",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            width: "575px",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          🔍 Get AI-Recommendations
        </Button>
      </div>

      {loading && (
        <div style={{ marginTop: "20px" }}>
          <h4>Loading Recommendations...</h4>
          <ProgressBar
            value={progress}
            animationDuration={200}
            style={{ width: "100%" }}
          />
        </div>
      )}

      {showRecommendations && (
        <Notification
          type={{ style: "success", icon: true }}
          closable={true}
          onClose={() => setShowRecommendations(false)}
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "10px",
            background: "#e3fcef",
            color: "#2e7d32",
            fontWeight: "bold",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <strong>🤖 AI Recommendations:</strong>
          <ul>
            {recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </Notification>
      )}
    </div>
  );
};

export default Wishlist;
