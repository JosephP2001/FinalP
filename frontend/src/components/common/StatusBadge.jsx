/**
 * Status Badge Component
 * Displays survey status with appropriate styling
 */

import { getStatusBadge } from '../../utils/surveyUtils';

const StatusBadge = ({ status }) => {
  const badge = getStatusBadge(status);
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
};

export default StatusBadge;