import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils'; // A utility for combining class names

interface LoadingSpinnerProps {
  className?: string;
}

const LoadingSpinner = ({ className }: LoadingSpinnerProps) => {
  return (
    <Loader
      className={cn('animate-spin text-muted-foreground', className)}
    />
  );
};

export default LoadingSpinner;