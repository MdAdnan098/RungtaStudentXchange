import axiosInstance from "@/api/axiosInstance";
import { ENDPOINTS } from "@/constants/endpoints";

export const getMyNotifications = ({ signal } = {}) =>
  axiosInstance.get(ENDPOINTS.NOTIFICATIONS.BASE, { signal });

export const markNotificationRead = (id) =>
  axiosInstance.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));

export const markAllNotificationsRead = () =>
  axiosInstance.patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);

export const deleteAllNotifications = () =>
  axiosInstance.delete(ENDPOINTS.NOTIFICATIONS.BASE);