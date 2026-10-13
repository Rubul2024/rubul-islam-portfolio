import { cn } from "@/lib/utils";

/**
 * Marks content for a subtle entrance transition. This is a Server Component:
 * the actual observing happens once, in <RevealObserver /> (client).
 * Content is only hidden when JavaScript is running and the user has not
 * requested reduced motion, so nothing is ever lost without JS.
 */
export default function Reveal({ children, delay = 0, className, as: Tag = "div", ...props }) {
  return (
    <Tag
      data-reveal=""
      className={cn(className)}
      style={delay ? { "--reveal-delay": `${delay}ms` } : undefined}
      {...props}
    >
      {children}
    </Tag>
  );
}
