# AnyThreads

AnyThreads is a suite of APIs for easily integrating threads into your application. Suitable for comments, votes, and reviews.

### Repo structure
- `docs-site` - documentation site built using astro and mdx
- `examples/*` - examples of integrations
  - `/hono-api-ts` - example of dropping anythreads handler into a Hono app
  - `/vite-react` - example of using the react library with vite
  - `/waku-react` - example of using the react library in a server-side waku app
- `pkgs/*` - packages
  - `/api-ts` - server-side library for the API
  - `/react` - React library for the API containing client and server side components

## Usage

check out the root package.json

## Notes
this project is early stages, and the monorepo aspect isn't using pnpm workspaces or turbo because, we this is just.. more simple. I'm sure at some point it'll be moved towards workspaces.
