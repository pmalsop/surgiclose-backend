import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY is missing." });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = req.body || {};

    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "system",
          content: `
You are a clinician-facing skin cancer surgery decision-support assistant.

Analyse the case using:
1. CHAIRS
2. DRIPS
3. PIG CARTS

Return your answer under exactly these headings:
- Case Summary
- CHAIRS
- DRIPS
- PIG CARTS
- Red Flags / Refer
- Confidence

Rules:
- Prioritise oncological clearance first.
- Preserve function and free margins.
- Do not make a definitive diagnosis from image alone.
- State uncertainty clearly.
- Be concise, structured, and practical.
`
        },
        {
          role: "user",
          content: JSON.stringify(body)
        }
      ]
    });

    return res.status(200).json({
      result: response.output_text
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return res.status(500).json({
      error: error?.message || "Unknown server error"
    });
  }
}
