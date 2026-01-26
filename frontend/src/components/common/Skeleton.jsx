//Base Skeleton component 
export const Skeleton = ({ className = '', width, height }) => {
  const style = {
    width: width || '100%',
    height: height || '1rem'
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={style}
    />
  );
};

//Card Skeleton - For survey cards

export const CardSkeleton = () => {
  return (
    <div className="card space-y-4">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-9 w-12" />
      </div>
    </div>
  );
};

//Table Row Skeleton - For admin tables

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

//Stats Card Skeleton - For dashboard statistics

export const StatsCardSkeleton = () => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
};

//Chart Skeleton - For survey results charts

export const ChartSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        {[100, 80, 60, 90, 70].map((width, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8" style={{ width: `${width}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
};

// User List Skeleton - For admin user management

export const UserListSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  );
};

//Question Results Skeleton - For survey results page
 
export const QuestionResultsSkeleton = () => {
  return (
    <div className="card space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-32" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <div className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

//Form Skeleton - For survey builder

export const FormSkeleton = () => {
  return (
    <div className="card space-y-4">
      <Skeleton className="h-6 w-48" />
      
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      
      <div className="flex gap-3 pt-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
};

//Recent Survey Item Skeleton - For dashboard recent surveys
 
export const RecentSurveySkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
  );
};

//Question Builder Skeleton - For survey builder questions
 
export const QuestionBuilderSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="flex justify-between items-start">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton;