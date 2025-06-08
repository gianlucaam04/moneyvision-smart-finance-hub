import React from 'react';
import Layout from '@/components/Layout/Layout';
import FinancialSummary from '@/components/Dashboard/FinancialSummary';
import RecentTransactions from '@/components/Dashboard/RecentTransactions';
import SavingsGoalsCard from '@/components/Dashboard/SavingsGoalsCard';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Panoramica delle tue finanze
          </p>
        </div>

        {/* Financial Summary */}
        <FinancialSummary />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions />
          <SavingsGoalsCard />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
