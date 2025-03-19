import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocs, collection, query, where, updateDoc, doc, db } from "../api/firebase";

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
    <div>
      <h2>🎁 Shared Wishlist</h2>
      {wishlist.map((item) => (
        <div key={item.id}>
          <span>{item.name} - {item.price}</span>
          {!item.reserved ? (
            <button onClick={() => reserveItem(item.id)}>Reserve</button>
          ) : (
            <span>✅ Reserved</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default SharedWishlist;
