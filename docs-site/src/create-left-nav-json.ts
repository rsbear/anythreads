/**
 * usage in a .astro file:
 *
 * ---
 * import { createLeftNavJson } from './create-left-nav-json.ts';
 *
 * const navLinks = createLeftNavJson(markdowns);
 * ---
 */

export const createLeftNavJson = (markdowns: any) => {
  const parentOrder = [
    "Hello",
    "Instance",
    "Data Functions",
    "Web APIs",
    "React",
    "Stuff",
  ];

  const grouped = markdowns.reduce((acc, item) => {
    const parent = item.frontmatter.parent;

    if (!acc[parent]) {
      acc[parent] = {
        parent: parent,
        docs: [],
      };
    }

    acc[parent].docs.push(item.frontmatter);

    return acc;
  }, {});

  const navLinks = parentOrder
    .filter((parent) => grouped[parent])
    .map((parent) => grouped[parent]);

  return navLinks;
};
