-- AlterTable
ALTER TABLE "operation_types" ADD COLUMN     "is_credit" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_debit" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "operations" ADD COLUMN     "banks_group_id" UUID;

-- AlterTable
ALTER TABLE "wallets" ADD COLUMN     "last_reconciled_at" TIMESTAMP(3),
ADD COLUMN     "last_reconciled_by" UUID;
