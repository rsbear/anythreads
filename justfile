
link_api:
  cd api-ts && bun link

install_deps_react_lib: link_api
  cd react && bun install

install_deps_example_hono:
  cd examples/api-ts-hono && bun install

install_deps_example_vite_react:
  cd examples/vite-react && bun install

install_deps_all: link_api install_deps_react_lib install_deps_example_hono install_deps_example_vite_react

run_example_hono:
  cd examples/api-ts-hono && bun dev

run_hono_vite_react: link_api 
  #!/usr/bin/env bash
  cd examples/api-ts-hono && bun dev &
  cd examples/vite-react && bun dev &
  wait
