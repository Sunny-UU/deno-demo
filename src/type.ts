// deno-lint-ignore-file no-explicit-any
// 添加interface或type
export interface RedisConfig {
  port: number;
  host: string;
  password: string;
  db: number;
  retryInterval?: number;
  maxRetryCount?: number;
}

export interface Config {
  version: string;
  port: number;
  apiPrefix: string;
  healthz: string;
  authApi: string;
  corsOrigin: string;
  adminUserId: string;
  adminGroupName: string;
  ssoApi: string;
  ssoAllowAllUsers: boolean; // 是否允许外部人员通过sso
  redis: RedisConfig;
  searchApi: string; // 搜索服务
  kafka: {
    clientId: string;
    brokers: string[];
    emailTopic: string;
    docsTopic: string; // 文档中心主题
    msgTopic: string;
    groupId: string;
  };
  isAutoSyncEsFromMongoWhenStart: boolean; //是否启动时自动刷新monogo数据到es
  isAutoSendExpiredEnterpriseWechatShare: boolean; // 是否轮询发送消息到企业微信
  esBackupDays: number; // es表备份保留的天数
  shareApi: string;
  shareToken: string;
  tag: {
    maxTagLength: number; // tag标签允许最大长度，不管中英文都以字符串长度为准
    minTagLength: number;
    tagReg: RegExp;
    tagRegErrMsg: string;
  };
  showId: {
    reg: RegExp;
    regErrMsg: string;
    maxLength: number;
    mongoSameIdErrMsg: string;
  };
  token: {
    authorizationPre: string;
    regUserAgent: RegExp;
    regUserAgentErrMsg: string;
    userAgentEnd: string;
  };
  body: {
    limit: string;
  };
  db: string;
  log: any;

  draft: {
    backupDays: number;
    backupNoBlogDays: number;
    backupCount: number; // 允许每篇文章备份的数量
  };
  group: {
    fine: string; // 加精
    transUser: string; // 转移作者
    integral: string; // 积分
    top: string; // 置顶
    share: string; // 分享
    token: string; // 可将权限下放
    publishToOfficial: string;
    public: string; // 开放文档
    checkPublic: string; //审核公开
  };
  mingdao: {
    url: string;
    sendWeeklyUrl: string;
  };
  blog: {
    contentMaxLength: number;
    contentHtmlMaxLength: number;
  };
  notification: {
    maxTitleLength: number;
    maxContentLength: number;
  };
  aliYunCheck: {
    accessKeyId: string;
    accessKeySecret: string;
    host: string;
    greenVersion: string;
  };
}

export type Scripts = {
  version: string;
};
