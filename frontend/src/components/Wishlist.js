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
  deleteDoc,
  doc,
} from "../api/firebase";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [item, setItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    favorite: false,
  });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showItems, setShowItems] = useState({});

  useEffect(() => {
    let storedId = localStorage.getItem("wishlistUserId");
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("wishlistUserId", storedId);
    }
    setUserId(storedId);
    fetchWishlist(storedId);
  }, []);

  const fetchWishlist = async (uid) => {
    const querySnapshot = await getDocs(
      collection(db, `wishlists/${uid}/items`)
    );
    const items = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWishlist(items);
  };

  const addItem = async () => {
    if (!item.name) return;
    const newItem = { ...item };

    const docRef = await addDoc(
      collection(db, `wishlists/${userId}/items`),
      newItem
    );
    setWishlist([...wishlist, { id: docRef.id, ...newItem }]);
    setItem({
      name: "",
      price: "",
      description: "",
      category: "",
      favorite: false,
    });

    setShowItems((prev) => ({ ...prev, [docRef.id]: true }));
  };

  const [progress, setProgress] = useState(0);

  const fetchRecommendations = async (itemName) => {
    setLoading(true);
    setProgress(0); // Reset progress

    // Simulate progress update
    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 90) {
          clearInterval(interval);
          return oldProgress; // Stop at 90%, wait for API response
        }
        return oldProgress + 5; // Increase by 10% every 300ms
      });
    }, 300);

    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations?item=${itemName}`
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
      setProgress(100); // Finish at 100%
      setTimeout(() => setLoading(false), 500); // Hide after short delay
    }
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(db, `wishlists/${userId}/items`, id));
    setWishlist(wishlist.filter((item) => item.id !== id));
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
          style={{ width: "300px" }}
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

      <div>
        {wishlist.map((wishlistItem) => (
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
                borderBottom: "1px solid #ddd",
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

              <div style={{ flexGrow: 1, marginLeft: "10px" }}>
                <strong>{wishlistItem.name}</strong> - ${wishlistItem.price}
                <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                  {wishlistItem.description}
                </p>
              </div>

              {wishlistItem.favorite && (
                <Chip
                  text="❤️ Favorite"
                  style={{
                    backgroundColor: "#ff6f61",
                    color: "#fff",
                    marginRight: "5px",
                  }}
                />
              )}

              <Button
                onClick={() => fetchRecommendations(wishlistItem.name)}
                look="flat"
                style={{ marginRight: "5px" }}
              >
                🔍 Recommend
              </Button>
              <Button onClick={() => removeItem(wishlistItem.id)} look="flat">
                ❌
              </Button>
            </div>
          </Animation>
        ))}
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
            padding: "10px",
            borderRadius: "5px",
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
