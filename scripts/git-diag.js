#!/usr/bin/env node
/**
 * Git diagnostic: run git commands and log NDJSON to debug.log.
 * Hypotheses: H1=wrong repo, H2=wrong remote, H3=push fails, H4=branch mismatch, H5=origin ref desync
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, '../../.cursor/debug.log');
const LOG_PATH_FALLBACK = path.join(__dirname, '../debug-git.log');
const REPO = path.join(__dirname, '..');

function run(cmd, o) {
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: REPO, ...o });
  } catch (e) {
    return (e.stderr || e.stdout || e.message || String(e)).slice(0, 2000);
  }
}

function log(msg, data, hyp) {
  const line = JSON.stringify({
    timestamp: Date.now(),
    location: 'scripts/git-diag.js',
    message: msg,
    data: typeof data === 'string' ? { output: data } : data,
    hypothesisId: hyp,
  }) + '\n';
  try { fs.appendFileSync(LOG_PATH, line); } catch (_) { fs.appendFileSync(LOG_PATH_FALLBACK, line); }
}

// #region agent log
log('repo path', { cwd: REPO, hasGit: require('fs').existsSync(path.join(REPO, '.git')) }, 'H1');
log('remote -v', run('git remote -v'), 'H2');
log('branch -a', run('git branch -a'), 'H4');
log('local main log', run('git log main --oneline -10'), 'H1');
const originMainRef = (() => {
  const p = path.join(REPO, '.git/refs/remotes/origin/main');
  try { return fs.readFileSync(p, 'utf8').trim(); } catch { return 'missing'; }
})();
log('origin/main ref (cached)', { originMainRef }, 'H5');
log('ls-remote origin main (live GitHub)', run('git ls-remote origin main 2>&1'), 'H3');
log('fetch origin', run('git fetch origin 2>&1'), 'H5');
log('after fetch: origin/main', run('git log origin/main --oneline -5 2>&1'), 'H5');
const pushOut = run('git push origin main 2>&1');
log('push origin main', { output: pushOut }, 'H3');
// #endregion
