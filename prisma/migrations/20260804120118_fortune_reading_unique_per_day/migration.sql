/*
  Warnings:

  - A unique constraint covering the columns `[userId,category,readingDate]` on the table `FortuneReading` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "FortuneReading_userId_category_readingDate_idx";

-- CreateIndex
CREATE UNIQUE INDEX "FortuneReading_userId_category_readingDate_key" ON "FortuneReading"("userId", "category", "readingDate");
