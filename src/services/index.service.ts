// deno-lint-ignore-file no-explicit-any require-await
import { InjectModel, Model } from "deno_mongo_schema";
import { Injectable } from "oak_nest";
import { DemoDemo } from "../schemas/index.schema.ts";

@Injectable()
export class IndexService {
  constructor(
    @InjectModel(DemoDemo) private model: Model<DemoDemo>,
  ) {}

  async insert(obj: any) {
    await this.model.insertOne(obj);
    return "插入成功";
  }
}
