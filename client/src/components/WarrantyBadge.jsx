import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from 'lucide-react';

export default function WarrantyBadge({ item }) {
  if (!item || !item.hasWarranty || !item.warrantyExpiryDate) {
    return (
      <span className="badge badge-neutral">
        <ShieldOff size={13} />
        <span>No Warranty</span>
      </span>
    );
  }

  const now = new Date();
  const expiry = new Date(item.warrantyExpiryDate);
  const diffTime = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDaysAgo = Math.abs(diffDays);
    return (
      <span className="badge badge-expired" title={`Expired on ${expiry.toLocaleDateString()}`}>
        <ShieldX size={13} />
        <span>Expired ({expiredDaysAgo > 30 ? `${Math.floor(expiredDaysAgo / 30)}mo ago` : `${expiredDaysAgo}d ago`})</span>
      </span>
    );
  }

  if (diffDays <= 30) {
    return (
      <span className="badge badge-expiring" title={`Expires on ${expiry.toLocaleDateString()}`}>
        <ShieldAlert size={13} />
        <span>Expiring Soon ({diffDays}d left)</span>
      </span>
    );
  }

  const monthsRemaining = Math.round(diffDays / 30);
  return (
    <span className="badge badge-active" title={`Valid until ${expiry.toLocaleDateString()}`}>
      <ShieldCheck size={13} />
      <span>Active ({monthsRemaining > 1 ? `${monthsRemaining} mos left` : `${diffDays}d left`})</span>
    </span>
  );
}

