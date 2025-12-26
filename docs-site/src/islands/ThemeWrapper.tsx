import { useEffect } from "preact/compat";
import { twMerge } from "tailwind-merge";
import { useStore } from '@nanostores/preact';
import { currentThemeAtom } from "../theme-atom";

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const $currentTheme = useStore(currentThemeAtom);

  useEffect(() => {
    const theme = window.localStorage.getItem("theme");
    if (theme) {
      currentThemeAtom.set(theme);
    }
  }, [window.localStorage.getItem("theme")])

  return (
    <div className={twMerge($currentTheme, "bg-backg text-txt min-h-screen")}>
      {children}
    </div>
  )
}
