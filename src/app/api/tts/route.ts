import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get("text") || "";
    const lang = searchParams.get("lang") || "en";

    if (!text) {
      return new NextResponse("Text parameter is required", { status: 400 });
    }

    const azureKey = process.env.AZURE_SPEECH_KEY;
    const azureRegion = process.env.AZURE_SPEECH_REGION || "centralindia";
    const googleKey = process.env.GOOGLE_API_KEY;

    // 1. Try Azure Neural TTS if configured
    if (azureKey) {
      let voiceName = "en-IN-NeerjaNeural"; // Natural Indian English voice
      if (lang === "ta") {
        voiceName = "ta-IN-PallaviNeural"; // Natural Tamil voice
      }

      const ssml = `
        <speak version='1.0' xml:lang='${lang === "ta" ? "ta-IN" : "en-IN"}' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='http://www.w3.org/2001/mstts'>
          <voice name='${voiceName}'>
            ${escapeXml(text)}
          </voice>
        </speak>
      `;

      const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": azureKey,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
          "User-Agent": "chennai-guardian-tts",
        },
        body: ssml.trim(),
      });

      if (response.ok) {
        const audioBuffer = await response.arrayBuffer();
        return new NextResponse(Buffer.from(audioBuffer), {
          headers: {
            "Content-Type": "audio/mpeg",
            "Cache-Control": "public, max-age=3600",
          },
        });
      } else {
        const errText = await response.text();
        console.error("Azure TTS failed:", errText);
      }
    }

    // 2. Try Google Cloud TTS if configured
    if (googleKey) {
      let voiceName = "en-IN-Neural2-A";
      let languageCode = "en-IN";
      if (lang === "ta") {
        voiceName = "ta-IN-Neural2-A";
        languageCode = "ta-IN";
      }

      const body = {
        input: { text },
        voice: { languageCode, name: voiceName },
        audioConfig: {
          audioEncoding: "MP3",
        },
      };

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioContent) {
          const audioBuffer = Buffer.from(data.audioContent, "base64");
          return new NextResponse(audioBuffer, {
            headers: {
              "Content-Type": "audio/mpeg",
              "Cache-Control": "public, max-age=3600",
            },
          });
        }
      } else {
        const errText = await response.text();
        console.error("Google TTS failed:", errText);
      }
    }

    // 3. Fallback: Google Translate keyless TTS
    const googleTranslateLang = lang === "ta" ? "ta" : "en";
    const chunks = splitTextIntoChunks(text, 200);
    const buffers: Buffer[] = [];

    for (const chunk of chunks) {
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${googleTranslateLang}&client=tw-ob`;
      const response = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });

      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        buffers.push(Buffer.from(arrayBuf));
      } else {
        console.error(`Fallback TTS failed for chunk: ${chunk}`);
        throw new Error(`Fallback TTS fetch failed for chunk: ${chunk}`);
      }
    }

    if (buffers.length > 0) {
      const combinedBuffer = Buffer.concat(buffers);
      return new NextResponse(combinedBuffer, {
        headers: {
          "Content-Type": "audio/mpeg",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    return new NextResponse("TTS Synthesis failed", { status: 500 });
  } catch (error: any) {
    console.error("TTS API error:", error);
    return new NextResponse(error?.message || "Internal Server Error", { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function splitTextIntoChunks(text: string, maxLength = 200): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk + " " + word).trim().length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = word;
    } else {
      currentChunk = currentChunk ? currentChunk + " " + word : word;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}
