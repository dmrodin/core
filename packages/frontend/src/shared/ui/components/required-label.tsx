import { FormLabel } from '@/shared/ui/shadcn/form';

interface RequiredLabelProps {
    children: React.ReactNode;
    required?: boolean;
    className?: string;
}

export function RequiredLabel({ children, required = false, className }: RequiredLabelProps) {
    return (
        <FormLabel className={className}>
            {children}
            {required && <span className="text-destructive ml-1">*</span>}
        </FormLabel>
    );
}
