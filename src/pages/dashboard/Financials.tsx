import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FinancialReport } from '@/components/dashboard/FinancialReport';

const FinancialsPage = () => {
  return (
    <DashboardLayout>
      <FinancialReport />
    </DashboardLayout>
  );
};

export default FinancialsPage;
