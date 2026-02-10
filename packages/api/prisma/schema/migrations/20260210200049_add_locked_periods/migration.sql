-- CreateTable
CREATE TABLE "locked_periods" (
    "id" TEXT NOT NULL,
    "dateFrom" DATE NOT NULL,
    "dateTo" DATE NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedById" UUID NOT NULL,

    CONSTRAINT "locked_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locked_periods_dateFrom_dateTo_idx" ON "locked_periods"("dateFrom", "dateTo");

-- AddForeignKey
ALTER TABLE "locked_periods" ADD CONSTRAINT "locked_periods_lockedById_fkey" FOREIGN KEY ("lockedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
