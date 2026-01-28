import { cn } from '@/shared/lib/utils';

interface LoadingProps {
    /**
     * Variant определяет стиль отображения
     * - inline: для использования внутри контента (меньше отступы)
     * - page: для полностраничной загрузки (больше отступы)
     */
    variant?: 'inline' | 'page';
    /**
     * Текст загрузки
     */
    text?: string;
    /**
     * Дополнительные CSS классы
     */
    className?: string;
}

export function Loading({ variant = 'inline', text = 'Загрузка...', className }: LoadingProps) {
    if (variant === 'page') {
        return (
            <div className={cn('max-w-5xl mx-auto', className)}>
                <div className="text-center py-12">
                    <p className="text-muted-foreground">{text}</p>
                </div>
            </div>
        );
    }

    return <div className={cn('text-center py-8 text-muted-foreground', className)}>{text}</div>;
}
