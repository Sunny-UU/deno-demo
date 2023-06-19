import { Prop } from "@/decorators/schema.ts";
import { IsString, Min } from "deno_class_validator";

export class User {
  @Prop()
  @IsString()
  @Min(0)
  name: string;

  @Prop()
  @IsString()
  @Min(0)
  password: string;

  @Prop()
  @IsString()
  @Min(0)
  sign: string;
}
