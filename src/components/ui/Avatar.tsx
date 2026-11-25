import React from 'react';

interface AvatarProps {
  name: string;
  size?: 'small' | 'medium' | 'large';
}

const colors = ['lavender', 'mint', 'peach', 'blue', 'rose', 'sand'];

function Avatar({ name, size = 'medium' }: AvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <span className={`avatar avatar--${size} avatar--${color}`} aria-label={name}>
      {initials}
    </span>
  );
}

export default Avatar;
