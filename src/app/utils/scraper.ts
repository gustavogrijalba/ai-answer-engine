import axios from "axios";
import * as cheerio from 'cheerio';
import puppeteer from "puppeteer";

export const urlPattern =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  
export async function ScrapeURL(url: string) {
    try {
        // Fetch the web page content
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Remove unnecessary elements
        $('script, style, noscript, iframe, link, meta, comment').remove();

        // Extract and clean the visible text
        let pageText = $('body')
            .text()
            .replace(/\s\s+/g, ' ') // Replace multiple spaces/newlines with a single space
            .trim();

        // Extract relevant metadata
        const metadata = {
            title: $('title').text().trim() || '',
            description: $('meta[name="description"]').attr('content')?.trim() || '',
            keywords: $('meta[name="keywords"]').attr('content')?.trim() || ''
        };

        // Truncate content for LLMs
        const maxLength = 100000; // Limit to 4096 characters
        const truncatedContent = `${metadata.title ? metadata.title + '\n\n' : ''}${pageText}`.slice(0, maxLength);

        // Return the metadata and truncated content
        return {
            metadata,
            truncatedContent
        };
    } catch (error) {
        console.error(`Failed to scrape URL: ${url}`, error);
        return { 
            metadata: {
                title: '',
                description: '',
                keywords: ''
            }, 
            truncatedContent: '' 
        };
    }
}