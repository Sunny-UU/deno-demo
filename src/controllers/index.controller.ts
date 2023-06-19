import { Controller, Get, Inject } from "oak_nest";
import { REDIS_KEY } from "oak_nest/modules/redis/mod.ts";
import type { Redis } from "oak_nest/modules/redis/mod.ts";
import { IndexService } from "../services/index.service.ts";

@Controller("")
export class IndexController {
  constructor(
    private readonly indexService: IndexService,
    @Inject(REDIS_KEY) private readonly redis: Redis,
  ) {}

  @Get("/insertMongo")
  async insertMongo() {
    await this.indexService.insert({
      name: "test",
      password: "123456",
      sign: "你是谁",
    });
    return "ok";
  }

  @Get("/insertRedis")
  async insertRedis() {
    await this.redis.set("test", "test");
    const isExists = await this.redis.exists("test");
    return isExists;
  }

  @Get("/getEs")
  async insertES() {
    // http://10.100.55.4:8004 直接get请求就可以
    const res = await fetch("http://10.100.55.4:8004/twitter/_doc/1");
    const text = await res.text();
    return JSON.parse(text);
  }
}
