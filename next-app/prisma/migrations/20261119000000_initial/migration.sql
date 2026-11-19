CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Plan" AS ENUM ('FREE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

CREATE TABLE "DebugJob" (...OLD_INIT_TABLE...);
CREATE TABLE "RateLimitBucket" (...OLD_INIT_TABLE...);

CREATE TABLE "User" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3), "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER', "plan" "Plan" NOT NULL DEFAULT 'FREE',
  "phone" TEXT, "dob" DATE, "gender" TEXT, "address" TEXT, "city" TEXT, "state" TEXT,
  "pincode" TEXT, "profilePhoto" TEXT, "securityQuestion" TEXT, "securityAnswerHash" TEXT,
  "otpHash" TEXT, "otpExpiry" TIMESTAMP(3), "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
  "mfaSecretEncrypted" TEXT, "githubId" TEXT, "githubUsername" TEXT, "githubAvatar" TEXT,
  "googleId" TEXT, "apiKeyHash" TEXT, "dailyScansCount" INTEGER NOT NULL DEFAULT 0,
  "lastScanDate" DATE, "lastAiRequestDate" DATE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_apiKeyHash_key" ON "User"("apiKeyHash");
CREATE INDEX "User_role_plan_idx" ON "User"("role", "plan");
CREATE INDEX "User_githubId_idx" ON "User"("githubId");
CREATE INDEX "User_googleId_idx" ON "User"("googleId");
