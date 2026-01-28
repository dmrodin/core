import { useCallback, useEffect, useRef } from 'react';

export function useLastItemObserver<T extends Element = HTMLElement>(
    fetchNextPage: () => void,
    isLoading: boolean,
    hasNextPage: boolean,
): (node: T | null) => void {
    const observer = useRef<IntersectionObserver | null>(null);

    const lastItemRef = useCallback(
        (node: T | null) => {
            if (isLoading || !hasNextPage) return;

            if (observer.current) {
                observer.current.disconnect();
                observer.current = null;
            }

            if (!node) return;

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0]?.isIntersecting) {
                    fetchNextPage();
                }
            });

            observer.current.observe(node);
        },
        [fetchNextPage, isLoading, hasNextPage],
    );

    useEffect(() => {
        if (isLoading || !hasNextPage) {
            if (observer.current) {
                observer.current.disconnect();
                observer.current = null;
            }
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
                observer.current = null;
            }
        };
    }, [isLoading, hasNextPage]);

    return lastItemRef;
}
