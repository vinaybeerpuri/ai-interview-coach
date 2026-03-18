import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { answer, question, role } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert interview coach analyzing a candidate's response. 
You must respond ONLY by calling the analyze_response function with structured data.

Analyze the answer for:
- Filler words (um, uh, like, actually, basically, you know, so, right)
- Speaking pace (estimate words per minute)
- Sentiment (Confident, Neutral, Hesitant, or Nervous)
- Clarity of communication (0-100)
- Confidence level (0-100)
- Relevance to the question (0-100)
- Specific, actionable feedback (be direct and specific, not vague)
- An improved version of their answer using the STAR method

The role being interviewed for is: ${role}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Interview Question: "${question}"\n\nCandidate's Answer: "${answer}"`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_response",
              description: "Return structured interview response analysis",
              parameters: {
                type: "object",
                properties: {
                  transcript: { type: "string", description: "The cleaned-up transcript of what the candidate said" },
                  filler_count: { type: "number", description: "Number of filler words detected" },
                  filler_words: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of filler words found",
                  },
                  wpm: { type: "number", description: "Estimated words per minute" },
                  sentiment: { type: "string", enum: ["Confident", "Neutral", "Hesitant", "Nervous"] },
                  clarity_score: { type: "number", description: "Clarity score 0-100" },
                  confidence_score: { type: "number", description: "Confidence score 0-100" },
                  relevance_score: { type: "number", description: "Relevance to question 0-100" },
                  feedback: { type: "string", description: "Specific actionable feedback" },
                  improved_answer: { type: "string", description: "An improved version of the answer" },
                },
                required: [
                  "transcript", "filler_count", "filler_words", "wpm", "sentiment",
                  "clarity_score", "confidence_score", "relevance_score", "feedback", "improved_answer",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_response" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-answer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
