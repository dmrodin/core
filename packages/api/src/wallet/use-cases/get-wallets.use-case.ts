import { Injectable } from '@nestjs/common';

import { Prisma } from '../../../prisma/generated/prisma';
import { PrismaService } from '../../common/services/prisma.service';
import { calculatePagination, createAllDataPaginationResponse, createPaginationResponse } from '../../common/utils';
import { GetWalletsDto, WalletSortField } from '../dto';
import { GetWalletsOutput } from '../types';

@Injectable()
export class GetWalletsUseCase {
    constructor(private readonly prisma: PrismaService) {}

    public async execute(getWalletsDto: GetWalletsDto): Promise<GetWalletsOutput> {
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

        if (pinned !== undefined) {
            where.pinned = pinned;
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

        if (active !== undefined) {
            where.active = active;
        }

        if (pinOnMain !== undefined) {
            where.pinOnMain = pinOnMain;
        }

        const total = await this.prisma.wallet.count({ where });

        const baseOptions = {
            where,
            orderBy: {
                [sortField]: sortOrder,
            },
            include: {
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
            },
        };

        const findManyOptions = pagination.shouldPaginate
            ? {
                  ...baseOptions,
                  skip: pagination.skip,
                  take: pagination.take,
              }
            : baseOptions;

        const wallets = await this.prisma.wallet.findMany(findManyOptions);

        const paginationResponse = pagination.shouldPaginate
            ? createPaginationResponse(total, page, limit)
            : createAllDataPaginationResponse(total);

        return {
            wallets,
            pagination: paginationResponse,
        };
    }
}
