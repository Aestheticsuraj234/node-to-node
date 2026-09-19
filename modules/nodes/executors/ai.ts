import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { interpolate } from "@/modules/engine/lib/template";

export async function runAI(config: any, item: any) {
  const prompt = interpolate(config.prompt ?? "", item);
  const provider = config.provider ?? "openai";

  let res;

  switch (provider) {
    case "openai":
      {
        const model = new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
        res = await model.invoke(prompt);
      }
      break;
    case "anthropic":
      {
        const model = new ChatAnthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
        res = await model.invoke(prompt);
      }
      break;
    case "google":
      {
        const model = new ChatGoogleGenerativeAI({
          apiKey: process.env.GOOGLE_API_KEY,
          model: "gemini-2.5-flash",
        });
        res = await model.invoke(prompt);
      }
      break;
  };

  const content = typeof res?.content === "string" ? res.content : JSON.stringify(res?.content);
  return {
    ...item,
    summary: content,
    response:content
  }

}
