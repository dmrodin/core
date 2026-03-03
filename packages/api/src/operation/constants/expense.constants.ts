import { RoleCode } from '../../../prisma/generated/prisma';

export const EXPENSE_OPERATION_TYPE_CODE = 'expense';

export const EXPENSE_CATEGORIES = {
    SALARY: 'salary',
    OTHER: 'other',
} as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[keyof typeof EXPENSE_CATEGORIES];

const RESTRICTED_EXPENSE_CATEGORIES = new Set<ExpenseCategory>([EXPENSE_CATEGORIES.SALARY]);

export const AVAILABLE_EXPENSE_CATEGORIES: ExpenseCategory[] = Object.values(EXPENSE_CATEGORIES);

export function canViewRestrictedExpenseOperations(roles: RoleCode[] = []): boolean {
    return roles.includes(RoleCode.admin) || roles.includes(RoleCode.moderator);
}

export function isRestrictedExpenseOperation(typeCode?: string | null, expenseCategory?: string | null): boolean {
    if (typeCode !== EXPENSE_OPERATION_TYPE_CODE) {
        return false;
    }

    if (!expenseCategory) {
        return false;
    }

    return RESTRICTED_EXPENSE_CATEGORIES.has(expenseCategory as ExpenseCategory);
}
