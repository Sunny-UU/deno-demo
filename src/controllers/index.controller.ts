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
  @Get("/")
  version() {
    return `<html><h2>哈哈哈哈哈</h2></html>`;
  }

  // {
  //   name: "test",
  //   password: "123456",
  //   sign: "你是谁",
  // }
}
