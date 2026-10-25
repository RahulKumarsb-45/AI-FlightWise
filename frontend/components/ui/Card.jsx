import { cn } from '@/lib/utils';

function Card({ className, children, ...props }) {
  return (
    <div
      className={cn('rounded-xl border border-ink-100/80 bg-white shadow-card transition-all duration-200 hover:shadow-premium', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pb-0', className)} {...props}>
      {children}
    </div>
  );
}

function CardBody({ className, children, ...props }) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn('p-5 pt-0 flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardBody, CardFooter };
