export function GlassBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Orb 1 - Blue top left */}
      <div
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)',
        }}
      />
      {/* Orb 2 - Purple bottom right */}
      <div
        className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)',
        }}
      />
      {/* Orb 3 - Green center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-100"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)',
        }}
      />
    </div>
  );
}
