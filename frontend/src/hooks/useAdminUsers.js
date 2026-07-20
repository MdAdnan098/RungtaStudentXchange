import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllUsers } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";

const PAGE_LIMIT = 20;

/**
 * Filters live in the URL (same rationale as Browse's
 * useProductFilters — shareable, survives refresh) but this is a
 * separate, smaller hook rather than reusing that one: the filter
 * shape here (role/isBanned/isStudentVerified) has nothing in common
 * with product filters, so sharing the hook would mean forcing an
 * unrelated shape through it.
 */
export const useAdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filters = {
    search: searchParams.get("search") || "",
    role: searchParams.get("role") || "",
    isBanned: searchParams.get("isBanned") || "",
    isStudentVerified: searchParams.get("isStudentVerified") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const filterKey = JSON.stringify(filters);

  const fetchUsers = useCallback(
    (signal) => {
      setIsLoading(true);
      setIsError(false);

      getAllUsers(
        {
          search: filters.search || undefined,
          role: filters.role || undefined,
          isBanned: filters.isBanned || undefined,
          isStudentVerified: filters.isStudentVerified || undefined,
          page: filters.page,
          limit: PAGE_LIMIT,
        },
        { signal }
      )
        .then((response) => {
          setUsers(response.data.data.users);
          setTotal(response.data.data.total);
          setIsLoading(false);
        })
        .catch((error) => {
          if (error.code === "ERR_CANCELED") return;
          setIsError(true);
          setErrorMessage(getErrorMessage(error, "Failed to load users"));
          setIsLoading(false);
        });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filterKey]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchUsers(controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const updateUserLocally = useCallback((userId, patch) => {
    setUsers((current) => current.map((user) => (user._id === userId ? { ...user, ...patch } : user)));
  }, []);

  const removeUserLocally = useCallback((userId) => {
    setUsers((current) => current.filter((user) => user._id !== userId));
    setTotal((current) => Math.max(0, current - 1));
  }, []);

  return {
    users,
    total,
    limit: PAGE_LIMIT,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch: () => fetchUsers(),
    updateUserLocally,
    removeUserLocally,
  };
};
