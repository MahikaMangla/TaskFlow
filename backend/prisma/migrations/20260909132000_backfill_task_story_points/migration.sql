-- Preserve existing tasks while giving unestimated historical work a safe Fibonacci estimate.
UPDATE "tasks"
SET "story_points" = CASE "priority"
  WHEN 'LOW' THEN 2
  WHEN 'MEDIUM' THEN 3
  WHEN 'HIGH' THEN 5
  WHEN 'CRITICAL' THEN 8
  ELSE 3
END
WHERE "story_points" IS NULL;
