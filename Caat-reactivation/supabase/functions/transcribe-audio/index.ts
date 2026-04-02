import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { transcribeAudio } from "../_shared/whisper.ts";

serve(async (req) => {
  try {
    const contentType = req.headers.get("content-type") || "";

    let audioBuffer: ArrayBuffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("audio") as File;
      if (!file) {
        return new Response(JSON.stringify({ error: "No audio file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      audioBuffer = await file.arrayBuffer();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      if (body.audio_url) {
        if (body.audio_url.startsWith("wa-audio://")) {
          const mediaId = body.audio_url.replace("wa-audio://", "");
          const accessToken = Deno.env.get('WA_ACCESS_TOKEN');
          
          if (!accessToken) throw new Error("Missing WA_ACCESS_TOKEN in secrets");

          // Fase 1: Ottieni l'URL del media da Meta Graph API
          const mediaResponse = await fetch(
            `https://graph.facebook.com/v21.0/${mediaId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!mediaResponse.ok) {
            const errBody = await mediaResponse.text();
            throw new Error(`Failed to get media URL: ${errBody}`);
          }
          const { url } = await mediaResponse.json();

          // Fase 2: Scarica il file audio vero e proprio
          const audioResponse = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (!audioResponse.ok) {
            const errBody = await audioResponse.text();
            throw new Error(`Failed to download audio data: ${errBody}`);
          }
          audioBuffer = await audioResponse.arrayBuffer();
        } else {
          // Standard http URL fallback
          const audioResponse = await fetch(body.audio_url);
          audioBuffer = await audioResponse.arrayBuffer();
        }
      } else {
        return new Response(JSON.stringify({ error: "Provide audio file or audio_url" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } else {
      audioBuffer = await req.arrayBuffer();
    }

    const transcription = await transcribeAudio(audioBuffer);

    return new Response(
      JSON.stringify({ transcription, success: true }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("TRANSCRIBE-AUDIO ERROR:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message, success: false }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
