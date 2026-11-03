import type { CSSProperties, ReactNode } from 'react';

/** Preview decoration only. Video uses the capture-excluded selector window;
 * screenshot export draws the original pixels and marks on a separate canvas.
 * A still, thin line with a dark contour: no animated layers, so the monitor-sized
 * transparent window is not repainted while the user selects or edits. */
export default function CaptureFrame({ width, height, color = '#ffffff', className = '', style, image, dragging, testId, children }: {
  width: number; height: number; color?: string; className?: string; style?: CSSProperties;
  image?: boolean; dragging?: boolean; testId?: string; children?: ReactNode;
}) {
  const radius = Math.max(0, Math.min(14, width / 2, height / 2));
  return <div className={`capture-frame ${className}`} data-image={image} data-dragging={dragging} data-testid={testId}
    style={{ width, height, borderColor: color, borderRadius: radius, '--capture-frame-color': color, ...style } as CSSProperties}>
    {children}
  </div>;
}
