import React, { useState, useEffect } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Button } from "@progress/kendo-react-buttons";
import { Input } from "@progress/kendo-react-inputs";
import { Notification } from "@progress/kendo-react-notification";
import { db, collection, addDoc, getDocs, deleteDoc, doc } from "../api/firebase";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [item, setItem] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // 🔹 Assign a unique ID if the user is new
    let storedId = localStorage.getItem("wishlistUserId");
    if (!storedId) {
      storedId = Math.random().toString(36).substring(2, 10);
      localStorage.setItem("wishlistUserId", storedId);
    }
    setUserId(storedId);

    // 🔹 Fetch wishlist from Firestore
    fetchWishlist(storedId);
  }, []);

  // Fetch Wishlist from Firestore
  const fetchWishlist = async (uid) => {
    const querySnapshot = await getDocs(collection(db, `wishlists/${uid}/items`));
    const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setWishlist(items);
  };

  // Add Item to Firestore
  const addItem = async () => {
    if (!item) return;
    const newItem = { name: item };
    
    // 🔹 Save to Firestore
    const docRef = await addDoc(collection(db, `wishlists/${userId}/items`), newItem);
    setWishlist([...wishlist, { id: docRef.id, ...newItem }]);
    setItem("");

    // Fetch AI Recommendations
    await fetchRecommendations(item);
  };

  // Fetch AI-powered recommendations
  const fetchRecommendations = async (itemName) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/recommendations?item=${itemName}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("API Error:", data.error);
        return;
      }

      setRecommendations(data.suggestions || []);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  // Remove Item from Firestore
  const removeItem = async (id) => {
    await deleteDoc(doc(db, `wishlists/${userId}/items`, id));
    setWishlist(wishlist.filter(item => item.id !== id));
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>My Wishlist</h2>
      <Input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Enter an item" />
      <Button onClick={addItem} primary={true} style={{ marginLeft: "10px" }}>Add</Button>

      <Grid data={wishlist} style={{ marginTop: "20px" }}>
        <GridColumn field="name" title="Wishlist Item" />
        <GridColumn
          title="Actions"
          cell={(props) => (
            <td>
              <Button onClick={() => removeItem(props.dataItem.id)} look="flat" icon="delete" />
            </td>
          )}
        />
      </Grid>

      {showNotification && (
        <Notification type={{ style: "success", icon: true }}>
          <div>
            <strong>AI Recommendations:</strong>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        </Notification>
      )}
    </div>
  );
};

export default Wishlist;
