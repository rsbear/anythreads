import { useState, useEffect } from "preact/compat";

export default function Breadcrumby() {
  const [ur, setUr] = useState<string[]>([]);

  useEffect(() => {
    const path = window.location.pathname.split("/");
    console.log("path", path);
    // @ts-ignore
    setUr([path[2], path[3]]);
  }, [])

  return (
    <div class="flex items-center gap-2 text-sm">
      <a href="/md" class="text-txt hover:text-primary">~</a>
      <span class="text-txt/40">/</span>
      <span class="text-txt">{ur[0]}</span>
      <span class="text-txt/40">/</span>
      <span class="text-txt">{ur[1]}</span>
    </div>
  )
}
