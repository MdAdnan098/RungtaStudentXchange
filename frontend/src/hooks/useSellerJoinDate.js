import { useEffect, useState } from "react";
import { getUserById } from "@/api/users";

/**
 * BACKEND LIMITATION: GET /users/:id (userController.js getUserById)
 * is a public route with no field selection — it returns the raw
 * User document via `User.findById(req.params.id)`, which includes
 * email, phone, bio, isBanned/bannedReason, and even the user's
 * private `wishlist` array. Only `password` and `avatarPublicId` are
 * stripped (via the model's toJSON). None of that is this hook's
 * business: it destructures out `createdAt` only and discards
 * everything else, so nothing sensitive ever reaches SellerCard or
 * gets rendered. This is a UI-side mitigation, not a fix — the
 * over-exposure itself is a backend issue outside this task's scope
 * (backend is treated as final/unmodifiable).
 */
export const useSellerJoinDate = (sellerId) => {
  const [joinDate, setJoinDate] = useState(null);

  useEffect(() => {
    if (!sellerId) return;

    const controller = new AbortController();

    getUserById(sellerId, { signal: controller.signal })
      .then((response) => setJoinDate(response.data.data.user.createdAt))
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setJoinDate(null);
      });

    return () => controller.abort();
  }, [sellerId]);

  return joinDate;
};
