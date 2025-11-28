/*
  Warnings:

  - You are about to drop the column `stripeId` on the `Subscription` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Application_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Property" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "landlordId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "rentAmount" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "propertyType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'VACANT',
    "slug" TEXT,
    "description" TEXT,
    "amenities" TEXT,
    "isListed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Property_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Property" ("address", "city", "id", "landlordId", "rentAmount", "state", "status", "zip") SELECT "address", "city", "id", "landlordId", "rentAmount", "state", "status", "zip" FROM "Property";
DROP TABLE "Property";
ALTER TABLE "new_Property" RENAME TO "Property";
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "paypalSubscriptionId" TEXT,
    "paypalCustomerId" TEXT,
    "paypalPlanId" TEXT,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("endDate", "id", "planId", "startDate", "status", "userId") SELECT "endDate", "id", "planId", "startDate", "status", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE TABLE "new_PropertyImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "size" INTEGER,
    "propertyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PropertyImage_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PropertyImage" ("id", "propertyId", "url") SELECT "id", "propertyId", "url" FROM "PropertyImage";
DROP TABLE "PropertyImage";
ALTER TABLE "new_PropertyImage" RENAME TO "PropertyImage";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
