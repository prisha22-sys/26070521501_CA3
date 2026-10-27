import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No items found',
  description = 'You have not added any records matching this criteria yet.',
  actionText,
  actionLink,
  onAction,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-text">{description}</p>
      {actionText && (actionLink ? (
        <Link to={actionLink} className="btn btn-primary btn-sm">
          {actionText}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="btn btn-primary btn-sm">
          {actionText}
        </button>
      ) : null)}
    </div>
  );
}

