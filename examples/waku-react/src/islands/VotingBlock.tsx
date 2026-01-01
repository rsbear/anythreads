"use client";

import { Vote } from "@anythreads/react";
import { IconDownArrow, IconUpArrow } from "../components/icons";

// Render props pattern
export function UpvoteBtn() {
  return (
    <Vote.UpvoteButton>
      {(state) => (
        <span style={{ color: state.isUpvoted ? "orange" : "gray" }}>
          <IconUpArrow />
        </span>
      )}
    </Vote.UpvoteButton>
  );
}

export function Total() {
  return (
    <Vote.Total>
      {(state) => (
        <span className={state.isPending ? "pending" : ""}>
          {state.total} {state.isPending && "..."}
        </span>
      )}
    </Vote.Total>
  );
}

export function DownvoteBtn() {
  return (
    <Vote.DownvoteButton>
      {(state) => (
        <span style={{ color: state.isDownvoted ? "orange" : "gray" }}>
          <IconDownArrow />
        </span>
      )}
    </Vote.DownvoteButton>
  );
}

// Hook-based pattern
export function UpvoteBtnHook() {
  const state = Vote.useVoteState();
  const handleUpvote = Vote.useUpvote();

  return (
    <button type="button" onClick={handleUpvote}>
      <span style={{ color: state.isUpvoted ? "orange" : "gray" }}>
        <IconUpArrow />
      </span>
    </button>
  );
}

export function TotalHook() {
  const state = Vote.useVoteState();

  return (
    <span className={state.isPending ? "pending" : ""}>
      {state.total} {state.isPending && "..."}
    </span>
  );
}

export function DownvoteBtnHook() {
  const state = Vote.useVoteState();
  const handleDownvote = Vote.useDownvote();

  return (
    <button type="button" onClick={handleDownvote}>
      <span style={{ color: state.isDownvoted ? "orange" : "gray" }}>
        <IconDownArrow />
      </span>
    </button>
  );
}
