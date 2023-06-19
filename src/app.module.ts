import { Module } from "oak_nest";
import { MongoFactory } from "deno_mongo_schema";
import globals from "./globals.ts";
import { RedisModule } from "oak_nest/modules/redis/mod.ts";
import { ScheduleModule } from "oak_nest/modules/scheduler/mod.ts";
import { CacheModule } from "oak_nest/modules/cache/mod.ts";
import { IndexController } from "./controllers/index.controller.ts";
import { ScheduleService } from "./services/schedule.service.ts";

const redis = globals.redis;

@Module({
  imports: [
    MongoFactory.forRoot(globals.db),
    RedisModule.forRoot({
      hostname: redis.host,
      port: redis.port,
      password: redis.password,
      db: redis.db,
    }),
    CacheModule.register({
      ttl: 60,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    IndexController,
  ],
  providers: [ScheduleService],
})
export class AppModule {}
