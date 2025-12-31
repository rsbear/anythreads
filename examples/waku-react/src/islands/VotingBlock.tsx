"use client";

import { Votes } from "@anythreads/react/server";
import { IconDownArrow, IconUpArrow } from "../components/icons";

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
