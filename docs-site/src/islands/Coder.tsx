import { useEffect, useState } from "preact/compat";
import { codeToHtml } from "shiki";
import { useStore } from "@nanostores/preact";
import { currentThemeAtom } from "../theme-atom";

export default function Coder({ code }: { code: string }) {
  const [html, setHtml] = useState("");
  const $currentTheme = useStore(currentThemeAtom);

  useEffect(() => {
    codeToHtml(code, {
      lang: "javascript",
      theme: $currentTheme,
    }).then((html) => setHtml(html));
  }, [code]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
