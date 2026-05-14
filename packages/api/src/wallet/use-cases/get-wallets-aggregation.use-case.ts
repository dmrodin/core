import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { GetWalletsDto } from '../dto';
import { GetWalletsAggregationOutput } from '../types';

@Injectable()
export class GetWalletsAggregationUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(getWalletsDto: GetWalletsDto, currentUserId?: string): Promise<GetWalletsAggregationOutput> {
        const {
            search,
            balanceStatus,
            walletKind,
            walletTypeId,
            minAmount,
            maxAmount,
            currencyId,
            userId,
            active,
            pinOnMain,
            pinned,
            visible,
            deleted,
            includeTabWalletTypes,
        } = getWalletsDto;

        const where: Prisma.WalletWhereInput = {};

        if (pinned === true) {
            where.fastAccessPins = currentUserId
                ? { some: { userId: currentUserId } }
                : { some: { userId: '00000000-0000-0000-0000-000000000000' } };
        } else if (pinned === false) {
            where.pinned = false;
        }

        if (visible !== undefined) {
            where.visible = visible;
        }

        if (deleted !== undefined) {
            where.deleted = deleted;
        }

        const orConditions: Prisma.WalletWhereInput[] = [];

        if (search) {
            orConditions.push(
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { walletType: { name: { contains: search, mode: 'insensitive' } } },
                { details: { ownerFullName: { contains: search, mode: 'insensitive' } } },
                { details: { card: { contains: search, mode: 'insensitive' } } },
                { details: { phone: { contains: search, mode: 'insensitive' } } },
                { details: { address: { contains: search, mode: 'insensitive' } } },
                { details: { exchangeUid: { contains: search, mode: 'insensitive' } } },
                { details: { username: { contains: search, mode: 'insensitive' } } },
                { details: { accountId: { contains: search, mode: 'insensitive' } } },
                { details: { network: { name: { contains: search, mode: 'insensitive' } } } },
                { details: { networkType: { name: { contains: search, mode: 'insensitive' } } } },
                { currency: { code: { contains: search, mode: 'insensitive' } } },
                { currency: { name: { contains: search, mode: 'insensitive' } } },
                { user: { username: { contains: search, mode: 'insensitive' } } },
            );

            const searchLower = search.toLowerCase().trim();

            // Подмешиваем все simple-кошельки (кассы), только когда ввод —
            // строгий префикс слова «касса» (т.е. юзер ещё печатает первое слово).
            if (searchLower.length > 0 && 'касса'.startsWith(searchLower)) {
                orConditions.push({ walletKind: 'simple' });
            }
        }

        if (orConditions.length > 0) {
            where.OR = orConditions;
        }

        const isAllTabContext =
            !includeTabWalletTypes &&
            walletTypeId === undefined &&
            (visible === true || visible === undefined) &&
            (deleted === false || deleted === undefined) &&
            (pinned === false || pinned === undefined);

        if (isAllTabContext) {
            const andConditions = Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : [];

            where.AND = [
                ...andConditions,
                {
                    OR: [{ walletTypeId: null }, { walletType: { showInTabs: false } }],
                },
            ];
        }

        if (balanceStatus !== undefined) {
            where.balanceStatus = balanceStatus;
        }

        if (walletKind !== undefined) {
            where.walletKind = walletKind;
        }

        if (walletTypeId !== undefined) {
            where.walletTypeId = walletTypeId;
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            where.amount = {};
            if (minAmount !== undefined) {
                where.amount.gte = minAmount;
            }
            if (maxAmount !== undefined) {
                where.amount.lte = maxAmount;
            }
        }

        if (currencyId) {
            where.currencyId = currencyId;
        }

        if (userId) {
            where.userId = userId;
        }

        if (active !== undefined) {
            where.active = active;
        }

        if (pinOnMain !== undefined) {
            where.pinOnMain = pinOnMain;
        }

        const wallets = await this.prisma.wallet.findMany({
            where,
            select: {
                amount: true,
                currency: {
                    select: {
                        id: true,
                        code: true,
                        name: true,
                    },
                },
            },
        });

        const currencyMap = new Map<
            string,
            {
                currency: { id: string; code: string; name: string };
                totalAmount: number;
                walletsCount: number;
            }
        >();

        wallets.forEach((wallet) => {
            const currencyId = wallet.currency.id;

            if (!currencyMap.has(currencyId)) {
                currencyMap.set(currencyId, {
                    currency: wallet.currency,
                    totalAmount: 0,
                    walletsCount: 0,
                });
            }

            const group = currencyMap.get(currencyId)!;

            group.totalAmount += wallet.amount;
            group.walletsCount += 1;
        });

        const currencyGroups = Array.from(currencyMap.values());

        return {
            currencyGroups,
        };
    }
}
