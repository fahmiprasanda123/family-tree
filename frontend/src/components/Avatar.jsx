import React from 'react';

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ src, name, gender = 'male', size = 'md', className = '' }) {
  const initials = getInitials(name);
  const sizeClasses = {
    sm: 'avatar-sm',
    md: 'avatar-md',
    lg: 'avatar-lg',
    xl: 'avatar-xl',
  };

  if (src) {
    return (
      <div className={`avatar-container ${sizeClasses[size] || 'avatar-md'} ${className}`}>
        <img src={src} alt={name || 'Foto anggota'} className="avatar-img" />
      </div>
    );
  }

  return (
    <div
      className={`avatar-container avatar-placeholder ${sizeClasses[size] || 'avatar-md'} gender-${gender} ${className}`}
      aria-label={name || 'Avatar'}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
}
