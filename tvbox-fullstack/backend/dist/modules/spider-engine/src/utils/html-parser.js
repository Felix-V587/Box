"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HtmlParser = void 0;
const cheerio = require("cheerio");
class HtmlParser {
    parseDomForUrl(html, rule, addUrl) {
        const $ = cheerio.load(html);
        const parts = rule.split('.');
        if (parts.length === 0) {
            return '';
        }
        const selector = parts[0];
        const element = $(selector);
        if (element.length === 0) {
            return '';
        }
        if (parts.length > 1) {
            const attr = parts[1];
            if (attr === 'text') {
                return element.text().trim();
            }
            else if (attr === 'html') {
                return element.html() || '';
            }
            else {
                const value = element.attr(attr);
                if (value && addUrl) {
                    return this.joinUrl(addUrl, value);
                }
                return value || '';
            }
        }
        return element.text().trim();
    }
    parseDomForArray(html, rule) {
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
        const results = [];
        elements.each((_, element) => {
            const $element = cheerio.load(element);
            if (parts.length > 1) {
                const attr = parts[1];
                if (attr === 'text') {
                    results.push($element.text().trim());
                }
                else if (attr === 'html') {
                    results.push($element.html() || '');
                }
                else {
                    results.push($element('body').attr(attr) || '');
                }
            }
            else {
                results.push($element.text().trim());
            }
        });
        return results;
    }
    parseDomForList(html, p1, listText, listUrl, addUrl) {
        const $ = cheerio.load(html);
        const listItems = $(p1);
        if (listItems.length === 0) {
            return [];
        }
        const results = [];
        listItems.each((_, item) => {
            const $item = cheerio.load(item);
            let text = '';
            if (listText) {
                text = this.parseDomForUrl($item.html() || '', listText, '');
            }
            else {
                text = $item.text().trim();
            }
            let url = '';
            if (listUrl) {
                url = this.parseDomForUrl($item.html() || '', listUrl, addUrl);
            }
            if (text && url) {
                results.push(`${text}$${url}`);
            }
            else if (text) {
                results.push(text);
            }
            else if (url) {
                results.push(url);
            }
        });
        return results;
    }
    joinUrl(parent, child) {
        try {
            return new URL(child, parent).href;
        }
        catch (error) {
            if (parent.endsWith('/')) {
                return parent + child;
            }
            return parent + '/' + child;
        }
    }
}
exports.HtmlParser = HtmlParser;
//# sourceMappingURL=html-parser.js.map