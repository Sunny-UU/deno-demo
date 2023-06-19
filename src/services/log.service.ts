// deno-lint-ignore-file no-explicit-any
import { Log } from "../schemas/log.schema.ts";
import { CreateLogDto } from "../dtos/log.dto.ts";
import { Injectable } from "oak_nest";
import { stringify } from "utils";
import { Filter, InjectModel, Model } from "deno_mongo_schema";
import { Logger } from "@/tools/log.ts";

@Injectable()
export class LogService {
  constructor(
    @InjectModel(Log) private model: Model<Log>,
    private readonly logger: Logger,
  ) {
  }

  async create(dto: CreateLogDto) {
    try {
      if (dto.params && typeof dto.params !== "string") {
        dto.params = JSON.stringify(dto.params);
      }
      if (dto.result && typeof dto.result !== "string") {
        dto.result = JSON.stringify(dto.result);
      }
      if (dto.linkId) {
        dto.linkId = dto.linkId.toString();
      }
      const id = await this.model.insertOne(dto);
      this.logger.debug(`${stringify(dto)}`);
      return id.toString();
    } catch (e) {
      this.logger.error(`${stringify(dto)} cause error`, e);
    }
  }

  count(query: Filter<Log>) {
    return this.model.countDocuments(query);
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }

  deleteByQuery(query: any) {
    return this.model.deleteMany(query);
  }

  findById(id: string) {
    return this.model.findById(id);
  }
}
