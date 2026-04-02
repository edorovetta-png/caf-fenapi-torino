import { supabase } from "./supabase.ts";

export async function transcribeAudio(
  audioBuffer: ArrayBuffer
): Promise<string> {
  // Check mock mode
  const { data: config } = await supabase
    .from("config_sistema")
    .select("valore")
    .eq("chiave", "mock_mode")
    .single();

  const mockMode = config?.valore === "true";

  if (mockMode) {
    console.log("[MOCK] Transcribing audio — returning mock transcription");
    return "Questo è un messaggio vocale di test trascritto";
  }

  // REAL: OpenAI Whisper API
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not set");
  }

  const formData = new FormData();
  formData.append("file", new Blob([audioBuffer], { type: "audio/ogg" }), "audio.ogg");
  formData.append("model", "whisper-1");
  formData.append("language", "it");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Whisper API ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  return data.text;
}
