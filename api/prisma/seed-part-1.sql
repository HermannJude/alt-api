INSERT INTO "categories" ("name", "slug", "description", "color_hex")
VALUES
  ('Communication', 'communication', 'Messaging and collaboration tools', '#10b981'),
  ('Development', 'development', 'Development and DevOps tools', '#3b82f6'),
  ('Analytics', 'analytics', 'Business analytics tools', '#ef4444')
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "tools" (
  "name",
  "description",
  "vendor",
  "website_url",
  "category_id",
  "monthly_cost",
  "active_users_count",
  "owner_department",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  'Slack',
  'Team messaging platform',
  'Slack Technologies',
  'https://slack.com',
  c.id,
  8.00,
  25,
  'Engineering'::"Department",
  'active'::"ToolStatus",
  NOW(),
  NOW()
FROM "categories" c
WHERE c.slug = 'communication'
ON CONFLICT DO NOTHING;

INSERT INTO "tools" (
  "name",
  "description",
  "vendor",
  "website_url",
  "category_id",
  "monthly_cost",
  "active_users_count",
  "owner_department",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  'GitHub',
  'Version control and collaboration',
  'GitHub Inc.',
  'https://github.com',
  c.id,
  21.00,
  10,
  'Engineering'::"Department",
  'active'::"ToolStatus",
  NOW(),
  NOW()
FROM "categories" c
WHERE c.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO "tools" (
  "name",
  "description",
  "vendor",
  "website_url",
  "category_id",
  "monthly_cost",
  "active_users_count",
  "owner_department",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  'Confluence',
  'Documentation and knowledge base',
  'Atlassian',
  'https://confluence.atlassian.com',
  c.id,
  5.50,
  9,
  'Engineering'::"Department",
  'active'::"ToolStatus",
  NOW(),
  NOW()
FROM "categories" c
WHERE c.slug = 'development'
ON CONFLICT DO NOTHING;

INSERT INTO "tools" (
  "name",
  "description",
  "vendor",
  "website_url",
  "category_id",
  "monthly_cost",
  "active_users_count",
  "owner_department",
  "status",
  "created_at",
  "updated_at"
)
SELECT
  'Tableau',
  'Business intelligence platform',
  'Salesforce',
  'https://tableau.com',
  c.id,
  70.00,
  3,
  'Finance'::"Department",
  'active'::"ToolStatus",
  NOW(),
  NOW()
FROM "categories" c
WHERE c.slug = 'analytics'
ON CONFLICT DO NOTHING;