'use client';

import React from 'react';
import Link from 'next/link';
import ElectricBorder from './ElectricBorder';

export interface ElectricButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  color?: string;
  borderRadius?: number;
  speed?: number;
  chaos?: number;
  thickness?: number;
  strands?: number;
  glow?: number;
  intensity?: number;
  arcs?: number;
  interactive?: boolean;
  wrapperClassName?: string;
  children: React.ReactNode;
}

export const ElectricButton: React.FC<ElectricButtonProps> = ({
  href,
  color = '#06b6d4',
  borderRadius = 16,
  speed = 1,
  chaos = 0.5,
  thickness = 1.2,
  strands = 2,
  glow = 0.6,
  intensity = 0.85,
  arcs = 1,
  interactive = true,
  wrapperClassName = '',
  className = '',
  children,
  onClick,
  disabled,
  type = 'button',
  ...rest
}) => {
  const content = (
    <ElectricBorder
      color={color}
      borderRadius={borderRadius}
      speed={speed}
      chaos={chaos}
      thickness={thickness}
      strands={strands}
      glow={glow}
      intensity={intensity}
      arcs={arcs}
      interactive={interactive}
      className={`inline-flex ${wrapperClassName}`}
    >
      <span className={className}>
        {children}
      </span>
    </ElectricBorder>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="inline-block" onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-block p-0 border-0 bg-transparent text-inherit font-inherit cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      {...rest}
    >
      {content}
    </button>
  );
};

export default ElectricButton;
