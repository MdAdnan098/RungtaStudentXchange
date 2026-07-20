import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import PageContainer, { Section } from "@/components/layout/PageContainer";
import TextField from "@/components/auth/TextField";
import FormError from "@/components/auth/FormError";
import AvatarUploadField from "@/components/profile/AvatarUploadField";
import ChangePasswordSection from "@/components/profile/ChangePasswordSection";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { updateProfile } from "@/api/users";
import { useAuthStore } from "@/store/authStore";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { nameRule, bioRule } from "@/utils/validationRules";
import { usePageTitle } from "@/hooks/usePageTitle";

/**
 * Only renders name/bio/location/phone — the exact set updateProfile
 * (userController.js) reads from its body. Email isn't here at all:
 * it's not accepted by this endpoint, so there's no form control that
 * would silently do nothing.
 */
const ProfileEdit = () => {
  usePageTitle("Edit Profile Info/Password");

  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      phone: user?.phone || "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitError(null);
    try {
      const response = await updateProfile(values);
      setUser(response.data.data.user);
      toast.success(response.data.message || "Profile updated");
      navigate("/profile", { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Failed to update profile"));
    }
  };

  return (
    <Section spacing="md">
      <PageContainer size="sm">
        <div>
          <h1 className="text-h2">Edit Profile Info/Password</h1>
          <p className="mt-1.5 text-body-sm text-text-muted">
            Update how other students see you across RungtaStudentXchange, or change your password.
          </p>
        </div>

        <div className="card-padded mt-6">
          <h2 className="field-label mb-3.5">Profile photo</h2>
          <AvatarUploadField />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-padded mt-5">
          <FormError message={submitError} />

          <div className="space-y-5">
            <TextField
              id="profile-name"
              label="Full name"
              registration={register("name", nameRule)}
              error={errors.name?.message}
            />

            <div>
              <label htmlFor="profile-bio" className="field-label">
                Bio
              </label>
              <textarea
                id="profile-bio"
                rows={3}
                maxLength={200}
                placeholder="Tell other students a little about yourself"
                className={`textarea ${errors.bio ? "input-error" : ""}`}
                {...register("bio", bioRule)}
              />
              {errors.bio && <p className="field-error">{errors.bio.message}</p>}
            </div>

            <TextField
              id="profile-location"
              label="Location"
              placeholder="e.g. Boys Hostel Block C"
              registration={register("location")}
            />

            <TextField
              id="profile-phone"
              label="Phone"
              type="tel"
              placeholder="Optional"
              registration={register("phone")}
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="btn-ghost justify-center !rounded-xl btn-tactile"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 justify-center !rounded-xl shadow-sm btn-tactile hover:shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoadingSpinner size="sm" />}
              {isSubmitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>

        <ChangePasswordSection />
      </PageContainer>
    </Section>
  );
};

export default ProfileEdit;
