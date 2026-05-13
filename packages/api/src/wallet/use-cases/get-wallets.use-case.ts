import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { calculatePagination, createAllDataPaginationResponse, createPaginationResponse } from '../../common/utils';
import { GetWalletsDto, WalletResponseDto, WalletSortField } from '../dto';
import { GetWalletsOutput } from '../types';

@Injectable()
export class GetWalletsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(getWalletsDto: GetWalletsDto, currentUserId?: string): Promise<GetWalletsOutput> {
        const {
            search,
            searchByName,
            balanceStatus,
            walletKind,
            walletTypeId,
            minAmount,
            maxAmount,
            currencyId,
            userId,
            secondUserId,
            ownerId,
            active,
            pinOnMain,
            pinned,
            visible,
            deleted,
            includeTabWalletTypes,
            sortField = WalletSortField.CREATED_AT,
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = getWalletsDto;

        const pagination = calculatePagination({ page, limit });

        const where: Prisma.WalletWhereInput = {};

        if (pinned === true) {
            // "Быстрый доступ" tab — показываем только личные пины текущего пользователя
            where.fastAccessPins = currentUserId
                ? { some: { userId: currentUserId } }
                : { some: { userId: '00000000-0000-0000-0000-000000000000' } }; // anon fallback: пусто
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
            if (searchByName) {
                orConditions.push({ name: { contains: search, mode: 'insensitive' } });
            } else {
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
                    { secondUser: { username: { contains: search, mode: 'insensitive' } } },
                );
            }

            const searchLower = search.toLowerCase();

            if ('касса'.startsWith(searchLower) || searchLower.startsWith('касс')) {
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

        if (secondUserId) {
            where.secondUserId = secondUserId;
        }

        if (ownerId) {
            where.OR = [{ userId: ownerId }, { secondUserId: ownerId }];
        }

        if (active !== undefined) {
            where.active = active;
        }

        if (pinOnMain !== undefined) {
            where.pinOnMain = pinOnMain;
        }

        const total = await this.prisma.wallet.count({ where });

        const orderBy = { [sortField]: sortOrder };

        const include = {
            user: {
                select: {
                    id: true,
                    username: true,
                },
            },
            secondUser: {
                select: {
                    id: true,
                    username: true,
                },
            },
            created_by: {
                select: {
                    id: true,
                    username: true,
                },
            },
            updated_by: {
                select: {
                    id: true,
                    username: true,
                },
            },
            lastReconciled_by: {
                select: {
                    id: true,
                    username: true,
                },
            },
            currency: {
                select: {
                    id: true,
                    name: true,
                    code: true,
                },
            },
            walletType: {
                select: {
                    id: true,
                    code: true,
                    name: true,
                    description: true,
                    showInTabs: true,
                    tabOrder: true,
                },
            },
            details: {
                select: {
                    id: true,
                    phone: true,
                    card: true,
                    ownerFullName: true,
                    address: true,
                    accountId: true,
                    username: true,
                    exchangeUid: true,
                    network: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    networkType: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    platform: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                    bank: {
                        select: {
                            id: true,
                            code: true,
                            name: true,
                        },
                    },
                },
            },
        };

        let wallets: WalletResponseDto[];

        if (currentUserId) {
            const whereByMe: Prisma.WalletWhereInput = { AND: [where, { updatedById: currentUserId }] };
            const whereOthers: Prisma.WalletWhereInput = {
                AND: [where, { updatedById: { not: currentUserId } }],
            };

            const orderByMe = { updatedAt: 'desc' as const };

            if (!pagination.shouldPaginate) {
                const [byMe, byOthers] = await Promise.all([
                    this.prisma.wallet.findMany({ where: whereByMe, orderBy: orderByMe, include }),
                    this.prisma.wallet.findMany({ where: whereOthers, orderBy, include }),
                ]);

                wallets = [...byMe, ...byOthers] as unknown as WalletResponseDto[];
            } else {
                const countByMe = await this.prisma.wallet.count({ where: whereByMe });
                const skip = pagination.skip ?? 0;
                const take = pagination.take ?? limit;

                const mySkip = Math.min(skip, countByMe);
                const myTake = Math.max(0, Math.min(take, countByMe - mySkip));
                const othersSkip = Math.max(0, skip - countByMe);
                const othersTake = take - myTake;

                const [byMe, byOthers] = await Promise.all([
                    myTake > 0
                        ? this.prisma.wallet.findMany({
                              where: whereByMe,
                              orderBy: orderByMe,
                              include,
                              skip: mySkip,
                              take: myTake,
                          })
                        : Promise.resolve([]),
                    othersTake > 0
                        ? this.prisma.wallet.findMany({
                              where: whereOthers,
                              orderBy,
                              include,
                              skip: othersSkip,
                              take: othersTake,
                          })
                        : Promise.resolve([]),
                ]);

                wallets = [...byMe, ...byOthers] as unknown as WalletResponseDto[];
            }
        } else {
            const baseOptions = { where, orderBy, include };
            const findManyOptions = pagination.shouldPaginate
                ? { ...baseOptions, skip: pagination.skip, take: pagination.take }
                : baseOptions;

            wallets = (await this.prisma.wallet.findMany(findManyOptions)) as unknown as WalletResponseDto[];
        }

        if (currentUserId && wallets.length > 0) {
            const ids = wallets.map((w) => w.id);
            const pins = await this.prisma.walletFastAccessPin.findMany({
                where: { userId: currentUserId, walletId: { in: ids } },
                select: { walletId: true },
            });
            const pinnedSet = new Set(pins.map((p) => p.walletId));

            wallets = wallets.map((w) => ({
                ...w,
                isFastAccessByCurrentUser: pinnedSet.has(w.id),
            })) as WalletResponseDto[];
        } else {
            wallets = wallets.map((w) => ({ ...w, isFastAccessByCurrentUser: false })) as WalletResponseDto[];
        }

        const paginationResponse = pagination.shouldPaginate
            ? createPaginationResponse(total, page, limit)
            : createAllDataPaginationResponse(total);

        return {
            wallets,
            pagination: paginationResponse,
        };
    }
}
