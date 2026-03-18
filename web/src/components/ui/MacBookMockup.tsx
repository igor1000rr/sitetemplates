interface Props {
  src: string
  alt?: string
  className?: string
}

export default function MacBookMockup({ src, alt = '', className = '' }: Props) {
  return (
    <div className={`relative ${className}`}>
      {/* Screen bezel */}
      <div className="relative bg-[#1a1a2e] rounded-t-[12px] border-[3px] border-[#2a2a3e] overflow-hidden shadow-2xl">
        {/* Camera notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60px] h-[14px] bg-[#1a1a2e] rounded-b-lg z-10 flex items-center justify-center">
          <div className="w-[5px] h-[5px] rounded-full bg-[#333]" />
        </div>

        {/* Screen */}
        <div className="pt-[14px]">
          <img src={src} alt={alt} className="w-full aspect-[16/10] object-cover" />
        </div>
      </div>

      {/* Hinge */}
      <div className="relative mx-auto">
        <div className="h-[8px] bg-gradient-to-b from-[#2a2a3e] to-[#222236] rounded-b-sm" />
        <div className="h-[4px] bg-[#1e1e30] mx-[8%] rounded-b-lg" />
      </div>

      {/* Base */}
      <div className="h-[3px] bg-gradient-to-b from-[#2a2a3e] to-[#1a1a2e] mx-[4%] rounded-b-xl" />
    </div>
  )
}
