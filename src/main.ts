import { AppModule } from "./app.module.ts";
import { logger } from "./tools/log.ts";
import { NestFactory } from "oak_nest";
import globals from "./globals.ts";
import { anyExceptionFilter } from "oak_exception";
import { isDebug } from "utils";

const app = await NestFactory.create(AppModule);

app.setGlobalPrefix(globals.apiPrefix);

// must before router 全局异常捕获 必须在路由前面 防止控制层代码也出错
// 程序崩溃
app.use(anyExceptionFilter({
  logger,
  isHeaderResponseTime: true,
  isDisableFormat404: true,
  isIngoreLog401: true,
  isLogCompleteError: isDebug(),
  filter: (ctx) => ctx.request.url.pathname === globals.healthz,
}));

app.use(app.routes());

app.get(globals.healthz, (ctx) => {
  ctx.response.status = 204;
});

const port = Number(Deno.env.get("PORT") || globals.port);

logger.info(
  `app start with version ${globals.version}: http://localhost:${port}`,
);

//捕获未处理promise异常
addEventListener("unhandledrejection", (evt) => {
  evt.preventDefault();
  logger.error(`unhandledrejection`, evt.reason);
});
//捕获之前没有捕获到的错误（但是捕获不到未处理promise异常）
addEventListener("error", (evt) => {
  evt.preventDefault(); // 这句很重要
  logger.error(`global error`, evt.error);
});

app.addEventListener("error", (evt) => {
  logger.error("uncaught app error", evt.error);
});

await app.listen({ port });
