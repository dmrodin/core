-- CreateTable
CREATE TABLE "regulations" (
    "id" UUID NOT NULL,
    "uploaded_by_id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "stored_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regulations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regulations_deleted_created_idx" ON "regulations"("deleted", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "regulations" ADD CONSTRAINT "regulations_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_last_reconciled_by_fkey" FOREIGN KEY ("last_reconciled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
