// Radar component — animated SVG matrix with pulsing nodes and connections
const { useEffect, useRef, useState, useMemo } = React;

function Radar({ scrollProgress = 0 }) { // scrollProgress kept for API compat but no longer affects visuals
  const svgRef = useRef(null);
  const [t, setT] = useState(0);

  // Stable node positions — a mix of structured ring + scattered
  const nodes = useMemo(() => {
    const arr = [];
    // Concentric rings
    const rings = [
      { r: 140, count: 6, phase: 0 },
      { r: 220, count: 10, phase: 0.15 },
      { r: 310, count: 14, phase: 0.35 },
      { r: 390, count: 18, phase: 0.55 }
    ];
    let id = 0;
    rings.forEach(ring => {
      for (let i = 0; i < ring.count; i++) {
        const angle = (i / ring.count) * Math.PI * 2 + ring.phase;
        // Slight jitter
        const rr = ring.r + (Math.sin(i * 2.1) * 10);
        arr.push({
          id: id++,
          x: Math.cos(angle) * rr,
          y: Math.sin(angle) * rr,
          r: 1.2 + (id % 4 === 0 ? 1.8 : 0),
          seed: (i * 7 + ring.r) * 0.01,
          highlight: id % 11 === 0
        });
      }
    });
    return arr;
  }, []);

  // Pick a few random-ish connections (stable)
  const connections = useMemo(() => {
    const c = [];
    for (let i = 0; i < 14; i++) {
      const a = nodes[(i * 5) % nodes.length];
      const b = nodes[(i * 5 + 7 + (i % 3)) % nodes.length];
      if (a && b && a !== b) {
        c.push({ a, b, seed: i * 0.17 });
      }
    }
    return c;
  }, [nodes]);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const loop = (now) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const sweepSpeed = 35;
  const sweepAngle = (t * sweepSpeed) % 360;
  const sweepRad = (sweepAngle * Math.PI) / 180;

  const activeRings = 4;

  // Compute which nodes are "lit" by sweep — and unlock rings sequentially based on scroll
  // Ring 0 (r=140) starts active. Rings 1, 2, 3 unlock as scroll progresses.
  const ringSizes = [140, 220, 310, 390];
  const isInActiveRing = (node) => {
    const r = Math.hypot(node.x, node.y);
    // find closest ring
    let closestIdx = 0, minDist = Infinity;
    ringSizes.forEach((rs, i) => {
      const d = Math.abs(r - rs);
      if (d < minDist) { minDist = d; closestIdx = i; }
    });
    return closestIdx < activeRings;
  };
  const isLit = (node) => {
    if (!isInActiveRing(node)) return false;
    const nodeAngle = Math.atan2(node.y, node.x);
    const na = (nodeAngle + Math.PI * 2) % (Math.PI * 2);
    const sa = (sweepRad + Math.PI * 2) % (Math.PI * 2);
    let diff = sa - na;
    if (diff < 0) diff += Math.PI * 2;
    return diff < 0.6;
  };

  return (
    <svg
      ref={svgRef}
      viewBox="-500 -500 1000 1000"
      className="hero-radar"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.12" />
          <stop offset="60%" stopColor="var(--accent)" stopOpacity="0.04" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="85%" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow */}
      <circle cx="0" cy="0" r="460" fill="url(#radarGlow)" />

      {/* Concentric rings — opacity scales with active rings */}
      {[80, 160, 240, 320, 400, 460].map((r, i) => {
        // map ring radius to ringSizes index roughly
        let ringIdx = 0;
        if (r >= 380) ringIdx = 3;
        else if (r >= 280) ringIdx = 2;
        else if (r >= 180) ringIdx = 1;
        const isActive = ringIdx < activeRings;
        return (
          <circle
            key={r}
            cx="0" cy="0" r={r}
            fill="none"
            stroke="var(--accent-line)"
            strokeWidth="0.7"
            strokeDasharray={i % 2 === 0 ? "0" : "2 4"}
            opacity={(isActive ? 1 : 0.2) * (0.35 - i * 0.04)}
            style={{ transition: "opacity 0.6s" }}
          />
        );
      })}

      {/* Crosshair */}
      <line x1="-460" y1="0" x2="460" y2="0" stroke="var(--accent-line)" strokeWidth="0.5" opacity="0.3" />
      <line x1="0" y1="-460" x2="0" y2="460" stroke="var(--accent-line)" strokeWidth="0.5" opacity="0.3" />

      {/* Diagonal guides */}
      {[45, 135].map(a => {
        const rad = (a * Math.PI) / 180;
        const x = Math.cos(rad) * 460;
        const y = Math.sin(rad) * 460;
        return <line key={a} x1={-x} y1={-y} x2={x} y2={y} stroke="var(--accent-line)" strokeWidth="0.3" opacity="0.2" />;
      })}

      {/* Sweep — rotating gradient beam */}
      <g transform={`rotate(${sweepAngle})`}>
        <path
          d={`M 0 0 L 460 -50 A 460 460 0 0 1 460 50 Z`}
          fill="url(#sweepGrad)"
          opacity="0.35"
        />
        <line x1="0" y1="0" x2="460" y2="0" stroke="var(--accent)" strokeWidth="1" opacity="0.8" />
      </g>

      {/* Connections */}
      {connections.map((c, i) => {
        const pulse = (Math.sin(t * 1.5 + c.seed * 10) + 1) / 2;
        return (
          <line
            key={i}
            x1={c.a.x} y1={c.a.y}
            x2={c.b.x} y2={c.b.y}
            stroke="var(--accent)"
            strokeWidth="0.4"
            opacity={0.1 + pulse * 0.25}
          />
        );
      })}

      {/* Nodes */}
      {nodes.map(node => {
        const lit = isLit(node);
        const inRing = isInActiveRing(node);
        const pulse = (Math.sin(t * 2 + node.seed * 8) + 1) / 2;
        const baseOpacity = inRing ? 0.35 + pulse * 0.25 : 0.08;
        const size = lit ? node.r * 2.2 : node.r;
        return (
          <g key={node.id}>
            {lit && (
              <circle
                cx={node.x} cy={node.y}
                r={node.r * 5}
                fill="var(--accent)"
                opacity={0.15}
                filter="url(#glow)"
              />
            )}
            <circle
              cx={node.x} cy={node.y}
              r={size}
              fill={node.highlight ? "var(--accent)" : "var(--fg)"}
              opacity={lit ? 1 : baseOpacity}
              style={{ transition: "r 0.3s, opacity 0.3s" }}
            />
            {node.highlight && (
              <circle
                cx={node.x} cy={node.y}
                r={node.r + 4 + pulse * 3}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="0.6"
                opacity={0.5 - pulse * 0.3}
              />
            )}
          </g>
        );
      })}

      {/* Center mark */}
      <circle cx="0" cy="0" r="3" fill="var(--accent)" />
      <circle cx="0" cy="0" r="10" fill="none" stroke="var(--accent)" strokeWidth="0.6" opacity="0.6" />

      {/* Coordinate labels */}
      <text x="465" y="4" fill="var(--fg-mute)" fontSize="9" fontFamily="var(--mono)" letterSpacing="0.1em">0°</text>
      <text x="-5" y="-465" fill="var(--fg-mute)" fontSize="9" fontFamily="var(--mono)" letterSpacing="0.1em" textAnchor="end">90°</text>
      <text x="-470" y="4" fill="var(--fg-mute)" fontSize="9" fontFamily="var(--mono)" letterSpacing="0.1em">180°</text>
      <text x="5" y="475" fill="var(--fg-mute)" fontSize="9" fontFamily="var(--mono)" letterSpacing="0.1em">270°</text>
    </svg>
  );
}

window.Radar = Radar;
