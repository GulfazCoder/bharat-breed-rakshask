import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "primary" | "white" | "gray";
}

const LoadingSpinner = ({ 
  size = "md", 
  className, 
  color = "primary" 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  const colorClasses = {
    primary: "border-primary border-t-transparent",
    white: "border-white border-t-transparent",
    gray: "border-gray-300 border-t-transparent"
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-2",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;