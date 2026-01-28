import { Card, CardContent } from '@/shared/ui/shadcn/card';
import { Skeleton } from '@/shared/ui/shadcn/skeleton';

export function WalletCardSkeleton() {
    return (
        <Card className="w-full">
            <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3 sm:max-w-[70%] flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-5 w-48 sm:h-6 sm:w-56" />
                            <Skeleton className="h-4 w-20 sm:w-24" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                    <div className="text-left sm:text-right space-y-2 sm:min-w-[160px]">
                        <Skeleton className="h-7 w-32 sm:h-8 sm:w-40 sm:ml-auto" />
                        <div className="mt-2 space-y-1.5">
                            <Skeleton className="h-3 w-36 sm:w-40 sm:ml-auto" />
                            <Skeleton className="h-3 w-36 sm:w-40 sm:ml-auto" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
