-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "platform" TEXT NOT NULL DEFAULT 'Upwork',
    "title" TEXT NOT NULL,
    "url" TEXT,
    "description" TEXT NOT NULL,
    "budget" TEXT,
    "postedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "draftText" TEXT NOT NULL,
    "questions" TEXT,
    "pricingNote" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Proposal_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PortfolioItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "urlLive" TEXT NOT NULL,
    "urlGithub" TEXT,
    "keywords" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Proposal_jobId_version_key" ON "Proposal"("jobId", "version");
