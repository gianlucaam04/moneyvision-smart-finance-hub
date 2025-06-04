
import React from 'react';
import TestChecklist from '@/components/QA/TestChecklist';

const Testing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-finance-blue/20 via-white to-finance-green/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto py-8">
        <TestChecklist />
      </div>
    </div>
  );
};

export default Testing;
