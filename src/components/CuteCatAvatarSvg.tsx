import React from 'react';

interface CuteCatAvatarSvgProps {
  skin?: 'orange-tabby' | 'white-kitty' | 'calico-neko' | 'lucky-black' | 'custom';
  isTalking?: boolean;
  isJumping?: boolean;
  size?: number; // size in px
  className?: string;
  customUrl?: string;
}

export const CuteCatAvatarSvg: React.FC<CuteCatAvatarSvgProps> = ({
  skin = 'orange-tabby',
  isTalking = false,
  isJumping = false,
  size = 80,
  className = '',
  customUrl
}) => {
  if (skin === 'custom' && customUrl) {
    return (
      <img
        src={customUrl}
        alt="Cute Cat"
        style={{ width: size, height: size }}
        className={`object-contain select-none drop-shadow-md ${className}`}
        onError={(e) => {
          // fallback to vector
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Color schemes based on skin
  const skinColors: Record<string, {
    body: string;
    bodyLight: string;
    bodyDark: string;
    earsInner: string;
    belly: string;
    stripes: string;
    eyes: string;
    blush: string;
    collar: string;
    bell: string;
  }> = {
    'orange-tabby': {
      body: '#FF9800',
      bodyLight: '#FFB74D',
      bodyDark: '#F57C00',
      earsInner: '#FF8A80',
      belly: '#FFF8E1',
      stripes: '#E65100',
      eyes: '#2E7D32',
      blush: '#FF80AB',
      collar: '#7C4DFF',
      bell: '#FFD700'
    },
    'white-kitty': {
      body: '#FFFFFF',
      bodyLight: '#F5F5F7',
      bodyDark: '#E0E0E0',
      earsInner: '#FF80AB',
      belly: '#FFFFFF',
      stripes: '#E0E0E0',
      eyes: '#0288D1',
      blush: '#FF4081',
      collar: '#E91E63',
      bell: '#FFD700'
    },
    'calico-neko': {
      body: '#FFF9C4',
      bodyLight: '#FFFDE7',
      bodyDark: '#FFE082',
      earsInner: '#FF80AB',
      belly: '#FFFFFF',
      stripes: '#D84315',
      eyes: '#388E3C',
      blush: '#FF80AB',
      collar: '#D32F2F',
      bell: '#FFD700'
    },
    'lucky-black': {
      body: '#263238',
      bodyLight: '#37474F',
      bodyDark: '#1A237E',
      earsInner: '#FF80AB',
      belly: '#ECEFF1',
      stripes: '#212121',
      eyes: '#FFD600',
      blush: '#FF80AB',
      collar: '#D50000',
      bell: '#FFD700'
    }
  };

  const colors = skinColors[skin] || skinColors['orange-tabby'];

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible drop-shadow-md"
      >
        {/* Animated Tail */}
        <g className="cat-tail-anim origin-bottom-left" style={{ transformOrigin: '32px 88px' }}>
          <path
            d="M32 88 C18 80 10 65 14 52 C17 42 28 44 26 54 C24 64 34 76 40 82 Z"
            fill={colors.bodyDark}
          />
          <path
            d="M14 52 C16 45 23 46 25 54 C23 60 17 58 14 52 Z"
            fill={colors.belly}
          />
        </g>

        {/* Back Feet / Paws */}
        <ellipse cx="40" cy="94" rx="10" ry="7" fill={colors.bodyDark} />
        <ellipse cx="80" cy="94" rx="10" ry="7" fill={colors.bodyDark} />

        {/* Main Body (Chubby Round Cat) */}
        <ellipse cx="60" cy="74" rx="34" ry="28" fill={colors.body} />
        {/* Body 3D Light Highlight */}
        <ellipse cx="58" cy="68" rx="28" ry="20" fill={colors.bodyLight} opacity="0.4" />

        {/* Belly Patch (Soft cream) */}
        <ellipse cx="60" cy="76" rx="20" ry="17" fill={colors.belly} />

        {/* Left Ear */}
        <g className="cat-ear-left origin-bottom-left" style={{ transformOrigin: '42px 38px' }}>
          <path
            d="M32 44 L44 14 C46 10 50 12 52 18 L56 42 Z"
            fill={colors.body}
            stroke={colors.bodyDark}
            strokeWidth="1.5"
          />
          {/* Inner Pink Ear */}
          <path
            d="M38 40 L46 20 L52 38 Z"
            fill={colors.earsInner}
            opacity="0.85"
          />
        </g>

        {/* Right Ear */}
        <g className="cat-ear-right origin-bottom-right" style={{ transformOrigin: '78px 38px' }}>
          <path
            d="M88 44 L76 14 C74 10 70 12 68 18 L64 42 Z"
            fill={colors.body}
            stroke={colors.bodyDark}
            strokeWidth="1.5"
          />
          {/* Inner Pink Ear */}
          <path
            d="M82 40 L74 20 L68 38 Z"
            fill={colors.earsInner}
            opacity="0.85"
          />
        </g>

        {/* Head */}
        <circle cx="60" cy="46" r="26" fill={colors.body} />
        <ellipse cx="60" cy="42" rx="22" ry="17" fill={colors.bodyLight} opacity="0.4" />

        {/* Forehead Stripes (Tabby marks) */}
        {skin !== 'white-kitty' && (
          <g fill={colors.stripes} opacity="0.7">
            <path d="M60 26 L58 34 L62 34 Z" />
            <path d="M52 29 L53 36 L55 35 Z" />
            <path d="M68 29 L67 36 L65 35 Z" />
          </g>
        )}

        {/* Big Kawaii Eyes */}
        <g className="cat-eyes-group">
          {/* Left Eye */}
          <g>
            <circle cx="48" cy="45" r="5.5" fill="#212121" />
            {/* Eye iris tint */}
            <circle cx="48" cy="45" r="4.5" fill={colors.eyes} opacity="0.6" />
            {/* Sparkle Glint 1 */}
            <circle cx="46.5" cy="43" r="2" fill="#FFFFFF" />
            {/* Sparkle Glint 2 */}
            <circle cx="49.5" cy="47" r="1" fill="#FFFFFF" />
          </g>

          {/* Right Eye */}
          <g>
            <circle cx="72" cy="45" r="5.5" fill="#212121" />
            {/* Eye iris tint */}
            <circle cx="72" cy="45" r="4.5" fill={colors.eyes} opacity="0.6" />
            {/* Sparkle Glint 1 */}
            <circle cx="70.5" cy="43" r="2" fill="#FFFFFF" />
            {/* Sparkle Glint 2 */}
            <circle cx="73.5" cy="47" r="1" fill="#FFFFFF" />
          </g>
        </g>

        {/* Rosy Cheeks (Blush) */}
        <ellipse cx="41" cy="51" rx="4" ry="2.5" fill={colors.blush} opacity="0.65" />
        <ellipse cx="79" cy="51" rx="4" ry="2.5" fill={colors.blush} opacity="0.65" />

        {/* Cute Pink Nose */}
        <polygon points="58,49 62,49 60,52" fill="#FF4081" />

        {/* Cute Cat Mouth (:3 / Happy Talking) */}
        {isTalking ? (
          /* Open Talking Mouth */
          <g className="cat-open-mouth">
            <path
              d="M56 52 Q60 51 64 52 Q64 59 60 60 Q56 59 56 52 Z"
              fill="#D81B60"
            />
            {/* Little Tongue */}
            <path
              d="M58 57 Q60 55 62 57 Q60 60 58 57 Z"
              fill="#FF80AB"
            />
          </g>
        ) : (
          /* Closed Cute :3 Mouth */
          <path
            d="M55 52 Q57 55 60 52 Q63 55 65 52"
            stroke="#424242"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Whiskers */}
        <g stroke="#616161" strokeWidth="1.2" strokeLinecap="round" opacity="0.75">
          {/* Left Whiskers */}
          <line x1="38" y1="48" x2="24" y2="46" />
          <line x1="38" y1="52" x2="23" y2="53" />
          {/* Right Whiskers */}
          <line x1="82" y1="48" x2="96" y2="46" />
          <line x1="82" y1="52" x2="97" y2="53" />
        </g>

        {/* Collar & Gold Jingle Bell */}
        <path
          d="M45 66 Q60 72 75 66"
          stroke={colors.collar}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Gold Bell */}
        <circle cx="60" cy="70" r="3.5" fill={colors.bell} stroke="#FFB300" strokeWidth="0.8" />
        <circle cx="60" cy="70" r="1" fill="#795548" />

        {/* Front Cute White Paws (Resting / Animated Paws) */}
        <g>
          <ellipse cx="50" cy="85" rx="6" ry="5" fill={colors.belly} stroke={colors.bodyDark} strokeWidth="0.8" />
          <ellipse cx="70" cy="85" rx="6" ry="5" fill={colors.belly} stroke={colors.bodyDark} strokeWidth="0.8" />
        </g>
      </svg>

      <style>{`
        .cat-tail-anim {
          animation: tailWag 2.4s ease-in-out infinite alternate;
        }
        .cat-ear-left {
          animation: earTwitchLeft 3.5s ease-in-out infinite;
        }
        .cat-ear-right {
          animation: earTwitchRight 4.2s ease-in-out infinite;
        }
        .cat-eyes-group {
          animation: catBlink 4s infinite;
        }

        @keyframes tailWag {
          0% { transform: rotate(-8deg); }
          50% { transform: rotate(12deg); }
          100% { transform: rotate(-8deg); }
        }

        @keyframes earTwitchLeft {
          0%, 90%, 100% { transform: rotate(0deg); }
          93% { transform: rotate(-10deg); }
          96% { transform: rotate(4deg); }
        }

        @keyframes earTwitchRight {
          0%, 88%, 100% { transform: rotate(0deg); }
          91% { transform: rotate(10deg); }
          94% { transform: rotate(-4deg); }
        }

        @keyframes catBlink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 96% { transform: scaleY(0.1); transform-origin: 60px 45px; }
        }
      `}</style>
    </div>
  );
};
