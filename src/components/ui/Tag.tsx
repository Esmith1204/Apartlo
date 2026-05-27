interface TagProps {
  label: string;
  icon?: string;
  variant?: 'default' | 'match' | 'miss' | 'highlight';
}

export default function Tag({ label, icon, variant = 'default' }: TagProps) {
  return (
    <span className={`tag tag-${variant}`}>
      {icon && <span className="tag-icon" aria-hidden="true">{icon}</span>}
      {label}
    </span>
  );
}
