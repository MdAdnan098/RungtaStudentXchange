import PageContainer, { Section } from "@/components/layout/PageContainer";
import StudentVerificationCard from "@/components/verification/StudentVerificationCard";

// Real dashboard UI to be built out in a later module — for now this
// hosts the Student Verification card.
const Dashboard = () => {
  return (
    <Section spacing="md">
      <PageContainer size="md">
        <StudentVerificationCard />
      </PageContainer>
    </Section>
  );
};

export default Dashboard;
