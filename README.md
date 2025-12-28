# AnyThreads

AnyThreads is a suite of APIs for easily integrating threads into your application. Suitable for comments, votes, and reviews.

## Documentation
Docs live here:
- `/docs-site/pages/md/*`

## Libraries

### api-ts
This is a server-side library for the AnyThreads API.

### react
This is a React library for the AnyThreads API.
- client side components
- server side components (TODO)

### examples
- hono - add anythreads handler to a Hono app, get a rest api
- vite-react - connects to hono example, does client side rendering and displays component composition

## Usage

check out the `justfile`

## Notes
this project is early stages, and the monorepo aspect isn't using pnpm workspaces or turbo because, we this is just.. more simple. I'm sure at some point it'll be moved towards workspaces.
