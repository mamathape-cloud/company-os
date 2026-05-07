interface AppIconProps {
  size?: number;
}

export default function AppIcon({ size = 40 }: AppIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-label="CompanyOS Icon" role="img">
      <rect x="0" y="0" width="40" height="40" rx="8" fill="#4F46E5" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="white"
        fontWeight="700"
        fontSize="14"
        fontFamily="Inter, Arial, sans-serif"
      >
        CO
      </text>
    </svg>
  );
}
