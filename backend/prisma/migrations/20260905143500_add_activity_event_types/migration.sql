-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'TASK_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'TASK_ASSIGNED';
ALTER TYPE "ActivityType" ADD VALUE 'PROJECT_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'PROJECT_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'PROJECT_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'SPRINT_CREATED';
ALTER TYPE "ActivityType" ADD VALUE 'SPRINT_COMPLETED';
ALTER TYPE "ActivityType" ADD VALUE 'SPRINT_DELETED';
ALTER TYPE "ActivityType" ADD VALUE 'TEAM_MEMBER_UPDATED';
ALTER TYPE "ActivityType" ADD VALUE 'TEAM_MEMBER_REMOVED';
