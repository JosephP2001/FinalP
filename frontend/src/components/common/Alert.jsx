/**
 * Reusable Alert Component
 * Used for displaying messages across pages
 */

import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const Alert = ({ 
  type = 'info', 
  message, 
  onClose,
  className = ''
}) => {
  const types = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle
    }
  };

  const config = types[type] || types.info;
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.bg} ${config.border} ${config.text} ${className}`}>
      <Icon size={20} className="flex-shrink-0" />
      <span className="flex-1 text-sm">{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default Alert;