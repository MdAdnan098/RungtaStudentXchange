import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteAllNotifications,
} from "@/api/notifications";
import { cn } from "@/utils/cn";

/**
 * Self-contained bell + dropdown, used in both the desktop nav and
 * the mobile header (next to the hamburger) so notifications are
 * reachable regardless of screen size. Fetches once on mount; a
 * fuller "poll every N seconds" or socket-based live update is out
 * of scope for this pass.
 */
const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    setIsLoading(true);
    getMyNotifications()
      .then((response) => {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      })
      .catch(() => {
        // Silent — a failed background fetch shouldn't interrupt browsing.
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((open) => !open);
    if (!isOpen) fetchNotifications();
  };

  const handleNotificationClick = async (notification) => {
    setIsOpen(false);
    if (!notification.isRead) {
      markNotificationRead(notification._id).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    if (notification.product?._id) {
      navigate(`/products/${notification.product._id}`);
    }
  };

  const handleMarkAllRead = async (event) => {
    event.stopPropagation();
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Couldn't mark all as read");
    }
  };

  const handleClearAll = async (event) => {
    event.stopPropagation();
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch {
      toast.error("Couldn't clear notifications");
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text transition-colors duration-base ease-standard"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Notifications"
      >
        <Bell className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Notifications"
          className="popover-panel absolute right-0 mt-2 w-80 max-w-[85vw] origin-top-right"
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-body-sm font-medium text-text">Notifications</p>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-caption font-medium text-primary hover:text-primary-hover"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-caption font-medium text-text-muted hover:text-danger-text"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
          <div className="divider" />

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="px-3 py-6 text-center text-body-sm text-text-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-body-sm text-text-muted">
                No notifications yet — you'll see it here when someone views your listing.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors duration-base ease-standard hover:bg-surface-hover",
                    !notification.isRead && "bg-primary-subtle/40"
                  )}
                >
                  <span className="text-body-sm text-text">{notification.message}</span>
                  <span className="text-caption text-text-muted">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;