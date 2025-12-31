"use client";

import { Votes } from "@anythreads/react/server";
import { IconDownArrow, IconUpArrow } from "../components/icons";

// Render props pattern
export function UpvoteBtn() {
  return (
    <Votes.UpvoteButton>
      {(state) => (
        <span style={{ color: state.isUpvoted ? "orange" : "gray" }}>
          <IconUpArrow />
        </span>
      )}
    </Votes.UpvoteButton>
  );
}

export function Total() {
  return (
    <Votes.Total>
      {(state) => (
        <span className={state.isPending ? "pending" : ""}>
          {state.total} {state.isPending && "..."}
        </span>
      )}
    </Votes.Total>
  );
}

export function DownvoteBtn() {
  return (
    <Votes.DownvoteButton>
      {(state) => (
        <span style={{ color: state.isDownvoted ? "orange" : "gray" }}>
          <IconDownArrow />
        </span>
      )}
    </Votes.DownvoteButton>
  );
}

// Hook-based pattern
export function UpvoteBtnHook() {
  const state = Votes.useVoteState();
  const handleUpvote = Votes.useUpvote();

  return (
    <button type="button" onClick={handleUpvote}>
      <span style={{ color: state.isUpvoted ? "orange" : "gray" }}>
        <IconUpArrow />
      </span>
    </button>
  );
}

export function TotalHook() {
  const state = Votes.useVoteState();

  return (
    <span className={state.isPending ? "pending" : ""}>
      {state.total} {state.isPending && "..."}
    </span>
  );
}

export function DownvoteBtnHook() {
  const state = Votes.useVoteState();
  const handleDownvote = Votes.useDownvote();

  return (
    <button type="button" onClick={handleDownvote}>
      <span style={{ color: state.isDownvoted ? "orange" : "gray" }}>
        <IconDownArrow />
      </span>
    </button>
  );
}
