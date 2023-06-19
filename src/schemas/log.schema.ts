import { BaseSchema, Prop, Schema } from "deno_mongo_schema";

export enum LogAction {
  create = "create",
  exception = "exception", // 有异常需要关注
}

export enum LogType {
  draft = "draft",
  timeout = "timeout",
}

export enum LogLevel {
  warn = "warn",
  error = "error",
  info = "info",
  debug = "debug",
}

@Schema()
export class Log extends BaseSchema {
  @Prop()
  msg: string;

  @Prop()
  params?: string;

  @Prop()
  result?: string;

  @Prop({
    required: true,
  })
  action: LogAction;

  @Prop({
    required: true,
  })
  userId: string;

  @Prop({
    required: true,
  })
  type: LogType;

  @Prop({
    default: LogLevel.info,
  })
  level?: LogLevel;

  @Prop()
  linkId?: string; // 链接
}
