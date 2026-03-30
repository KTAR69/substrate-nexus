# Security Setup Guide

This document provides instructions for setting up and using the security tools implemented in this project.

## Overview

This project includes multiple layers of security scanning:

1. **Pre-commit hooks** - Run locally before each commit
2. **CI/CD security scanning** - Run on every build
3. **Dedicated security workflow** - Run on every PR and push

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git installed and configured

## Installation

### 1. Install Dependencies

If you haven't already, install the project dependencies:

```bash
# Root directory
npm install

# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. Initialize Husky (if not already done)

Husky should be automatically initialized when you run `npm install` in the root directory. If not, run:

```bash
npx husky init
```

### 3. Verify Pre-commit Hook

Check that the pre-commit hook exists and is executable:

```bash
# Unix/Mac
ls -la .husky/pre-commit
chmod +x .husky/pre-commit

# Windows (PowerShell)
Get-Item .husky/pre-commit
```

## Usage

### Pre-commit Hook

The pre-commit hook runs automatically when you try to commit changes. It performs the following checks:

1. **Obfuscated Code Detection**
   - Scans for `eval()` usage
   - Detects `Function` constructor usage
   - Identifies Unicode variation selectors
   - Warns about hex/unicode escapes

2. **Package Script Validation**
   - Checks for `preinstall`/`postinstall` scripts
   - Flags suspicious commands (curl, wget, bash -c, etc.)

3. **Hardcoded Credentials Detection**
   - Scans for passwords, API keys, secrets, tokens
   - Detects AWS access keys
   - Identifies private keys

#### Example Output

```bash
$ git commit -m "Add new feature"
🔒 Running security checks...
🔍 Checking for obfuscated code patterns...
✓ No obfuscated code patterns detected
🔍 Checking for suspicious package.json scripts...
✓ No package.json files to check
🔍 Checking for hardcoded credentials...
✓ No hardcoded credentials detected

✅ All security checks passed!
[main abc1234] Add new feature
```

#### If Security Issues Are Found

If the pre-commit hook finds security issues, it will block the commit:

```bash
$ git commit -m "Add feature"
🔒 Running security checks...
🔍 Checking for obfuscated code patterns...
✗ Found eval() in src/app.js
src/app.js:42:  const result = eval(userInput);

❌ Security check failed! Found 1 issue(s).
Please fix the security issues before committing.
```

To fix:
1. Review and fix the security issues
2. Stage the fixed files: `git add .`
3. Try committing again: `git commit -m "Your message"`

#### Bypassing the Hook (Not Recommended)

In rare cases where you need to bypass the hook (e.g., for testing):

```bash
git commit --no-verify -m "Your message"
```

**⚠️ Warning**: Only use `--no-verify` when absolutely necessary and ensure the code is reviewed manually.

### CI/CD Security Scanning

The CI/CD pipeline includes a `security-scan` job that runs automatically on:
- Every pull request
- Every push to main/master branches

#### What It Checks

1. **npm audit** in root, frontend, and backend directories
2. **Obfuscated code** patterns
3. **Suspicious package scripts**
4. **Hardcoded credentials**

#### Viewing Results

1. Go to the **Actions** tab in your GitHub repository
2. Click on the workflow run
3. View the `security-scan` job results

### Dedicated Security Check Workflow

A comprehensive security workflow runs on every PR and push to main/master/develop branches.

#### Features

- Detailed security report in GitHub Actions summary
- Multiple security checks including:
  - Install script validation
  - Obfuscated code detection
  - Suspicious pattern scanning
  - npm audit for all directories
  - Dependency confusion risk assessment

#### Viewing Results

1. Go to the **Actions** tab
2. Click on the **Security Check** workflow
3. View the detailed summary with all findings

## Running Security Checks Manually

### Run npm audit

```bash
# Root directory
npm audit

# Frontend
cd frontend
npm audit

# Backend
cd backend
npm audit
```

### Fix Vulnerabilities

```bash
# Fix non-breaking changes
npm audit fix

# Fix all issues (may include breaking changes)
npm audit fix --force
```

### Test Pre-commit Hook

```bash
# Create a test file
echo "// test" > test.js

# Stage and try to commit
git add test.js
git commit -m "test: security check"

# Clean up
rm test.js
```

## Troubleshooting

### Pre-commit Hook Not Running

1. **Check if Husky is installed**:
   ```bash
   npm list husky
   ```

2. **Reinstall Husky**:
   ```bash
   npm install --save-dev husky
   npx husky init
   ```

3. **Check Git hooks path**:
   ```bash
   git config core.hooksPath
   ```
   Should output: `.husky`

4. **Verify hook file exists**:
   ```bash
   ls -la .husky/pre-commit
   ```

### Hook Fails on Windows

If you encounter issues on Windows:

1. **Use Git Bash** instead of PowerShell/CMD
2. **Check line endings**: Ensure the hook file uses LF (not CRLF)
3. **Install WSL**: Consider using Windows Subsystem for Linux

### False Positives

If the security checks flag legitimate code:

1. **Review the warning** - Ensure it's actually a false positive
2. **Add comments** explaining why the code is safe
3. **Update the hook** if needed to exclude specific patterns
4. **Document exceptions** in your PR description

### CI/CD Workflow Fails

1. **Check the workflow logs** in GitHub Actions
2. **Verify all package.json files** are valid
3. **Ensure dependencies are installed** correctly
4. **Review recent changes** that might have introduced issues

## Best Practices

### 1. Regular Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Run audit after updates
npm audit
```

### 2. Review Security Warnings

- Don't ignore security warnings
- Investigate each finding
- Document why certain warnings are acceptable (if any)

### 3. Keep Secrets Out of Code

- Use environment variables: `process.env.API_KEY`
- Use secret management tools (AWS Secrets Manager, Azure Key Vault, etc.)
- Add sensitive files to `.gitignore`

### 4. Code Review

- Include security review in your PR process
- Have another team member review security-sensitive changes
- Use the security workflow results as part of the review

### 5. Stay Informed

- Subscribe to security advisories for your dependencies
- Follow security best practices for your frameworks
- Keep your development tools updated

## Additional Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Husky documentation](https://typicode.github.io/husky/)
- [GitHub Actions security](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Support

If you encounter issues or have questions:

1. Check this documentation
2. Review the `SECURITY_AUDIT_RESULTS.md` file
3. Check the GitHub Actions logs
4. Contact the security team

## Contributing

To improve the security setup:

1. Test your changes locally
2. Update this documentation
3. Submit a PR with a clear description
4. Ensure all security checks pass