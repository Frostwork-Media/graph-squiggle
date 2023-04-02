// Fishing for unexported types from squiggle parser

import { nodeLetStatement } from "@quri/squiggle-lang/dist/src/ast/peggyHelpers";

export type NodeLetStatement = ReturnType<typeof nodeLetStatement>;
