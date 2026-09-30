"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageWithFallback({
  src,
  alt,
  className,
  fallback,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <>{fallback}</>;
  // These assets are project-owned local SVGs. The fallback keeps profiles
  // usable when an optional demo asset bundle has not been installed.
  return <Image className={className} src={src} alt={alt} width={800} height={500} unoptimized onError={() => setFailed(true)} />;
}
