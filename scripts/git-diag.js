#!/usr/bin/env node
/**
 * Git diagnostic: run git commands and print results. Use when debugging GitHub sync.
 * Run from a terminal with network to see ls-remote, fetch, and push results.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');

function run(cmd, o) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: REPO, ...o });
  } catch (e) {
    return (e.stderr || e.stdout || e.message || String(e)).slice(0, 2000);
  }
}

function out(msg, data) {
  const d = typeof data === 'string' ? { output: data } : data;
  console.log('---', msg, '---');
  console.log(JSON.stringify(d, null, 2));
}

out('repo', { cwd: REPO, hasGit: fs.existsSync(path.join(REPO, '.git')) });
out('remote -v', run('git remote -v'));
out('branch -a', run('git branch -a'));
out('local main', run('git log main --oneline -10'));
const ref = (() => {
  const p = path.join(REPO, '.git/refs/remotes/origin/main');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch { return 'missing'; }
})();
out('origin/main (cached)', { originMainRef: ref });
out('ls-remote origin main', run('git ls-remote origin main 2>&1'));
out('fetch origin', run('git fetch origin 2>&1'));
out('origin/main after fetch', run('git log origin/main --oneline -5 2>&1'));
out('push origin main', run('git push origin main 2>&1'));
