declare module "@hookform/resolvers/zod" {
  import { Resolver } from "react-hook-form";
  import { z } from "zod";

  export function zodResolver<TFieldValues extends Record<string, any> = Record<string, any>>(
    schema: z.ZodSchema<TFieldValues> | z.ZodTypeDef | any,
    schemaOptions?: any,
    factoryOptions?: any
  ): Resolver<TFieldValues>;
}
