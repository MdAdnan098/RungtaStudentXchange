import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/utils/formatRelativeTime";

// One shared timer for every <RelativeTime /> on the page (instead of
// one interval per card), ticking every 30s so "just now" -> "1 min ago"
// updates live without a refresh.
const listeners = new Set();
let timerId = null;

const subscribe = (fn) => {
  listeners.add(fn);
  if (!timerId) {
    timerId = setInterval(() => {
      const now = Date.now();
      listeners.forEach((l) => l(now));
    }, 30000);
  }
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  };
};

const RelativeTime = ({ date, className }) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setNow(Date.now());
    return subscribe(setNow);
  }, [date]);

  return (
    <time dateTime={date} title={date ? new Date(date).toLocaleString() : undefined} className={className}>
      {formatRelativeTime(date, now)}
    </time>
  );
};

export default RelativeTime;