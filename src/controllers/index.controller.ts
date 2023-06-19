import { Body, Controller, Get, Inject, Post, Query } from "oak_nest";
import { REDIS_KEY } from "oak_nest/modules/redis/mod.ts";
import type { Redis } from "oak_nest/modules/redis/mod.ts";
import { IndexService } from "../services/index.service.ts";
import { User } from "../dtos/index.dto.ts";

@Controller("")
export class IndexController {
  constructor(
    private readonly indexService: IndexService,
    @Inject(REDIS_KEY) private readonly redis: Redis,
  ) {}

  @Post("/insertMongo")
  async insertMongo(@Body() params: User) {
    await this.indexService.insert(params);
    return "ok";
  }

  @Get("/insertRedis")
  async insertRedis() {
    const isExists = await this.redis.exists("test");
    // throw new Error("insertRedis error"); // 新增这句
    setTimeout(() => {
      throw new Error("insertRedis error");
    }, 0);
    if (!isExists) {
      await this.redis.set("test", "test");
    }
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
