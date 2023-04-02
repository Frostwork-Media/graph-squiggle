## Getting Setup

Pre-requisites:

- [node](https://nodejs.org/) (Probably already installed!)
- [pnpm](https://pnpm.io/)

Install dependencies:

```
pnpm install
```

## Repository Structure

- `api/` - Functions to be run on the server
- `src/` - Frontend code
- `public/` - Static assets

## Development

Start the development server:

```
pnpm vercel dev
```

## Major Building Blocks

### Squiggle -> Graph

Converting the squiggle code into nodes and edges. This is done in `src/lib/squiggleToGraph.ts`.
