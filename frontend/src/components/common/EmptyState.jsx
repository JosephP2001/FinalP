/**
 * Reusable Empty State Component
 * Used when no data is available
 */

import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon = '📋',
  title = 'No hay datos',
  description,
  actionLabel,
  actionLink,
  onAction
}) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-700 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-6">
          {description}
        </p>
      )}
      {(actionLabel && (actionLink || onAction)) && (
        actionLink ? (
          <Link to={actionLink}>
            <button className="btn-primary">
              {actionLabel}
            </button>
          </Link>
        ) : (
          <button onClick={onAction} className="btn-primary">
            {actionLabel}
          </button>
        )
      )}
    </div>
  );
};

export default EmptyState;