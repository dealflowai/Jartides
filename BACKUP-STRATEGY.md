# Database Backup Strategy

## Supabase Built-in Backups

### Daily Backups (All Plans)
Supabase automatically performs **daily backups** of your PostgreSQL database.
- **Free plan**: 7-day retention
- **Pro plan**: 14-day retention, downloadable from Dashboard > Database > Backups

### Point-in-Time Recovery (PITR) — Recommended for Production
PITR allows you to restore your database to **any second** within the retention window.
- Available on **Pro plan** as an add-on ($100/month for 7-day retention)
- Available by default on **Team** and **Enterprise** plans

**To enable PITR:**
1. Go to your Supabase Dashboard
2. Navigate to **Database > Backups > PITR**
3. Enable the add-on

## Action Items Before Launch

- [ ] Confirm you are on the **Pro plan** or higher
- [ ] Enable **PITR** add-on from the Dashboard
- [ ] Verify backups are running: Dashboard > Database > Backups
- [ ] Test a restore on a staging project to confirm the process works
- [ ] Save a copy of `supabase-schema.sql` in version control (already done)

## Manual Backup (Optional Extra Safety)

For critical moments (before migrations, major changes), take a manual backup:

```bash
# Export your database (requires Supabase CLI)
supabase db dump --project-ref <your-project-ref> -f backup_$(date +%Y%m%d).sql

# Or use pg_dump directly
pg_dump "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" > backup.sql
```

## Supabase Storage Backups

Supabase Storage (product images, COA files) is **not included** in database backups.
- Keep original product images in a separate location (local drive, Google Drive, S3)
- COA documents should be backed up separately

## Disaster Recovery Checklist

1. **Database**: Restore from PITR or daily backup via Dashboard
2. **Storage**: Re-upload from your external backup
3. **Environment**: All env vars documented in `.env.local.example`
4. **Schema**: `supabase-schema.sql` + migration files in version control
5. **Code**: Full codebase in Git
