// deno-lint-ignore-file no-explicit-any
import { Context, Factory, Next } from "oak_nest";
import globals from "./globals.ts";
import { logger } from "./tools/log.ts";
import { LogAction, LogLevel, LogType } from "./schemas/log.schema.ts";
import { LogService } from "./services/log.service.ts";

export async function LogMiddleware(ctx: Context, next: Next) {
  const start = Date.now();
  const msg = `${ctx.request.method} ${ctx.request.url}`;
  logger.info(LogMiddleware.name, msg);
  const logService = await Factory(LogService);
  await next();
  const ms = Date.now() - start;
  if (ms >= 1000) { // 超时1s
    logger.warn(
      LogMiddleware.name,
      `超时${ctx.request.method} ${ctx.request.url} - ${ms}ms`,
    );
    const userInfo = (ctx.request as any).userInfo;
    logService.create({
      msg: `超时${ms / 1000}s`,
      params: {
        method: ctx.request.method,
        url: ctx.request.url,
        ms,
      },
      action: LogAction.exception,
      type: LogType.timeout,
      userId: userInfo?.id ?? globals.adminUserId,
      level: LogLevel.warn,
    });
  }
}
