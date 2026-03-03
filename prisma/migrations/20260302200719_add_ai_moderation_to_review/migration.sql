-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "aiApproved" BOOLEAN,
ADD COLUMN     "aiError" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiModel" TEXT DEFAULT 'gemini-1.5-flash',
ADD COLUMN     "aiModerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiReason" TEXT;
