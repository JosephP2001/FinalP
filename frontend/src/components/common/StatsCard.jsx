/**
 * Reusable Statistics Card Component
 * Used across Dashboard, AdminDashboard, AdminUsers
 */

const StatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  color = 'blue',
  trend 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      gradient: 'from-blue-500 to-blue-600'
    },
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      gradient: 'from-green-500 to-green-600'
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      gradient: 'from-purple-500 to-purple-600'
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      gradient: 'from-orange-500 to-orange-600'
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-600',
      gradient: 'from-red-500 to-red-600'
    },
    primary: {
      bg: 'bg-primary-100',
      text: 'text-primary-600',
      gradient: 'from-primary-500 to-primary-600'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${colors.bg}`}>
          <Icon className={colors.text} size={28} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;