import { useCallback, useEffect, useState } from "react";
import { getVisitorMap } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

// GET /admin/visitors/map — one aggregated bubble per city/state, see
// visitorController.js getVisitorMap.
export const useVisitorMap = () => {
  const [bubbles, setBubbles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchMap = useCallback((signal) => {
    setIsLoading(true);
    setIsError(false);

    getVisitorMap({ signal })
      .then((response) => {
        setBubbles(response.data.data.bubbles);
        setIsLoading(false);
      })
      .catch((error) => {
        if (error.code === "ERR_CANCELED") return;
        setIsError(true);
        setErrorMessage(getErrorMessage(error, "Failed to load visitor map"));
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchMap(controller.signal);
    return () => controller.abort();
  }, [fetchMap]);

  return { bubbles, isLoading, isError, errorMessage, refetch: () => fetchMap() };
};
