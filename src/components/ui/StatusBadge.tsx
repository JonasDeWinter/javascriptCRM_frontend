import React from 'react';

interface StatusBadgeProps {
  status: 'Customer' | 'Lead' | 'Prospect';
}

function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{status}</span>;
}

export default StatusBadge;
