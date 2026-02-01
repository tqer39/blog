#!/usr/bin/env npx tsx
/**
 * update-changelog.ts
 *
 * Generates or updates CHANGELOG.md based on conventional commits.
 *
 * Usage:
 *   npx tsx scripts/update-changelog.ts                # Update CHANGELOG.md
 *   npx tsx scripts/update-changelog.ts --dry-run      # Preview without writing
 *   npx tsx scripts/update-changelog.ts --version v1.2.3  # Specify version
 */

import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CHANGELOG_PATH = resolve(process.cwd(), 'CHANGELOG.md');

interface Commit {
  hash: string;
  type: string;
  scope: string | null;
  subject: string;
  breaking: boolean;
}

interface ChangelogSection {
  added: string[];
  changed: string[];
  fixed: string[];
  removed: string[];
  security: string[];
  deprecated: string[];
}

function exec(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8' }).trim();
  } catch {
    return '';
  }
}

function getLatestTag(): string {
  return exec('git describe --tags --abbrev=0') || '';
}

function getCommitsSince(tag: string): Commit[] {
  const range = tag ? `${tag}..HEAD` : 'HEAD';
  const format = '%H|%s';
  const output = exec(`git log ${range} --pretty=format:"${format}"`);

  if (!output) return [];

  return output
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, message] = line.split('|');
      return parseCommit(hash, message);
    })
    .filter((commit): commit is Commit => commit !== null);
}

function parseCommit(hash: string, message: string): Commit | null {
  // Match conventional commit format: type(scope)!: subject
  const match = message.match(/^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/);

  if (!match) return null;

  const [, type, scope, breaking, subject] = match;

  // Filter out non-release types
  const releaseTypes = ['feat', 'fix', 'perf', 'refactor', 'docs', 'security'];
  if (!releaseTypes.includes(type)) return null;

  return {
    hash: hash.substring(0, 7),
    type,
    scope: scope || null,
    subject,
    breaking: Boolean(breaking),
  };
}

function categorizeCommits(commits: Commit[]): ChangelogSection {
  const sections: ChangelogSection = {
    added: [],
    changed: [],
    fixed: [],
    removed: [],
    security: [],
    deprecated: [],
  };

  for (const commit of commits) {
    const entry = formatCommitEntry(commit);

    switch (commit.type) {
      case 'feat':
        sections.added.push(entry);
        break;
      case 'fix':
        sections.fixed.push(entry);
        break;
      case 'perf':
      case 'refactor':
        sections.changed.push(entry);
        break;
      case 'security':
        sections.security.push(entry);
        break;
      case 'docs':
        sections.changed.push(entry);
        break;
    }
  }

  return sections;
}

function formatCommitEntry(commit: Commit): string {
  const scope = commit.scope ? `**${commit.scope}**: ` : '';
  const breaking = commit.breaking ? '**BREAKING** ' : '';
  return `- ${breaking}${scope}${commit.subject}`;
}

function generateChangelog(
  version: string,
  sections: ChangelogSection
): string {
  const date = new Date().toISOString().split('T')[0];
  const lines: string[] = [`## [${version}] - ${date}`, ''];

  const sectionOrder: [keyof ChangelogSection, string][] = [
    ['added', 'Added'],
    ['changed', 'Changed'],
    ['fixed', 'Fixed'],
    ['removed', 'Removed'],
    ['security', 'Security'],
    ['deprecated', 'Deprecated'],
  ];

  for (const [key, title] of sectionOrder) {
    if (sections[key].length > 0) {
      lines.push(`### ${title}`, '', ...sections[key], '');
    }
  }

  return lines.join('\n');
}

function readExistingChangelog(): string {
  if (!existsSync(CHANGELOG_PATH)) {
    return `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
  }
  return readFileSync(CHANGELOG_PATH, 'utf-8');
}

function updateChangelog(existingContent: string, newEntry: string): string {
  // Find the position after the header (after "## [Unreleased]" or first "## [")
  const unreleasedMatch = existingContent.match(/## \[Unreleased\]\n*/);
  const firstVersionMatch = existingContent.match(/## \[v?\d+\.\d+\.\d+\]/);

  if (unreleasedMatch?.index !== undefined) {
    // Insert after [Unreleased] section header
    const insertPos = unreleasedMatch.index + unreleasedMatch[0].length;
    return (
      existingContent.slice(0, insertPos) +
      '\n' +
      newEntry +
      existingContent.slice(insertPos)
    );
  }

  if (firstVersionMatch?.index !== undefined) {
    // Insert before the first version
    return (
      existingContent.slice(0, firstVersionMatch.index) +
      newEntry +
      existingContent.slice(firstVersionMatch.index)
    );
  }

  // Append to the end
  return `${existingContent}\n${newEntry}`;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const versionIndex = args.indexOf('--version');
  const customVersion = versionIndex !== -1 ? args[versionIndex + 1] : null;

  const latestTag = getLatestTag();
  const version =
    customVersion || exec('./scripts/calculate-version.sh') || 'v0.1.0';

  console.log(`Latest tag: ${latestTag || 'none'}`);
  console.log(`New version: ${version}`);

  const commits = getCommitsSince(latestTag);

  if (commits.length === 0) {
    console.log('No new commits to include in changelog.');
    return;
  }

  console.log(`Found ${commits.length} commits to include.`);

  const sections = categorizeCommits(commits);
  const newEntry = generateChangelog(version, sections);

  console.log('\n--- New Changelog Entry ---\n');
  console.log(newEntry);

  if (dryRun) {
    console.log('\n(dry-run mode, not writing to file)');
    return;
  }

  const existingContent = readExistingChangelog();
  const updatedContent = updateChangelog(existingContent, newEntry);

  writeFileSync(CHANGELOG_PATH, updatedContent);
  console.log(`\nUpdated ${CHANGELOG_PATH}`);
}

main();
