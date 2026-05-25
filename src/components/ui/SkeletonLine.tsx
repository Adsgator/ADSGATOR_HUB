interface SkeletonLineProps {
  width?: string
  height?: string
  count?: number
  gap?: string
}

export function SkeletonLine({
  width = '100%',
  height = '1rem',
  count = 1,
  gap = '0.5rem',
}: SkeletonLineProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{ width, height }}
          className="rounded skeleton-shimmer"
        />
      ))}
    </div>
  )
}
