import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocs, collection, query, where, updateDoc, doc, db } from "../api/firebase";
import { Button } from "@progress/kendo-react-buttons";
import { Avatar } from "@progress/kendo-react-layout";
import { Chip } from "@progress/kendo-react-buttons";

const SharedWishlist = () => {
  const { shareId } = useParams();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistId, setWishlistId] = useState(null);

  useEffect(() => {
    const fetchWishlist = async () => {
      const q = query(collection(db, "wishlists"), where("shareId", "==", shareId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("Wishlist not found! ❌");
        return;
      }

      const wishlistDoc = querySnapshot.docs[0];
      setWishlistId(wishlistDoc.id);

      const itemsRef = collection(db, `wishlists/${wishlistDoc.id}/items`);
      const itemsSnapshot = await getDocs(itemsRef);

      setWishlist(itemsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchWishlist();
  }, [shareId]);

  const reserveItem = async (itemId) => {
    if (!wishlistId) return;

    const itemRef = doc(db, `wishlists/${wishlistId}/items`, itemId);
    try {
      await updateDoc(itemRef, { reserved: true });
      setWishlist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, reserved: true } : item
        )
      );
    } catch (error) {
      console.error("Error reserving item:", error);
    }
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
      <h2>🎁 Shared Wishlist</h2>
      
      {wishlist.length === 0 ? <p>No items available.</p> : null}

      {wishlist.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            margin: "10px 0",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease-in-out",
          }}
        >
          {/* Left: Avatar + Details */}
          <div style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            <Avatar
              shape="circle"
              type="text"
              style={{
                backgroundColor: "#6a1b9a",
                color: "white",
                fontSize: "14px",
                marginRight: "10px",
              }}
            >
              {item.name.charAt(0)}
            </Avatar>

            <div>
              <strong>{item.name}</strong> - ${item.price}
              <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>
                {item.description}
              </p>
            </div>
          </div>

          {/* Right: Favorite Chip + Reserve Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {item.favorite && (
              <Chip
                text="❤️"
                style={{
                  backgroundColor: "#ff6f61",
                  color: "#fff",
                }}
              />
            )}

            {!item.reserved ? (
              <Button onClick={() => reserveItem(item.id)} primary>
                Reserve
              </Button>
            ) : (
              <Chip
                text="✅ Reserved"
                style={{ backgroundColor: "#28a745", color: "#fff", width: "105px" }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SharedWishlist;
