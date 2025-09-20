# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Status

This is an early-stage project for "Bharat Breed Rakshask". The repository currently contains minimal structure with only documentation files, suggesting the main development is yet to begin.

## Current Structure

The project currently consists of:
- `README.md` - Basic project overview (placeholder content)
- `.gitignore` - Comprehensive ignore rules suggesting a Node.js/web project
- Git repository with initial commit

## Anticipated Development Stack

Based on the .gitignore configuration, this project is likely to become a Node.js/JavaScript-based application with:
- Build outputs in `dist/` or `build/` directories
- Node.js dependencies in `node_modules/`
- Environment configuration via `.env` files
- Minified assets (`.min.js`, `.min.css`)

## Development Commands

Since the project structure is not yet established, common commands will need to be determined once the tech stack is implemented. Typical commands for a Node.js project would include:

```bash
# Install dependencies (once package.json is created)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run linting
npm run lint
```

## Git Workflow

```bash
# View project history
git log --oneline

# Check current status
git status

# View recent changes
git --no-pager diff HEAD~1
```

## Project Architecture

The architecture is not yet defined. Once development begins, this section should be updated to include:
- Main application structure
- Key directories and their purposes
- Entry points and core modules
- Data flow and component relationships

## Notes for Future Development

- The project name "Bharat Breed Rakshask" suggests this may be related to Indian dog breeds or animal welfare
- Consider adding proper project initialization with package.json, build tools, and framework setup
- Update this WARP.md file as the project structure evolves
- Add specific build, test, and deployment commands once they are established