"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type UserImageProps = Omit<ImageProps, "onLoadingComplete"> & {
  fallback?: React.ReactNode;
};

export function UserImage({ src, alt, className, fallback, ...props }: UserImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      unoptimized
      onError={() => setError(true)}
      {...props}
    />
  );
}
