import { readYaml } from "./tools/utils.ts";
import { Config, Scripts } from "./type.ts";
import { parse } from "jsonc";

const originConfig: Config = await readYaml<Config>("config/server.yaml");
if (!originConfig) {
  console.error("not read config/server.yaml");
  Deno.exit(1);
}

async function getVersion(): Promise<string> {
  const text = await Deno.readTextFile("deno.jsonc");
  const json: Scripts = parse(text);
  return json.version;
}

originConfig.version = await getVersion();

const defaultTagConfig = {
  maxTagLength: 30,
  minTagLength: 1,
  tagReg: /^[\u4E00-\u9FA5\w\s-]+$/,
  tagRegErrMsg: "标签只允许中文、英文、数字、空格、_和-",
};

const defaultShowIdConfig = {
  reg: /(^[A-Za-z0-9]+[\w-]*$)|(^$)/,
  regErrMsg: "showId只允许英文、数字、_和-，且不能以_或-开头",
  maxLength: 50,
  mongoSameIdErrMsg: "showId不能设置mongo一样类型的id",
};

const defaultTokenConfig = {
  authorizationPre: "Wiki ",
  userAgentEnd: "(Internal App)",
  regUserAgent: /^\w{2,50}$/,
  regUserAgentErrMsg: "user-agent只支持英文、数字和_，且长度位于2到50",
};

const defaultNotificationConfig = {
  maxTitleLength: 100,
  maxContentLength: 1000,
};

const defaultConfig: Partial<Config> = {
  healthz: "/healthz",
  body: {
    limit: "50mb",
  },
  esBackupDays: 3,
  tag: defaultTagConfig,
  showId: defaultShowIdConfig,
  draft: {
    backupDays: 90,
    backupNoBlogDays: 30,
    backupCount: 20,
  },
  token: defaultTokenConfig,
  group: {
    fine: "fine", // 加精
    transUser: "transUser", // 转移作者
    integral: "integral", // 积分
    top: "top", // 置顶
    publishToOfficial: "official", // 发布到官网
    public: "public", // 开放文档
    share: "share",
    token: "token",
    checkPublic: "checkPublic", //审核组
  },
  shareToken: "Bearer 85e47ac07ac9d6416168a97e33fa969a",
  blog: {
    contentMaxLength: 500000, // 10万个字符
    contentHtmlMaxLength: 500000, // 20万个字符
  },
  notification: defaultNotificationConfig,
  // session : {
  //   "secret": "wiki",
  //   "key": "wiki",
  //   "maxAge": 10000
  // }
};

const config = Object.assign({}, defaultConfig, originConfig);

if (originConfig.tag?.tagReg) {
  config.tag.tagReg = new RegExp(originConfig.tag.tagReg);
}

if (originConfig.showId?.reg) {
  config.showId.reg = new RegExp(originConfig.showId.reg);
}

if (originConfig.token?.regUserAgent) {
  config.token.regUserAgent = new RegExp(originConfig.token.regUserAgent);
}

export default config;

//森学院链接
export const supportLink = "support.thingjs.com";
