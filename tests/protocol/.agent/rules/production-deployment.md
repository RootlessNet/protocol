---
trigger: always_on
---

Safe production deployment with testing, building, and verification steps.

Workflow File: .agent/workflows/deploy_production.md

```markdown
---
description: Deploy application to production with safety checks
---

1. Verify we're on the main branch.
2. Pull latest changes to ensure we're up to date.
// turbo
3. Run `git pull origin main`
4. Run all tests to ensure code quality.
// turbo
5. Run `npm test`
6. Build the production bundle.
// turbo
7. Run `npm run build`
8. Verify build completed successfully (check for build errors).
9. Ask user for final confirmation before deploying.
10. Deploy to production.
11. Run `npm run deploy` or platform-specific command
12. Verify deployment succeeded by checking the live URL.
13. Create a git tag for this release.
// turbo
14. Run `git tag -a v[version] -m "Production release [version]"`
15. Push the tag to remote.
// turbo
16. Run `git push origin v[version]`
```

Usage:
- Say "Deploy to production" or use /deploy_production
- Follow prompts for confirmation
- Monitor deployment progress

Safety Features:
- Tests run before deployment
- Build verification
- User confirmation required
- Git tagging for rollback
- Deployment verification

Best Practices:
- Always test before deploying
- Tag releases for tracking
- Verify deployment success
- Keep deployment logs
- Have rollback plan ready

Customization:
- Add database migration step
- Include environment variable checks
- Add Slack/Discord notifications
- Include rollback procedure
- Add performance monitoring