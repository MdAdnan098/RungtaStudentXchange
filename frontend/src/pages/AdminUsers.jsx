import { useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, BadgeCheck, Pencil, ShieldOff, Users as UsersIcon } from "lucide-react";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import AdminNav from "@/components/admin/AdminNav";
import AdminSearchInput from "@/components/admin/AdminSearchInput";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import DeleteAllDialog from "@/components/admin/DeleteAllDialog";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import RevokeVerificationDialog from "@/components/admin/RevokeVerificationDialog";
import UserDetailModal from "@/components/admin/UserDetailModal";
import EditUserModal from "@/components/admin/EditUserModal";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/browse/Pagination";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useAuthStore } from "@/store/authStore";
import { deleteUser, deleteAllUsers, unbanUser, revokeStudentVerification } from "@/api/admin";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { USER_ROLES } from "@/constants";

/**
 * Reuses Pagination (Browse, Task 7) exactly as-is — no changes
 * needed, it was already fully generic.
 *
 * The Delete button is hidden entirely for role === "admin"
 * (deleteUser returns 403 for admin targets server-side) and
 * disabled for the currently logged-in admin themselves — a
 * client-side safety net, not a backend rule, to stop an obviously
 * bad self-delete click. Deletion is permanent and removes the user
 * from the database.
 */
const AdminUsers = () => {
  const {
    users,
    total,
    limit,
    filters,
    setFilter,
    isLoading,
    isError,
    errorMessage,
    refetch,
    updateUserLocally,
    removeUserLocally,
  } = useAdminUsers();
  const currentUserId = useAuthStore((state) => state.user?._id);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [pendingActionId, setPendingActionId] = useState(null);
  const [detailUserId, setDetailUserId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteUser(deleteTarget._id);
      removeUserLocally(deleteTarget._id);
      toast.success(response.data.message || "User deleted");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete this user"));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUnban = async (user) => {
    setPendingActionId(user._id);
    try {
      const response = await unbanUser(user._id);
      updateUserLocally(user._id, { isBanned: response.data.data.user.isBanned });
      toast.success(response.data.message || "User unbanned");
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't unban this user"));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleRevoke = async () => {
    setIsRevoking(true);
    try {
      const response = await revokeStudentVerification(revokeTarget._id);
      updateUserLocally(revokeTarget._id, { isStudentVerified: response.data.data.user.isStudentVerified });
      toast.success(response.data.message || "Verification revoked");
      setRevokeTarget(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't revoke verification"));
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsDeletingAll(true);
    try {
      const response = await deleteAllUsers();
      toast.success(response.data.message || "All users deleted");
      setIsDeleteAllOpen(false);
      refetch();
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't delete all users"));
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <Section spacing="md">
      <PageContainer>
        <h1 className="text-h2 mb-4">Admin Dashboard</h1>
        <AdminNav />

        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setIsDeleteAllOpen(true)}
            disabled={isDeletingAll}
            className="btn-danger-ghost btn-sm inline-flex items-center gap-2"
          >
            {isDeletingAll && <LoadingSpinner size="xs" />}
            Delete All Users
          </button>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <AdminSearchInput
              id="admin-user-search"
              label="Search users"
              placeholder="Search by name or email…"
              value={filters.search}
              onChange={(value) => setFilter("search", value)}
            />
          </div>
          <select
            className="select w-full sm:w-40"
            value={filters.role}
            onChange={(event) => setFilter("role", event.target.value)}
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="select w-full sm:w-40"
            value={filters.isBanned}
            onChange={(event) => setFilter("isBanned", event.target.value)}
            aria-label="Filter by ban status"
          >
            <option value="">All statuses</option>
            <option value="true">Banned</option>
            <option value="false">Not banned</option>
          </select>
          <select
            className="select w-full sm:w-44"
            value={filters.isStudentVerified}
            onChange={(event) => setFilter("isStudentVerified", event.target.value)}
            aria-label="Filter by verification"
          >
            <option value="">Any verification</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
        </div>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-background-subtle" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't load users"
            description={errorMessage}
            action={
              <button type="button" onClick={refetch} className="btn-primary btn-sm">
                Retry
              </button>
            }
          />
        ) : users.length === 0 ? (
          <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-body-sm">
              <caption className="sr-only">All registered users</caption>
              <thead className="bg-background-subtle text-caption uppercase text-text-muted">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Verified
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Joined
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDetailUserId(user._id)}
                        className="text-left hover:text-primary transition-colors duration-base ease-standard"
                      >
                        <span className="block font-medium text-text">{user.name}</span>
                        <span className="block text-caption text-text-muted">{user.email}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{user.role}</td>
                    <td className="px-4 py-3">
                      {user.isStudentVerified ? (
                        <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verified" />
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={user.isBanned ? "badge-danger" : "badge-success"}>
                        {user.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditTarget(user)}
                          className="btn-ghost btn-sm"
                          title="Edit user"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        {user.isStudentVerified && (
                          <button
                            type="button"
                            onClick={() => setRevokeTarget(user)}
                            className="btn-ghost btn-sm"
                            title="Revoke student verification"
                          >
                            <ShieldOff className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        )}
                        {user.role !== "admin" &&
                          (user.isBanned ? (
                            <button
                              type="button"
                              onClick={() => handleUnban(user)}
                              disabled={pendingActionId === user._id}
                              className="btn-secondary btn-sm"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              disabled={user._id === currentUserId}
                              className="btn-danger-ghost btn-sm"
                            >
                              Delete
                            </button>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !isError && (
          <Pagination
            page={filters.page}
            limit={limit}
            total={total}
            onPageChange={(page) => setFilter("page", page)}
          />
        )}
      </PageContainer>

      <DeleteUserDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        userName={deleteTarget?.name || ""}
        isSubmitting={isDeleting}
      />
      <DeleteAllDialog
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        onConfirm={handleDeleteAll}
        title="Delete all users?"
        description="Are you sure you want to delete ALL users? This action cannot be undone. Your own admin account will not be affected."
        confirmLabel="Delete All Users"
        isSubmitting={isDeletingAll}
      />
      <RevokeVerificationDialog
        isOpen={Boolean(revokeTarget)}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoke}
        userName={revokeTarget?.name || ""}
        isSubmitting={isRevoking}
      />
      <UserDetailModal
        userId={detailUserId}
        isOpen={Boolean(detailUserId)}
        onClose={() => setDetailUserId(null)}
        onEdit={(user) => {
          setDetailUserId(null);
          setEditTarget(user);
        }}
      />
      <EditUserModal
        user={editTarget}
        isOpen={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSuccess={(updatedUser) =>
          updateUserLocally(updatedUser._id, {
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            location: updatedUser.location,
            bio: updatedUser.bio,
          })
        }
      />
    </Section>
  );
};

export default AdminUsers;
