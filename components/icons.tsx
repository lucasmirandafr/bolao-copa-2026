type IconProps = {
  className?: string;
  strokeWidth?: number;
};

export function BallIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l3 2.2-1.1 3.5H10.1L9 9.2 12 7z" />
      <path d="M12 3v4M5.5 8.5L9 9.2M18.5 8.5L15 9.2M8 20l2.1-4.3M16 20l-2.1-4.3M3 12h3M18 12h3" />
    </svg>
  );
}

export function LiveIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
      <path d="M7.5 7.5a6.5 6.5 0 000 9M16.5 7.5a6.5 6.5 0 010 9M4.5 4.5a10.5 10.5 0 000 15M19.5 4.5a10.5 10.5 0 010 15" />
    </svg>
  );
}

export function NotesIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <path d="M7 3h7l4 4v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 15.5h6M9 8.5h2" />
    </svg>
  );
}

export function TrophyIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <path d="M7 4h10v4a5 5 0 01-10 0V4z" />
      <path d="M7 5H4.5a1 1 0 00-1 1.2c.3 1.7 1.3 3.3 3.5 3.6M17 5h2.5a1 1 0 011 1.2c-.3 1.7-1.3 3.3-3.5 3.6" />
      <path d="M12 13v3M9 20h6M9.5 20c0-1.5.7-2.5 2.5-3 1.8.5 2.5 1.5 2.5 3" />
    </svg>
  );
}

export function UserIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3 3-5 7-5s7 2 7 5" />
    </svg>
  );
}

export function GearIcon({ className = "h-5 w-5", strokeWidth = 1.5 }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={strokeWidth} stroke="currentColor" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13.5a7.6 7.6 0 000-3l1.8-1.4-1.5-2.6-2.1.7a7.6 7.6 0 00-2.6-1.5L14.6 3h-3l-.4 2.2a7.6 7.6 0 00-2.6 1.5l-2.1-.7-1.5 2.6 1.8 1.4a7.6 7.6 0 000 3l-1.8 1.4 1.5 2.6 2.1-.7c.8.7 1.7 1.2 2.6 1.5l.4 2.2h3l.4-2.2a7.6 7.6 0 002.6-1.5l2.1.7 1.5-2.6-1.8-1.4z" />
    </svg>
  );
}
