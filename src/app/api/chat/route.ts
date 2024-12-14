// TODO: Implement the chat API with Groq and web scraping with Cheerio and Puppeteer
// Refer to the Next.js Docs on how to read the Request body: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// Refer to the Groq SDK here on how to use an LLM: https://www.npmjs.com/package/groq-sdk
// Refer to the Cheerio docs here on how to parse HTML: https://cheerio.js.org/docs/basics/loading
// Refer to Puppeteer docs here: https://pptr.dev/guides/what-is-puppeteer
import { Groq } from "groq-sdk";
import * as cheerio from 'cheerio';
import puppeteer from "puppeteer"; 
import { NextResponse} from "next/server";
import { getAIResponse } from "@/app/utils/groq";
import { ScrapeURL, urlPattern } from "@/app/utils/scraper";
import {parse} from "cookie";

export async function POST(req: Request) {
  try {
    const {message} = await req.json();
    //initiate an empty string to hold our additional context
    let additionalContext = ''

    console.log(message)

    const url = message.match(urlPattern)
    if (url){
      console.log(url)
      const scrapedContent = await ScrapeURL(url)
      //see if our scraping worked
      console.log(scrapedContent.truncatedContent)
      console.log(scrapedContent.metadata)

      //add it to overall context
        // Build additional context to send to the LLM
        additionalContext = `
        Extracted Content:
        ${scrapedContent.truncatedContent}

        Metadata:
        Title: ${scrapedContent.metadata.title || "N/A"}
        Description: ${scrapedContent.metadata.description || "N/A"}
        Keywords: ${scrapedContent.metadata.keywords || "N/A"}
        `;
    }

    //combine all contexts
    const messageWithContext = `
    User Query: ${message}

    ${additionalContext ? `Additional Context: ${additionalContext}` : ""}
    `;

    //send combined context to llm
    const response = await getAIResponse(messageWithContext)

    return NextResponse.json({message: response})
  } catch (error) {
    console.error("couldn't generate a summary based on scraper", error);
    return new Response(JSON.stringify({ error: error }), {status: 500});
  }
}
