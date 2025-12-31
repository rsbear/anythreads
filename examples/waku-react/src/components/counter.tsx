"use client";

import { createUpVote } from "@anythreads/react/server";
import { useState } from "react";

export const Counter = () => {
  const [count, setCount] = useState(0);

  const handleIncrement = () => setCount((c) => c + 1);

  return (
    <button
      onClick={createUpVote}
      className="rounded-xs bg-black px-2 py-0.5 text-sm text-white"
    >
      Increment
    </button>
  );
};
