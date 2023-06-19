import { AppModule } from "./app.module.ts";
import { logger } from "./tools/log.ts";
import { NestFactory } from "oak_nest";
import globals from "./globals.ts";

const app = await NestFactory.create(AppModule);

app.setGlobalPrefix(globals.apiPrefix);

app.use(app.routes());

app.get(globals.healthz, (ctx) => {
  ctx.response.status = 204;
});

const port = Number(Deno.env.get("PORT") || globals.port);

logger.info(
  `app start with version ${globals.version}: http://localhost:${port}`,
);

app.addEventListener("error", (evt) => {
  logger.error("uncaught app error", evt.error);
});

addEventListener("unhandledrejection", (evt) => {
  evt.preventDefault();
  logger.error(`unhandledrejection`, evt.reason);
});

addEventListener("error", (evt) => {
  evt.preventDefault(); // 这句很重要
  logger.error(`global error`, evt.error);
});

await app.listen({ port });
