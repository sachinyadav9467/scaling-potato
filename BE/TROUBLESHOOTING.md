# Troubleshooting Guide

## Prisma Command Not Found

If you see `prisma: command not found`, you have a few options:

### Option 1: Use npx (Recommended)
The package.json scripts have been updated to use `npx prisma` instead of `prisma`. This will work even if Prisma isn't globally installed.

```bash
npm run db:generate
npm run db:push
```

### Option 2: Install Dependencies Locally
If you're having npm permission issues, try:

1. **Check if node_modules exists:**
   ```bash
   ls -la node_modules
   ```

2. **If node_modules doesn't exist, install dependencies:**
   ```bash
   npm install
   ```

3. **If npm install fails with permission errors**, try:
   ```bash
   # Use npx to run prisma directly
   npx prisma generate
   npx prisma db push
   ```

### Option 3: Fix npm Permissions (System-level issue)

If you're getting `EPERM` errors with npm, this is a system-level issue. Try:

1. **Use a Node version manager (recommended):**
   ```bash
   # Install nvm (Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Then install Node.js
   nvm install node
   nvm use node
   ```

2. **Or fix npm permissions:**
   ```bash
   # Create a directory for global packages
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   
   # Add to your ~/.zshrc or ~/.bash_profile
   export PATH=~/.npm-global/bin:$PATH
   ```

### Option 4: Use Docker (Alternative)

If npm issues persist, you can use Docker:

```bash
# Run Prisma commands in a Docker container
docker run --rm -v $(pwd):/app -w /app node:18 npx prisma generate
docker run --rm -v $(pwd):/app -w /app node:18 npx prisma db push
```

## Quick Fix for Current Issue

Since the scripts are already updated to use `npx`, you can run:

```bash
cd BE
npm run db:generate
npm run db:push
```

This should work even without installing dependencies first, as `npx` will download Prisma on-demand.

## Verify Installation

After running the commands, verify Prisma is working:

```bash
npx prisma --version
```

You should see the Prisma version number.
