import { useCallback, useEffect, useState } from "react";
import { getVisitorStats } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

/**
 * GET /admin/visitors/stats — mirrors useDashboardStats.js exactly,
 * just pointed at the Visitor Analytics stats endpoint.
 */
export const useVisitorStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchStats = useCallback((signal) => {
    setIsLoading(true);
    setIsError(false);

    getVisitorStats({ signal })
      .then((response) => {
        setStats(response.data.data);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setIsError(true);
        setErrorMessage(getErrorMessage(error, "Failed to load visitor stats"));
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
