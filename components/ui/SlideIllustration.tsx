// components/ui/SlideIllustration.tsx
// SVG illustrations สำหรับแต่ละสไลด์ใน Hero

export default function SlideIllustration({ id }: { id: number }) {
  return (
    <svg
      viewBox="0 0 1440 860"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      {id === 1 && (
        <>
          <rect x="420" y="120" width="600" height="560" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          <rect x="520" y="220" width="160" height="110" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5"/>
          <rect x="760" y="220" width="160" height="110" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.5"/>
          <rect x="610" y="420" width="220" height="260" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <circle cx="1150" cy="220" r="160" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          <line x1="300" y1="680" x2="1140" y2="680" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        </>
      )}
      {id === 2 && (
        <>
          <rect x="610" y="60"  width="220" height="660" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <rect x="660" y="120" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="730" y="120" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="660" y="240" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="730" y="240" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="660" y="360" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="730" y="360" width="55"  height="80"  fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <rect x="300" y="200" width="200" height="420" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
          <circle cx="1100" cy="430" r="220" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
        </>
      )}
      {id === 3 && (
        <>
          <polygon points="720,80 460,720 980,720" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          <polygon points="720,200 540,620 900,620" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"/>
          <rect x="658" y="540" width="124" height="180" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
          <line x1="300" y1="720" x2="1140" y2="720" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
          <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
        </>
      )}
      {id === 4 && (
        <>
          <rect x="180" y="180" width="300" height="520" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <rect x="540" y="280" width="200" height="420" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <rect x="800" y="140" width="440" height="560" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
          <line x1="140" y1="700" x2="1300" y2="700" stroke="rgba(255,255,255,0.07)" strokeWidth="1"/>
        </>
      )}
      {id === 5 && (
        <>
          <rect x="280" y="100" width="880" height="600" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" rx="2"/>
          <rect x="380" y="200" width="220" height="160" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" rx="2"/>
          <rect x="840" y="200" width="220" height="160" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" rx="2"/>
          <circle cx="720" cy="700" r="65" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
        </>
      )}
      <defs>
        <linearGradient id={`hg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.65)"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1440" height="860" fill={`url(#hg${id})`}/>
    </svg>
  );
}