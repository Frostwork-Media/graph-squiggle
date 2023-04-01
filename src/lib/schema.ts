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
    squiggle: z
      .string({
        description: "The squiggle code for this document",
      })
      .min(1),
    context: contextSchema,
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;

// This is a blank project file

export const blankProject: Project = {
  squiggle: "",
  context: {},
};
