/**
 * HTML解析器
 * 实现与TVBox兼容的HTML解析功能
 */
export declare class HtmlParser {
    /**
     * 解析HTML元素
     * @param html HTML内容
     * @param rule 解析规则
     * @param addUrl 拼接URL
     * @returns 解析结果
     */
    parseDomForUrl(html: string, rule: string, addUrl: string): string;
    /**
     * 解析HTML数组
     * @param html HTML内容
     * @param rule 解析规则
     * @returns 解析结果数组
     */
    parseDomForArray(html: string, rule: string): string[];
    /**
     * 解析列表
     * @param html HTML内容
     * @param p1 列表选择器
     * @param listText 文本规则
     * @param listUrl URL规则
     * @param addUrl 拼接URL
     * @returns 解析结果数组
     */
    parseDomForList(html: string, p1: string, listText: string, listUrl: string, addUrl: string): string[];
    /**
     * URL拼接
     */
    private joinUrl;
}
//# sourceMappingURL=html-parser.d.ts.map