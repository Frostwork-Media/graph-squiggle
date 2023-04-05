import * as z from "zod";

// This is the schema for the project file

const variableSchema = z
  .object({
    description: z.string(),
    location: z.number(),
    market: z.string(),
  })
  .strict();

export type Variable = z.infer<typeof variableSchema>;

const contextSchema = z.record(variableSchema);

export type Context = z.infer<typeof contextSchema>;

export const projectSchema = z
  .object({
    squiggle: z.string(),
    context: contextSchema,
    subject: z.string(),
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;

// This is a blank project file

export const getEmptyProject: () => Project = () => ({
  squiggle: "",
  context: {},
  subject: "",
});
