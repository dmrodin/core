-- CreateTable
CREATE TABLE "application_advances" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_advances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_advances_application_id_key" ON "application_advances"("application_id");

-- CreateIndex
CREATE INDEX "application_advances_application_id_idx" ON "application_advances"("application_id");

-- CreateIndex
CREATE INDEX "application_advances_currency_id_idx" ON "application_advances"("currency_id");

-- AddForeignKey
ALTER TABLE "application_advances" ADD CONSTRAINT "application_advances_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_advances" ADD CONSTRAINT "application_advances_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
