## Getting Setup

Pre-requisites:

- [node](https://nodejs.org/) (Probably already installed!)
- [pnpm](https://pnpm.io/)

Install dependencies:

```
pnpm add -g vercel turbo
pnpm install
```

## Repository Structure

- `api/` - Functions to be run on the server
- `src/` - Frontend code
- `public/` - Static assets

## Development

Pull dependencies:

```
pnpm env:pull
```

Start the development server:

```
vercel dev
```

## Major Building Blocks

### Squiggle -> Graph

Converting the squiggle code into nodes and edges. This is done in `src/lib/squiggleToGraph.ts`.

## Database

Hosted on https://railway.app

To update the schema change `/prisma/schema.prisma` then run:

```
pnpm prisma migrate dev --name your-migration
```

To generate the client run `pnpm -F db generate`.
