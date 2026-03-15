-- AlterTable
ALTER TABLE "HackathonParticipant"
ADD COLUMN "teamName" TEXT NOT NULL DEFAULT 'Team Name',
ADD COLUMN "teamLeader" TEXT NOT NULL DEFAULT 'Team Leader',
ADD COLUMN "teammateGithubUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "memberCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "trackedRepo" TEXT NOT NULL DEFAULT 'https://github.com/owner/repo';

-- Data backfill for existing placeholder rows
UPDATE "HackathonParticipant"
SET
  "teamName" = CASE
    WHEN "teamName" = 'Team Name' THEN COALESCE(NULLIF("fullName", ''), 'Team Name')
    ELSE "teamName"
  END,
  "teamLeader" = CASE
    WHEN "teamLeader" = 'Team Leader' THEN COALESCE(NULLIF("fullName", ''), 'Team Leader')
    ELSE "teamLeader"
  END;

-- Remove old placeholder columns
ALTER TABLE "HackathonParticipant"
DROP COLUMN "fullName",
DROP COLUMN "college",
DROP COLUMN "phone";
