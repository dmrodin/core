'use client';

import type { Wallet } from '@/entities/wallet';
import { Badge } from '@/shared/ui/shadcn/badge';

interface WalletOwnerProps {
    user: Wallet['user'];
    secondUser?: Wallet['secondUser'];
}

export function WalletOwner({ user, secondUser }: WalletOwnerProps) {
    const username = user?.username?.trim() || 'Неизвестный';
    const secondUsername = secondUser?.username?.trim();

    if (secondUsername) {
        return (
            <div className="flex gap-1 flex-wrap">
                <Badge variant="outline" className="gap-1">
                    <span className="text-xs uppercase text-muted-foreground">владелец 1</span>
                    <span className="font-medium text-foreground">{username}</span>
                </Badge>
                <Badge variant="outline" className="gap-1">
                    <span className="text-xs uppercase text-muted-foreground">владелец 2</span>
                    <span className="font-medium text-foreground">{secondUsername}</span>
                </Badge>
            </div>
        );
    }

    return (
        <Badge variant="outline" className="gap-1">
            <span className="text-xs uppercase text-muted-foreground">владелец</span>
            <span className="font-medium text-foreground">{username}</span>
        </Badge>
    );
}
