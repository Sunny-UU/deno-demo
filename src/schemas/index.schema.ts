import { BaseSchema, Prop, Schema, SchemaFactory } from "deno_mongo_schema";

@Schema()
export class DemoDemo extends BaseSchema {
  @Prop({})
  name: string;

  @Prop()
  password: string;

  @Prop({})
  sign: string;
}

export const BlogSchema = SchemaFactory.createForClass(DemoDemo);
