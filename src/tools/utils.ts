// deno-lint-ignore-file no-explicit-any
import * as posix from "std/path/posix.ts";
import { Cache, nanoid } from "utils";
import { BadRequestException } from "oak_exception";
import { parse as parseYaml } from "std/yaml/mod.ts";
import { Constructor, ObjectId } from "deno_mongo_schema";
import * as _ from "lodash";
import dayjs from "dayjs";
import { weekOfYear } from "dayjs/plugin/weekOfYear.ts";
import { validateOrReject, ValidationError } from "deno_class_validator";

export async function validate(
  Cls: Constructor,
  value: Record<string, any>,
): Promise<string[]> {
  const post = new Cls();
  Object.assign(post, value);
  const msgs: string[] = [];
  try {
    await validateOrReject(post);
  } catch (errors) {
    // console.debug(errors);
    errors.forEach((err: ValidationError) => {
      if (err.constraints) {
        Object.values(err.constraints).forEach((element) => {
          msgs.push(element);
        });
      }
    });
  }
  return msgs;
}

dayjs.extend(weekOfYear);

const yamlPageCache = new Cache(5 * 60 * 1000);

export async function loadYaml<T = unknown>(path: string) {
  const str = await Deno.readTextFile(path);
  return parseYaml(str) as T;
}

export async function readYaml<T>(
  path: string,
): Promise<T> {
  const cache = yamlPageCache.get(path);
  if (cache) {
    console.debug(`read yaml [${path}] from cache`);
    return cache;
  }
  let allPath = path;
  if (!/\.(yaml|yml)$/.test(path)) {
    allPath += ".yaml";
  }
  const data = await loadYaml<T>(allPath);
  yamlPageCache.set(path, data);
  return data;
}

export function domToText(input: string) {
  if (!input) {
    return "";
  }
  return input
    .replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, "")
    .replace(/<[^>]+?>/g, "")
    .replace(/\s+/g, " ")
    .replace(/ /g, " ")
    .replace(/>/g, " ");
}

export function formatUrl(url: string) {
  return posix.join("/", url);
}

export function uniqueArr<T = any>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function deleteUndefinedKeysInObj(obj: any) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}

export function getExpiredTime(expireSeconds: number) {
  const expiredTime = new Date();
  expiredTime.setSeconds(expiredTime.getSeconds(), 1000 * expireSeconds);
  return expiredTime;
}

export function isMongoId(id: unknown) {
  const mongoIdReg = /^[a-fA-F0-9]{24}$/; // 校验是否mongoId
  return typeof id === "string" && mongoIdReg.test(id);
}

export function getIgnoreCaseRegExp(name: string, global?: boolean) {
  return new RegExp(
    ["^", _.escapeRegExp(name), "$"].join(""),
    global ? "ig" : "i",
  );
}

/**
 * 模糊查询正则
 */
export function getVagueIgnoreCaseRegExp(name: string, global?: boolean) {
  return new RegExp(_.escapeRegExp(name), global ? "ig" : "i");
}

export function getHighlightArr(
  str: string,
  search: string,
  maxLength?: number,
) {
  const highlightArr: string[] = [];
  if (!str) {
    return highlightArr;
  }
  const reg = getVagueIgnoreCaseRegExp(search, true);
  const boundary_max_scan = 50;
  const getLeftAndRight = (match: string, index: number, chars: string) => {
    const leftIndex = Math.max(
      str.indexOf(chars, index - boundary_max_scan),
      index - boundary_max_scan,
    );
    const rightRn = str.indexOf(chars, index + match.length);
    const rightIndex = rightRn === -1
      ? (index + boundary_max_scan + match.length)
      : Math.min(
        rightRn,
        index + boundary_max_scan + match.length,
      );
    return [leftIndex, rightIndex];
  };
  str.replaceAll(reg, (match, index) => {
    if (maxLength && highlightArr.length >= maxLength) {
      return match;
    }
    const [leftIndex, rightIndex] = getLeftAndRight(match, index, "\n");
    const temp = str.substring(leftIndex, rightIndex).trim().replace(
      reg,
      `<span class="highlight-text">${match}</span>`,
    );
    highlightArr.push(temp);
    return match;
  });
  return highlightArr;
}

/**
 * 判断有没有特殊字符，有的话返回true
 * @author jw
 * @date 2021-12-03
 */
export function checkSpecialCharacters(str: string) {
  const specialCharacterReg = new RegExp(
    "[`\\\\~!@#$^&*()=|{}':;,\\[\\].<>《》/?！￥…（）—【】‘；：”“。，、？]",
  );
  return specialCharacterReg.test(str);
}

export function createMongoBsonId() {
  return new ObjectId();
}
export function createMongoId() {
  const id = createMongoBsonId();
  return id.toHexString();
}

/**
 * 根据日期，获取这年的周数
 * @param day 格式：2021-11-24
 */
export function getYearAndWeek(day: string | Date) {
  const date: any = dayjs(day);
  return date.year() + "-" + date.week();
}

export enum UrlType {
  book,
  blog,
  link,
  user,
}

export class UrlUtils {
  private static bookUrlReg = /\${bookId}/;
  private static blogUrlReg = /\${blogId}/;
  private static linkUrlReg = /\${linkId}/;
  private static userUrlReg = /\${userId}/;

  static replaceUrl(url: string, param: string, type: UrlType) {
    switch (type) {
      case UrlType.book:
        /**
         * 替换url
         * @example 'https://wiki.uino.com/book/${bookId}/book-cover.html'
         */
        return url.replace(this.bookUrlReg, param);
      case UrlType.blog:
        /**
         * 替换url
         * @example 'https://wiki.uino.com/book/617fb629edb942177938ed64/${blogId}.html'
         */
        return url.replace(this.blogUrlReg, param);
      case UrlType.link:
        return url.replace(this.linkUrlReg, param);
      case UrlType.user:
        /**
         * 替换个人的url
         * @example 'https://wiki.uino.com/personal/${userId}'
         */
        return url.replace(this.userUrlReg, param);
    }
  }

  static isValidUrl(url: string, type: UrlType) {
    switch (type) {
      case UrlType.book:
        return this.bookUrlReg.test(url);
      case UrlType.blog:
        return this.blogUrlReg.test(url);
      case UrlType.link:
        return this.linkUrlReg.test(url);
      case UrlType.user:
        return this.userUrlReg.test(url);
    }
  }
}

/**
 * 获取与今天相邻日期的字符串
 * 如：getDay(-1, '-') 代表昨天
 */
export function getDay(num: number, str: string): string {
  const today = new Date();
  const nowTime = today.getTime();
  const ms = 24 * 3600 * 1000 * num;
  today.setTime(nowTime + ms);
  const oYear = today.getFullYear();
  let oMoth = (today.getMonth() + 1).toString();
  if (oMoth.length <= 1) oMoth = "0" + oMoth;
  let oDay = today.getDate().toString();
  if (oDay.length <= 1) oDay = "0" + oDay;
  return oYear + str + oMoth + str + oDay;
}

export function pickHeaders(headers: Headers, keys: string[]) {
  return keys.reduce((pre, cur) => {
    pre[cur] = headers.get(cur) || "";
    return pre;
  }, {} as any);
}

export function pickObj(obj: any, keys: string[]) {
  return keys.reduce((pre, cur) => {
    pre[cur] = obj[cur];
    return pre;
  }, {} as any);
}

export function checkParamKey(key: string, val: string | number) {
  if (!val) {
    throw new BadRequestException(`[${key}] is required`);
  }
}

/**
 * 获取中英文字符长度，中文算2个字符
 */
export function getWordLength(word: string) {
  let realLength = 0;
  const len = word.length;
  let charCode = -1;
  for (let i = 0; i < len; i++) {
    charCode = word.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) {
      realLength += 1;
    } else {
      realLength += 2;
    }
  }
  return realLength;
}

//解码 % 会报错
export function safeDecodeURIComponent(url: string) {
  try {
    return decodeURIComponent(url);
  } catch (error) {
    console.error("decodeURIComponent", url, error);
    return url;
  }
}

export function isTest() {
  return Deno.env.get("DENO_ENV") === "test";
}

/**
 * 替换有a标签的内容
 * @example see utils_test.ts
 */
export function replaceHref(target: string, old: string, current: string) {
  // const reg = /<a href="[\w_:/\.]*(abcd)[\.\w/]*">.*<\/a>/g;
  // const reg = /<a href="[\\w_:/\\.]*(${old})[\\.\\w/]*">.*</a>/g; 未处理锚点

  const reg = new RegExp(
    `<a href="[\\w_:/\\.]*(${old})(([\\.\\w/]*)|(#.*)|(([\\.\\w/]*)#.*))">.*</a>`,
    "g",
  );
  return target.replaceAll(reg, (match, p1) => {
    if (/http[s]?:\/\//.test(match)) {
      return match;
    }
    return match.replace(p1, current);
  });
}

/**
 * 替换markdown中链接跳转的内容
 * @example see utils_test.ts
 */
export function replaceMarkdownLink(
  target: string,
  old: string,
  current: string,
) {
  // 试下[链接跳转](621f4ab11480ba2654e68e0f)
  const reg = new RegExp(
    `\\[.*\\]*(${old})`,
    "g",
  );
  return target.replaceAll(reg, (match, p1) => {
    if (/http[s]?:\/\//.test(match)) {
      return match;
    }
    return match.replace(p1, current);
  });
}

export function isMobile(userAgent: string) {
  return /Mobi|Android|iPhone/i.test(userAgent);
}

export function isRealName(name: string) {
  return /^[\u4e00-\u9fa5]{2,4}[1-9]?$/.test(name); // 汉字2到4个，后面允许带个数字
}

export function trimSpaces(str?: string) {
  if (!str) {
    return "";
  }
  let temp = str.replaceAll(
    /([\u4e00-\u9fa5]+)\s([\w\.]+)/g,
    (_, $1, $2) => $1 + $2,
  );
  temp = temp.replaceAll(
    /([\w\.]+)\s([\u4e00-\u9fa5]+)/g,
    (_, $1, $2) => $1 + $2,
  );

  temp = temp.replaceAll(
    /([\u4e00-\u9fa5]+)\s\[([\w\.]+)\]/g,
    (_, $1, $2) => $1 + "[" + $2 + "]",
  );
  temp = temp.replaceAll(/\)\s([\u4e00-\u9fa5]+)/g, (_, $1) => ")" + $1);
  temp = temp.replaceAll(
    /([\u4e00-\u9fa5]+)\s<a href="([\w:\.\/-]+)">([\w]+)/g,
    (_, $1, $2, $3) => $1 + '<a href="' + $2 + '">' + $3,
  );
  temp = temp.replaceAll(
    /([\u4e00-\u9fa5]+)<\/a>\s([\w\.]+)/g,
    (_, $1, $2) => $1 + "</a>" + $2,
  );

  return temp;
}
export enum ITag {
  p = "p",
  ul = "ul",
  ol = "ol",
  img = "img",
  pre = "pre",
  table = "table",
}

export function addIdForTag(html: string, tag: ITag) {
  const reg = new RegExp("<" + tag + "[ |>]");
  const part1 = html.split(reg);
  const part2 = part1.map((item, index) => {
    if (index === 0) {
      return item;
    } else {
      const id = nanoid();
      const frontPart = /[^>^<]*>/.exec(item);
      if (frontPart?.index === 0) {
        //分割点是'<tag '
        return `<${tag} id="${id}" ${item}`;
      } else {
        //分割点是'<tag>'
        return `<${tag} id="${id}">` + item;
      }
    }
  });
  return part2.join("");
}
