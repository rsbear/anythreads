import * as React from "preact/compat";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

import { useStore } from "@nanostores/preact";
import { currentThemeAtom } from "../theme-atom";
import { twMerge } from "tailwind-merge";

const light_themes = [
  {
    id: 1,
    name: "Rose Pine Dawn",
    value: "rose-pine-dawn",
  },
];

const dark_themes = [
  {
    id: 100,
    name: "Rose Pine",
    value: "rose-pine",
  },
  {
    id: 101,
    name: "Vesper",
    value: "vesper",
  },
];

export default function ThemeDropdown() {
  const $currentTheme = useStore(currentThemeAtom);

  const selectTheme = (value: string) => {
    window.localStorage.setItem("theme", value);
    currentThemeAtom.set(value);
  };

  React.useEffect(() => {
    const theme = window.localStorage.getItem("theme");
    if (theme) {
      currentThemeAtom.set(theme);
    }
  }, []);

  return (
    <div className={twMerge($currentTheme, "bg-backg")}>
      <Menu>
        <MenuButton class="text-xs rounded-md border border-txt/20 px-2 flex items-center">
          <span class="py-1 pr-2">{$currentTheme}</span>
          <span class="pl-2 py-1 border-l border-txt/20">
            <IconColorPalette />
          </span>
        </MenuButton>
        <MenuItems
          anchor="top end"
          className="rounded-sm shadow-brutal active:outline-none focus:outline-none"
        >
          <div className={twMerge("p-6 bg-white rounded-sm")}>
            <p class="monospace text-xs uppercase pb-1">Dark</p>
            {dark_themes.map((x) => (
              <MenuItem>
                <button
                  type="button"
                  class="text-xs py-1 flex items-center gap-2 cursor-pointer"
                  onClick={() => selectTheme(x.value)}
                >
                  <span>{x.name}</span>
                  {$currentTheme === x.value && <span class="text-txt/60">✓</span>}
                </button>
              </MenuItem>
            ))}
            <hr className="h-px bg-txt opacity-10 my-4" />
            <p class="monospace text-xs uppercase pb-1">Light</p>
            {light_themes.map((x) => (
              <MenuItem>
                <button
                  type="button"
                  class="text-xs py-1 flex items-center gap-2 cursor-pointer"
                  onClick={() => selectTheme(x.value)}
                >
                  <span>{x.name}</span>
                  {$currentTheme === x.value && <span class="text-txt/60">✓</span>}
                </button>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
}

function IconColorPalette() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M10.847 21.934C5.867 21.362 2 17.133 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.157-3.283 4.733-6.086 4.37c-1.618-.209-3.075-.397-3.652.518c-.395.626.032 1.406.555 1.929a1.673 1.673 0 0 1 0 2.366c-.523.523-1.235.836-1.97.751"
        opacity={0.5}
      ></path>
      <path
        fill="currentColor"
        d="M11.085 7a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M6.5 13a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m11 0a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m-3-4.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3"
      ></path>
    </svg>
  );
}
