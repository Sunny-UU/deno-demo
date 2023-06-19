// deno-lint-ignore-file no-explicit-any
import { LogAction, LogLevel, LogType } from "../schemas/log.schema.ts";
import { IsEnum, IsOptional, IsString } from "deno_class_validator";

export class CreateLogDto {
  @IsString()
  msg: string;

  @IsString()
  linkId?: string; // 如果是修改或删除，记录原id

  @IsEnum(LogAction)
  action: LogAction;

  userId: string;

  @IsEnum(LogType)
  type: LogType;

  @IsEnum(LogLevel)
  @IsOptional()
  level?: LogLevel;

  params?: any;

  result?: any;
}
