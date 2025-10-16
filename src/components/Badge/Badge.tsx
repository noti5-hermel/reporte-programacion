import React from 'react';

interface BadgeProps {
  status: 'active' | 'inactive' | 'offline';
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';

  const statusClasses = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-yellow-100 text-yellow-800',
    offline: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`${baseClasses} ${statusClasses[status]}`}>
      {status}
    </span>
  );
};

export default Badge;
