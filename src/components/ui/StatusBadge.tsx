import React from 'react';
import { CompanyStatus, ContactStatus } from '../../types/crm';

interface StatusBadgeProps {
  status: ContactStatus | CompanyStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{status}</span>;
}

export default StatusBadge;
