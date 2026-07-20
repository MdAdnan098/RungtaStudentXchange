import { useCallback, useEffect, useState } from "react";
import { getDashboardStats } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * GET /admin/stats returns exactly totalUsers, totalListings,
 * activeListings, pendingReports, verifiedStudents — a real
 * statistics endpoint, so nothing here is derived or estimated.
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStats = useCallback((signal) => {
    setIsLoading(true);
    setIsError(false);

    getDashboardStats({ signal })
      .then((response) => {
        setStats(response.data.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setIsError(true);
        setErrorMessage(getErrorMessage(error, "Failed to load dashboard statistics"));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchStats(controller.signal);
    return () => controller.abort();
  }, [fetchStats]);

  return { stats, isLoading, isError, errorMessage, refetch: () => fetchStats() };
};
