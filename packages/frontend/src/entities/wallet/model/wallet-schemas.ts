import { z } from 'zod';

import { PaginationSchema } from '@/shared/utils/schemas/common-schemas';

export enum BalanceStatus {
  unknown = 'unknown',
  positive = 'positive',
  negative = 'negative',
  neutral = 'neutral',
}

export enum WalletKind {
  crypto = 'crypto',
  bank = 'bank',
  simple = 'simple',
}

const WalletUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

const WalletDetailsCategorySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});

const WalletDetailsSimpleEntitySchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
});

export const WalletDetailsSchema = z
  .object({
    id: z.string().uuid(),
    phone: z.string().nullable().optional(),
    card: z.string().nullable().optional(),
    ownerFullName: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    accountId: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    exchangeUid: z.string().nullable().optional(),
    category: WalletDetailsCategorySchema.nullable().optional(),
    network: WalletDetailsSimpleEntitySchema.nullable().optional(),
    networkType: WalletDetailsSimpleEntitySchema.nullable().optional(),
    platform: WalletDetailsSimpleEntitySchema.nullable().optional(),
    bank: WalletDetailsSimpleEntitySchema.nullable().optional(),
  })
  .partial({
    phone: true,
    card: true,
    ownerFullName: true,
    address: true,
    accountId: true,
    username: true,
    exchangeUid: true,
    category: true,
    network: true,
    networkType: true,
    platform: true,
    bank: true,
  });

export const WalletCurrencySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
});

export const WalletTypeSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  showInTabs: z.boolean(),
  tabOrder: z.number(),
});

export const WalletSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  user: WalletUserSchema.optional(),
  secondUserId: z.string().uuid().optional().nullable(),
  secondUser: WalletUserSchema.optional().nullable(),
  updatedById: z.string().uuid(),
  currencyId: z.string().uuid(),
  walletTypeId: z.string().uuid().optional().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  amount: z.number(),
  balanceStatus: z.string(),
  walletKind: z.nativeEnum(WalletKind),
  walletType: z.union([WalletTypeSchema, z.string(), z.null()]).optional(),
  active: z.boolean(),
  pinOnMain: z.boolean(),
  pinned: z.boolean(),
  visible: z.boolean(),
  deleted: z.boolean(),
  monthlyLimit: z.number().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  created_by: WalletUserSchema,
  updated_by: WalletUserSchema,
  currency: WalletCurrencySchema,
  details: WalletDetailsSchema.nullable().optional(),
  lastReconciledAt: z.string().datetime().nullable().optional(),
  lastReconciledBy: z.string().uuid().nullable().optional(),
});

export const WalletCurrencyGroupSchema = z.object({
  currency: z.string(),
  wallets: z.array(WalletSchema),
});

export const GetPinnedWalletsResponseSchema = z.object({
  currencyGroups: z.array(WalletCurrencyGroupSchema),
  totalWallets: z.number(),
  totalCurrencies: z.number(),
});

export const WalletPaginationSchema = PaginationSchema;

export const GetWalletsResponseSchema = z.object({
  wallets: z.array(WalletSchema),
  pagination: WalletPaginationSchema,
});

export const GetWalletsResponseDtoSchema = GetWalletsResponseSchema;

export interface WalletType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  showInTabs: boolean;
  tabOrder: number;
  color?: string | null;
  icon?: string | null;
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum WalletSortField {
  NAME = 'name',
  AMOUNT = 'amount',
  BALANCE_STATUS = 'balanceStatus',
  WALLET_KIND = 'walletKind',
  WALLET_TYPE = 'walletType',
  ACTIVE = 'active',
  PINNED = 'pinned',
  VISIBLE = 'visible',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

const optionalTrimmedString = (limit: number, message: string) =>
  z
    .string()
    .max(limit, message)
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    });

const optionalUuid = (message: string) =>
  z
    .union([z.string().uuid(message), z.literal('')])
    .optional()
    .transform((value) => {
      if (typeof value !== 'string') {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    });

const WalletDetailsCreateSchema = z
  .object({
    ownerFullName: optionalTrimmedString(
      255,
      'ФИО не должно превышать 255 символов',
    ),
    card: optionalTrimmedString(
      64,
      'Номер карты не должен превышать 64 символов',
    ),
    phone: optionalTrimmedString(64, 'Телефон не должен превышать 64 символов'),
    address: optionalTrimmedString(
      512,
      'Адрес не должен превышать 512 символов',
    ),
    accountId: optionalTrimmedString(
      255,
      'ID аккаунта не должен превышать 255 символов',
    ),
    exchangeUid: optionalTrimmedString(
      255,
      'UID биржи не должен превышать 255 символов',
    ),
    networkId: optionalUuid('Укажите корректный UUID сети'),
    networkTypeId: optionalUuid('Укажите корректный UUID типа сети'),
    platformId: optionalUuid('Укажите корректный UUID платформы'),
    bankId: optionalUuid('Укажите корректный UUID банка'),
  })
  .transform((details) => {
    const entries = Object.entries(details).filter(
      ([, value]) => value !== undefined && value !== null,
    );

    if (!entries.length) {
      return undefined;
    }

    return Object.fromEntries(entries) as Partial<typeof details>;
  });

export const CreateWalletSchema = z
  .object({
    name: z
      .string({ message: 'Название обязательно' })
      .min(2, 'Название должно содержать минимум 2 символа')
      .max(255, 'Название не должно превышать 255 символов'),
    description: z
      .string()
      .max(2000, 'Описание не должно превышать 2000 символов')
      .optional()
      .transform((value) => {
        if (!value) {
          return undefined;
        }
        const trimmed = value.trim();
        return trimmed.length ? trimmed : undefined;
      }),
    amount: z.coerce
      .number({ message: 'Сумма должна быть числом' })
      .int('Сумма должна быть целым числом')
      .min(0, 'Сумма не может быть отрицательной'),
    walletKind: z
      .enum(WalletKind, { message: 'Выберите вид кошелька' })
      .default(WalletKind.simple),
    walletTypeId: z
      .string()
      .uuid('Укажите корректный UUID')
      .optional()
      .or(z.literal('')),
    currencyId: z
      .string({ message: 'Валюта обязательна' })
      .min(1, 'Валюта обязательна')
      .uuid('Укажите корректный UUID'),
    secondUserId: z
      .string()
      .uuid('Укажите корректный UUID')
      .optional()
      .or(z.literal('')),
    active: z.boolean().default(true),
    pinOnMain: z.boolean().default(false),
    pinned: z.boolean().default(false),
    visible: z.boolean().default(true),
    monthlyLimit: z.coerce
      .number()
      .int('Месячный лимит должен быть целым числом')
      .min(0, 'Месячный лимит не может быть отрицательным')
      .optional()
      .nullable()
      .transform((val) => (val === 0 || val === null ? undefined : val)),
    details: WalletDetailsCreateSchema.optional(),
  })
  .superRefine((data, ctx) => {
    const details = data.details ?? {};

    if (data.walletKind === WalletKind.crypto) {
      if (!details.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['details', 'address'],
          message: 'Укажите адрес кошелька',
        });
      }

      if (!details.networkId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['details', 'networkId'],
          message: 'Выберите сеть',
        });
      }

      if (!details.networkTypeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['details', 'networkTypeId'],
          message: 'Выберите тип сети',
        });
      }
    }
  });

export const GetWalletsFilterSchema = z.object({
  search: z.string().optional(),

  balanceStatus: z.enum(BalanceStatus).optional(),
  walletKind: z.enum(WalletKind).optional(),
  walletTypeId: z.string().uuid().optional(),

  minAmount: z.number().int().min(0).optional().nullable(),
  maxAmount: z.number().int().min(0).optional().nullable(),

  currencyId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  secondUserId: z.string().uuid().optional(),

  active: z.boolean().optional(),

  pinned: z.boolean().optional(),

  visible: z.boolean().optional(),

  pinOnMain: z.boolean().optional(),

  deleted: z.boolean().optional(),

  sortField: z
    .nativeEnum(WalletSortField)
    .default(WalletSortField.CREATED_AT)
    .optional(),
  sortOrder: z.nativeEnum(SortOrder).default(SortOrder.DESC).optional(),

  page: z.number().int().min(1).default(1).optional(),
  limit: z.number().int().min(1).max(100).default(10).optional(),
});

export interface BalanceStatusPayload {
  balanceStatus: string;
  lastReconciledAt?: string;
  lastReconciledBy?: string;
}

export type GetWalletsFilter = z.infer<typeof GetWalletsFilterSchema>;
export type WalletPagination = z.infer<typeof WalletPaginationSchema>;
export type GetWalletsResponse = z.infer<typeof GetWalletsResponseSchema>;
export type WalletDetails = z.infer<typeof WalletDetailsSchema>;
export type WalletCurrency = z.infer<typeof WalletCurrencySchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type WalletCurrencyGroup = z.infer<typeof WalletCurrencyGroupSchema>;
export type GetPinnedWalletsResponse = z.infer<
  typeof GetPinnedWalletsResponseSchema
>;
export type GetWalletsResponseDto = z.infer<typeof GetWalletsResponseDtoSchema>;
export type WalletDetailsCreate = NonNullable<
  z.infer<typeof WalletDetailsCreateSchema>
>;
export type CreateWalletRequest = z.infer<typeof CreateWalletSchema>;
export type CreateWalletFormValues = z.input<typeof CreateWalletSchema>;
