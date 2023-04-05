// Fishing for unexported types from squiggle parser

import { nodeLetStatement } from "@quri/squiggle-lang/dist/src/ast/peggyHelpers";

export type NodeLetStatement = ReturnType<typeof nodeLetStatement>;

// Manifold Response Types

export interface ManifoldResponse {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorName: string;
  createdTime: number;
  creatorAvatarUrl: string;
  closeTime: number;
  question: string;
  tags: string[];
  url: string;
  pool: Pool;
  probability: number;
  p: number;
  totalLiquidity: number;
  outcomeType: string;
  mechanism: string;
  volume: number;
  volume24Hours: number;
  isResolved: boolean;
  lastUpdatedTime: number;
  description: string;
  textDescription: string;
}

export interface Pool {
  NO: number;
  YES: number;
}
