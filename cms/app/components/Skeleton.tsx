import React from 'react';

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded-md ${className}`} />
  );
}
