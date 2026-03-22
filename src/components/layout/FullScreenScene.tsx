"use client";

interface FullScreenSceneProps {
  children: React.ReactNode;
  bgImage?: string;
}

export function FullScreenScene({
  children,
  bgImage = "/images/bg-scenic.png",
}: FullScreenSceneProps) {
  return (
    <div className="relative w-full h-screen overflow-y-scroll overflow-x-hidden">
      {/* Background image — set by user later via public/images/ */}
      <div
        className="fixed inset-0 bg-cover bg-no-repeat z-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundPosition: "center top",
        }}
        aria-hidden
      />

      {/* Fallback gradient — only visible when image is missing (behind image layer) */}
      <div
        className="absolute inset-0 -z-10 bg-linear-to-br from-[#0e0714] via-[#11081a] to-mg-bg"
        aria-hidden
      />

      {/* Content */}
      {children}
    </div>
  );
}
