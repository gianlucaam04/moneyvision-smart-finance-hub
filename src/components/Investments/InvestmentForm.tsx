import React from 'react';

interface InvestmentFormProps {
  onInvestmentAdded: () => void;
  hideTrigger?: boolean;
  onClose?: () => void;
}

const InvestmentForm: React.FC<InvestmentFormProps> = () => {
  // Funzionalità Investimenti disattivata: non renderizziamo nulla
  return null;
};

export default InvestmentForm;
