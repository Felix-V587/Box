import * as cheerio from 'cheerio';

/**
 * HTML解析器
 * 实现与TVBox兼容的HTML解析功能
 */
export class HtmlParser {
    /**
     * 解析HTML元素
     * @param html HTML内容
     * @param rule 解析规则
     * @param addUrl 拼接URL
     * @returns 解析结果
     */
    parseDomForUrl(html: string, rule: string, addUrl: string): string {
        const $ = cheerio.load(html);
        const parts = rule.split('.');

        if (parts.length === 0) {
            return '';
        }

        // 解析选择器
        const selector = parts[0];
        const element = $(selector);

        if (element.length === 0) {
            return '';
        }

        // 解析属性或文本
        if (parts.length > 1) {
            const attr = parts[1];
            
            // 特殊属性
            if (attr === 'text') {
                return element.text().trim();
            } else if (attr === 'html') {
                return element.html() || '';
            } else {
                // 普通属性
                const value = element.attr(attr);
                if (value && addUrl) {
                    return this.joinUrl(addUrl, value);
                }
                return value || '';
            }
        }

        return element.text().trim();
    }

    /**
     * 解析HTML数组
     * @param html HTML内容
     * @param rule 解析规则
     * @returns 解析结果数组
     */
    parseDomForArray(html: string, rule: string): string[] {
        const $ = cheerio.load(html);
        const parts = rule.split('.');

        if (parts.length === 0) {
            return [];
        }

        const selector = parts[0];
        const elements = $(selector);

        if (elements.length === 0) {
            return [];
        }

        const results: string[] = [];

        elements.each((_, element) => {
            const $element = cheerio.load(element);

            if (parts.length > 1) {
                const attr = parts[1];
                if (attr === 'text') {
                    results.push($element.text().trim());
                } else if (attr === 'html') {
                    results.push($element.html() || '');
                } else {
                    results.push($element('body').attr(attr) || '');
                }
            } else {
                results.push($element.text().trim());
            }
        });

        return results;
    }

    /**
     * 解析列表
     * @param html HTML内容
     * @param p1 列表选择器
     * @param listText 文本规则
     * @param listUrl URL规则
     * @param addUrl 拼接URL
     * @returns 解析结果数组
     */
    parseDomForList(
        html: string,
        p1: string,
        listText: string,
        listUrl: string,
        addUrl: string
    ): string[] {
        const $ = cheerio.load(html);
        const listItems = $(p1);

        if (listItems.length === 0) {
            return [];
        }

        const results: string[] = [];

        listItems.each((_, item) => {
            const $item = cheerio.load(item);

            // 解析文本
            let text = '';
            if (listText) {
                text = this.parseDomForUrl($item.html() || '', listText, '');
            } else {
                text = $item.text().trim();
            }

            // 解析URL
            let url = '';
            if (listUrl) {
                url = this.parseDomForUrl($item.html() || '', listUrl, addUrl);
            }

            // 拼接结果
            if (text && url) {
                results.push(`${text}$${url}`);
            } else if (text) {
                results.push(text);
            } else if (url) {
                results.push(url);
            }
        });

        return results;
    }

    /**
     * URL拼接
     */
    private joinUrl(parent: string, child: string): string {
        try {
            return new URL(child, parent).href;
        } catch (error) {
            if (parent.endsWith('/')) {
                return parent + child;
            }
            return parent + '/' + child;
        }
    }
}
