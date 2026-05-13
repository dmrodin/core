-- CreateTable
CREATE TABLE "wallet_fast_access_pins" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "wallet_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_fast_access_pins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallet_fast_access_pins_user_wallet_unique" ON "wallet_fast_access_pins"("user_id", "wallet_id");

-- CreateIndex
CREATE INDEX "wallet_fast_access_pins_user_idx" ON "wallet_fast_access_pins"("user_id");

-- CreateIndex
CREATE INDEX "wallet_fast_access_pins_wallet_idx" ON "wallet_fast_access_pins"("wallet_id");

-- AddForeignKey
ALTER TABLE "wallet_fast_access_pins" ADD CONSTRAINT "wallet_fast_access_pins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_fast_access_pins" ADD CONSTRAINT "wallet_fast_access_pins_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
