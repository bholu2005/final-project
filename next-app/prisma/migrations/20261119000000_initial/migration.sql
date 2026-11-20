CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "Plan" AS ENUM ('FREE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerifiedAt" TIMESTAMP(3),
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'USER',
  "plan" "Plan" NOT NULL DEFAULT 'FREE',
  "phone" TEXT,
  "dob" DATE,
  "gender" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "profilePhoto" TEXT,
  "securityQuestion" TEXT,
  "securityAnswerHash" TEXT,
  "otpHash" TEXT,
  "otpExpiry" TIMESTAMP(3),
  "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
  "mfaSecretEncrypted" TEXT,
  "githubId" TEXT,
  "githubUsername" TEXT,
  "githubAvatar" TEXT,
  "googleId" TEXT,
  "apiKeyHash" TEXT,
  "dailyScansCount" INTEGER NOT NULL DEFAULT 0,
  "lastScanDate" DATE,
  "lastAiRequestDate" DATE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_apiKeyHash_key" ON "User"("apiKeyHash");
CREATE INDEX "User_role_plan_idx" ON "User"("role", "plan");
CREATE INDEX "User_githubId_idx" ON "User"("githubId");
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

CREATE TABLE "Scan" (
  "id" TEXT NOT NULL,
  "scanReference" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "target" TEXT NOT NULL,
  "scanType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "results" JSONB NOT NULL DEFAULT '[]',
  "summary" JSONB,
  "reportPath" TEXT,
  "errorCode" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Scan_scanReference_key" ON "Scan"("scanReference");
CREATE INDEX "Scan_userId_createdAt_idx" ON "Scan"("userId", "createdAt");
CREATE INDEX "Scan_status_createdAt_idx" ON "Scan"("status", "createdAt");

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'info',
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

CREATE TABLE "Ticket" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'general',
  "priority" TEXT NOT NULL DEFAULT 'normal',
  "status" TEXT NOT NULL DEFAULT 'open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Ticket_userId_status_createdAt_idx" ON "Ticket"("userId", "status", "createdAt");

CREATE TABLE "TeamMember" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "memberId" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" TEXT NOT NULL DEFAULT 'member',
  "status" TEXT NOT NULL DEFAULT 'invited',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamMember_ownerId_email_key" ON "TeamMember"("ownerId", "email");
CREATE INDEX "TeamMember_ownerId_status_idx" ON "TeamMember"("ownerId", "status");

CREATE TABLE "Transaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalId" TEXT,
  "plan" "Plan" NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Transaction_provider_externalId_key" ON "Transaction"("provider", "externalId");
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");

CREATE TABLE "Monitor" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "targetUrl" TEXT NOT NULL,
  "intervalM" INTEGER NOT NULL DEFAULT 60,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastStatus" TEXT,
  "lastRunAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Monitor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Monitor_userId_active_idx" ON "Monitor"("userId", "active");

CREATE TABLE "SecurityLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "ipAddress" TEXT,
  "type" TEXT NOT NULL,
  "path" TEXT,
  "payload" JSONB,
  "severity" TEXT NOT NULL DEFAULT 'medium',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SecurityLog_type_createdAt_idx" ON "SecurityLog"("type", "createdAt");

CREATE TABLE "Feedback" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "rating" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Feedback_status_createdAt_idx" ON "Feedback"("status", "createdAt");

CREATE TABLE "Integration" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "serviceName" TEXT NOT NULL,
  "webhookUrl" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Integration_userId_serviceName_key" ON "Integration"("userId", "serviceName");

CREATE TABLE "Setting" (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "DebugJob" (
  "id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'queued',
  "prompt" TEXT NOT NULL,
  "result" TEXT,
  "errorCode" TEXT,
  "provider" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "pollTokenHash" TEXT NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lockedAt" TIMESTAMP(3),
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  CONSTRAINT "DebugJob_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "DebugJob_status_nextAttemptAt_createdAt_idx" ON "DebugJob"("status", "nextAttemptAt", "createdAt");
CREATE INDEX "DebugJob_createdAt_idx" ON "DebugJob"("createdAt");

CREATE TABLE "RateLimitBucket" (
  "key" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);
CREATE INDEX "RateLimitBucket_updatedAt_idx" ON "RateLimitBucket"("updatedAt");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Scan" ADD CONSTRAINT "Scan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Monitor" ADD CONSTRAINT "Monitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
