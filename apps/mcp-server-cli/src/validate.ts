import { z } from "zod";

export function validate<T>(schema: z.ZodTypeAny, input: unknown): T {
  const res = schema.safeParse(input);
  if (!res.success) {
    const issues = res.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    const err = new Error(`Invalid input: ${issues}`);
    (err as any).code = "INVALID_INPUT";
    throw err;
  }
  return res.data as T;
}
