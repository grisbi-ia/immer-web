# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Check project for errors
- `npm run check:watch` - Watch for errors while developing

## Code Style Guidelines
- **TypeScript**: Use proper TypeScript types for all variables and functions
- **Store Pattern**: Use Svelte's store pattern with `writable` and `derived` stores
- **API Calls**: Use the API utilities in `src/routes/api/api.ts`
- **Error Handling**: Use try/catch for async operations with appropriate error messages
- **Naming**: Use camelCase for variables and functions, PascalCase for components and interfaces
- **Imports**: Order imports by external modules first, then internal modules
- **Comments**: Minimal comments, only for complex logic when necessary
- **Formatting**: No trailing whitespace, consistent indentation with spaces

## File Organization
- API endpoints in `src/routes/api/`
- Components in `src/lib/components/`
- Store-related code in `src/lib/stores/`
- Utility functions in `src/lib/util/`