import { useParams, Navigate } from "react-router-dom";
import IndividualDashboard from "@/components/IndividualDashboard";

const IndividualDashboardPage = () => {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();

  if (!trackingNumber) {
    return <Navigate to="/" replace />;
  }

  return <IndividualDashboard trackingNumber={trackingNumber} />;
};

export default IndividualDashboardPage;
