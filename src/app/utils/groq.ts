import Groq from "groq-sdk";

const groq = new Groq ({
    apiKey: process.env.GROQ_API_KEY
})

interface ChatMessage {
    role: "system" | "user" | "assistant",
    content: string;
}

export async function getAIResponse(message: string) {
    const messages:ChatMessage[] = [
        {role: "system", content: "You are an succinct summarizer who only responds from context provided in a brief paragraph"},
        {
            role: "user", content: message
        }
    ]

    console.log("Starting groq API request")

    const response = await groq.chat.completions.create({model: "llama3-70b-8192",messages})

    console.log("Received groq api request", response)

    return response.choices[0].message.content;
}