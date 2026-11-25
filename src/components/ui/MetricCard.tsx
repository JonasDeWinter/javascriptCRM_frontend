import React from 'react';
import Icon, { IconName } from './Icon';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  icon: IconName;
  tone?: 'violet' | 'green' | 'amber';
}

function MetricCard({ label, value, change, icon, tone = 'violet' }: MetricCardProps) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-icon--${tone}`}>
        <Icon name={icon} size={19} />
      </div>
      <div className="metric-card__details">
        <span className="metric-card__label">{label}</span>
        <strong className="metric-card__value">{value}</strong>
        <span className="metric-card__change">
          <span>{change}</span> vs. last month
        </span>
      </div>
      <span className="metric-card__trend"><Icon name="arrow" size={15} /></span>
    </article>
  );
}

export default MetricCard;
