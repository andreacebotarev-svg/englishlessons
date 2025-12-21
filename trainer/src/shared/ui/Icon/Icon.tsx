interface IconProps {
  emoji: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Emoji icon component
 */
export function Icon({ emoji, size = 'md', className = '' }: IconProps) {
  const sizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-8xl',
  };
  
  return (
    <span className={`${sizes[size]} ${className}`}>
      {emoji}
    </span>
  );
}
