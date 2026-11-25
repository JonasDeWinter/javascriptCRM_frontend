import React from 'react';
import { CompanyStatus } from '../../types/company';
import { ContactStatus } from '../../types/contact';

interface StatusBadgeProps {
  status: ContactStatus | CompanyStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{status}</span>;
}

export default StatusBadge;
