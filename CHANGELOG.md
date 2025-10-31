# Changelog

All notable changes to backupRepos will be documented in this file.

The format is based on [Keep a Changelog][Keep a Changelog url], and this project adheres to [Semantic Versioning][Semantic Versioning url].

## [1.0.0] (31 October 2025)

### Added

1. CLI command `backup-repos backup <path1> [<path2> ...] <backup-location>` to scan git repositories under one or more paths for unpushed changes (via `git diff @{u}`) and copy modified/added/untracked files to a platform/home-relative backup structure.
1. Fallback to backing up all tracked + non-ignored untracked files if no upstream remote is configured.
1. Automatic deletion of removed files from backups to keep them in sync.
1. Skip copies if source file is not newer than backup (mtime check) for efficiency.
1. Backup of non-ignored `temp/` directories under all specified `<paths>` using `rsync` for full directory sync.
1. Git ignore-aware processing: Skip files/directories ignored via `.gitignore` using `git check-ignore`.

<!-- References -->

[Keep a Changelog url]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning url]: https://semver.org/spec/v2.0.0.html
[1.0.0]: https://github.com/SherpadNdabambi/backup-repos/releases/tag/v1.0.0
