export declare class HtmlParser {
    parseDomForUrl(html: string, rule: string, addUrl: string): string;
    parseDomForArray(html: string, rule: string): string[];
    parseDomForList(html: string, p1: string, listText: string, listUrl: string, addUrl: string): string[];
    private joinUrl;
}
