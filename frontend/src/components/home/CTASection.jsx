import PageContainer, { Section } from "@/components/layout/PageContainer";
import StudentVerificationCard from "@/components/verification/StudentVerificationCard";

/**
 * The Student Verification card renders its own guest / unverified /
 * verified state internally, so this section is shown to everyone —
 * guests get a "Create Account & Verify" CTA instead of the OTP form
 * (POST /otp/* stays `protect`-guarded either way).
 */
const CTASection = () => {
  return (
    <Section aria-label="Student verification">
      <PageContainer size="md">
        <StudentVerificationCard />
      </PageContainer>
    </Section>
  );
};

export default CTASection;
