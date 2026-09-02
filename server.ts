import express from "express";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Modality, GenerateVideosOperation } from "@google/genai";
import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  app.use(express.json({ limit: "50mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      aiEnabled: Boolean(process.env.GEMINI_API_KEY),
      models: {
        chatbot: ["gemini-3.5-flash", "gemini-3.1-pro-preview", "gemini-3.1-flash-lite"],
        video: "veo-3.1-fast-generate-preview",
        liveVoice: "gemini-3.1-flash-live-preview",
      },
    });
  });

  // ==========================================
  // 1. GEMINI MULTI-TURN CHATBOT ENDPOINT
  // ==========================================
  app.post("/api/chat/message", async (req, res) => {
    try {
      const {
        messages,
        model = "gemini-3.5-flash",
        systemInstruction,
        role = "tutor",
      } = req.body;

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallback: true,
        });
      }

      // Validate allowed models per specs
      const allowedModels = [
        "gemini-3.5-flash",
        "gemini-3.1-pro-preview",
        "gemini-3.1-flash-lite",
      ];
      const selectedModel = allowedModels.includes(model) ? model : "gemini-3.5-flash";

      // Build system prompt based on role if not customized
      let rolePrompt = systemInstruction;
      if (!rolePrompt) {
        switch (role) {
          case "math":
            rolePrompt =
              "You are the Ultimate SAT Math Specialist (scored 800 in SAT Math). Help students master algebra, advanced math, geometry, trigonometry, and Desmos calculator shortcuts. Provide rigorous step-by-step solutions, identify common College Board trap answers, and suggest speed hacks under 45 seconds.";
            break;
          case "reading":
            rolePrompt =
              "You are the Premier Digital SAT Reading & Writing Analyst (scored 800 in SAT Reading & Writing). Guide students through craft & structure, vocabulary-in-context, transition questions, rhetoric, and punctuation rules. Provide concise annotations and eliminate deceptive wrong options.";
            break;
          case "strategy":
            rolePrompt =
              "You are a 1600 SAT Strategy Mentor & Admissions Coach. Provide test-day pacing strategies, module 1 vs module 2 adaptive routing advice, time management tactics, study plans, and anxiety reduction techniques.";
            break;
          default:
            rolePrompt =
              "You are an expert, encouraging 1600 Digital SAT Master Tutor. You provide concise, actionable explanations, step-by-step problem breakdowns, trap warnings, and speed tips for both Math and Reading & Writing.";
            break;
        }
      }

      // Convert conversation messages to @google/genai format
      const formattedContents = (messages || []).map((m: any) => ({
        role: m.role === "assistant" || m.role === "model" ? "model" : "user",
        parts: [{ text: m.content || m.text || "" }],
      }));

      if (formattedContents.length === 0) {
        return res.status(400).json({ error: "Messages array cannot be empty." });
      }

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config: {
          systemInstruction: rolePrompt,
          temperature: selectedModel === "gemini-3.1-pro-preview" ? 0.35 : 0.7,
        },
      });

      res.json({
        success: true,
        text: response.text || "No response generated.",
        modelUsed: selectedModel,
      });
    } catch (error: any) {
      console.error("Error in multi-turn chat endpoint:", error);
      res.status(500).json({
        error: error.message || "Failed to generate chat response",
      });
    }
  });

  // ==========================================
  // 2. VEO 3 VIDEO GENERATION (veo-3.1-fast-generate-preview)
  // ==========================================
  // Step 1: Start Video Generation
  app.post("/api/veo/generate", async (req, res) => {
    try {
      const {
        prompt,
        aspectRatio = "16:9",
        resolution = "720p",
      } = req.body;

      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
        });
      }

      // Supported aspect ratios: 16:9 or 9:16
      const validAspectRatio = aspectRatio === "9:16" ? "9:16" : "16:9";
      const validResolution = resolution === "1080p" ? "1080p" : "720p";

      const promptText =
        prompt ||
        "An educational high-tech 3D animated visualization explaining parabolic trajectories and quadratic equation roots in vibrant colors with clean mathematical diagrams.";

      const operation = await ai.models.generateVideos({
        model: "veo-3.1-fast-generate-preview",
        prompt: promptText,
        config: {
          numberOfVideos: 1,
          resolution: validResolution,
          aspectRatio: validAspectRatio,
        },
      });

      res.json({
        success: true,
        operationName: operation.name,
        prompt: promptText,
        aspectRatio: validAspectRatio,
      });
    } catch (error: any) {
      console.error("Error initiating Veo video generation:", error);
      res.status(500).json({
        error: error.message || "Failed to start video generation",
      });
    }
  });

  // Step 2: Poll Video Status
  app.post("/api/veo/status", async (req, res) => {
    try {
      const { operationName } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
        });
      }

      if (!operationName) {
        return res.status(400).json({ error: "operationName is required." });
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });

      const isDone = Boolean(updated.done);
      const generatedVideo = updated.response?.generatedVideos?.[0];
      const videoUri = generatedVideo?.video?.uri;

      res.json({
        success: true,
        done: isDone,
        error: updated.error ? updated.error.message : null,
        hasVideo: Boolean(videoUri),
        videoUri: videoUri || null,
      });
    } catch (error: any) {
      console.error("Error polling Veo video status:", error);
      res.status(500).json({
        error: error.message || "Failed to check video generation status",
      });
    }
  });

  // Step 3: Stream/Download Generated Video
  app.post("/api/veo/download", async (req, res) => {
    try {
      const { operationName } = req.body;
      const ai = getAI();
      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
        });
      }

      if (!operationName) {
        return res.status(400).json({ error: "operationName is required." });
      }

      const op = new GenerateVideosOperation();
      op.name = operationName;
      const updated = await ai.operations.getVideosOperation({ operation: op });
      const uri = updated.response?.generatedVideos?.[0]?.video?.uri;

      if (!uri) {
        return res.status(404).json({
          error: "Video not ready or download URI not available.",
        });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const videoRes = await fetch(uri, {
        headers: {
          "x-goog-api-key": apiKey || "",
        },
      });

      if (!videoRes.ok) {
        return res.status(videoRes.status).json({
          error: `Failed to fetch generated video from upstream (status ${videoRes.status})`,
        });
      }

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="veo-sat-learning-video.mp4"'
      );

      if (videoRes.body) {
        // Stream back to client
        const reader = videoRes.body.getReader();
        const pump = async () => {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(value);
          }
        };
        await pump();
      } else {
        res.end();
      }
    } catch (error: any) {
      console.error("Error downloading Veo video:", error);
      res.status(500).json({
        error: error.message || "Failed to stream video",
      });
    }
  });

  // ==========================================
  // 3. SAT QUESTION & EXPLANATION ENDPOINTS
  // ==========================================
  app.post("/api/sat/generate-question", async (req, res) => {
    try {
      const { domain, difficulty, topic } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured. Falling back to built-in question bank.",
          fallback: true,
        });
      }

      const prompt = `You are an expert Digital SAT exam writer for College Board.
Generate 1 authentic, realistic Digital SAT multiple-choice practice question in JSON format.

Parameters:
- Domain: ${domain || "Math or Reading & Writing"}
- Topic: ${topic || "General"}
- Difficulty Level: ${difficulty || "Medium"} (Options: Easy, Medium, Hard, Very Hard)

Rules for Digital SAT:
1. For Reading & Writing questions, provide a realistic concise passage (30-90 words) or poem/data snippet followed by a stem question and 4 choices (A, B, C, D).
2. For Math questions, provide clear mathematical wording, use standard arithmetic or algebraic equations, and 4 choices (A, B, C, D).
3. If difficulty is "Very Hard", make it a challenging 750-800 level question requiring multi-step reasoning, subtle nuances, or advanced techniques.
4. Provide a thorough, step-by-step explanation including why the correct answer is right and why distractors are wrong, plus a "SAT Pro Tip" or Desmos shortcut.

Return ONLY raw valid JSON matching this schema:
{
  "id": "gen_${Date.now()}",
  "domain": "${domain || "Math"}",
  "section": "${domain?.includes("Math") ? "Math" : "Reading & Writing"}",
  "topic": "${topic || "Core Concept"}",
  "difficulty": "${difficulty || "Medium"}",
  "passage": "Passage text if Reading/Writing, or empty string if Math",
  "question": "The question prompt text",
  "options": [
    {"id": "A", "text": "Choice A text"},
    {"id": "B", "text": "Choice B text"},
    {"id": "C", "text": "Choice C text"},
    {"id": "D", "text": "Choice D text"}
  ],
  "correctAnswer": "A",
  "explanation": "Detailed step-by-step reasoning explaining the correct answer.",
  "proTip": "SAT shortcut, Desmos strategy, or mnemonic."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json({ success: true, question: parsed });
    } catch (error: any) {
      console.error("Error generating SAT question:", error);
      res.status(500).json({ error: error.message || "Failed to generate question", fallback: true });
    }
  });

  app.post("/api/sat/explain", async (req, res) => {
    try {
      const { questionText, passage, options, userAnswer, correctAnswer, userQuery } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({
          error: "Gemini API key is not configured.",
          fallback: true,
        });
      }

      const prompt = `You are a friendly, master Digital SAT Tutor (scored 1600).
A student needs help understanding this Digital SAT question:

Passage (if any): "${passage || "N/A"}"
Question: "${questionText}"
Options: ${JSON.stringify(options || [])}
Correct Answer: ${correctAnswer}
Student's Chosen Answer: ${userAnswer || "Unanswered/Confused"}
Student's Specific Question or Doubt: "${userQuery || "Please explain how to solve this step-by-step and why my choice might be wrong."}"

Provide an encouraging, clear, formatted breakdown with:
1. **Core Concept Tested**: Name the exact SAT concept.
2. **Step-by-Step Solution**: Fast and crystal-clear solving steps.
3. **Trap Analysis**: Why the wrong options are common SAT traps.
4. **1600 Scorer Shortcut**: A speed tip or Desmos trick to solve this in under 45 seconds.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });

      res.json({ success: true, explanation: response.text });
    } catch (error: any) {
      console.error("Error generating tutor explanation:", error);
      res.status(500).json({ error: error.message || "Failed to provide AI explanation" });
    }
  });

  app.post("/api/sat/generate-notes", async (req, res) => {
    try {
      const { topic, category } = req.body;
      const ai = getAI();

      if (!ai) {
        return res.status(503).json({ error: "Gemini API key is not configured." });
      }

      const prompt = `You are a Digital SAT author. Generate high-yield study notes and formulas for the topic: "${topic}" (${category || "SAT Prep"}).
Include:
- Key rules and formulas
- Common College Board traps & misconceptions
- Real Digital SAT pattern examples
- Top 3 test-day execution tips.
Keep it structured, clear, and high-impact.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.5,
        },
      });

      res.json({ success: true, content: response.text });
    } catch (error: any) {
      console.error("Error generating notes:", error);
      res.status(500).json({ error: error.message || "Failed to generate study notes" });
    }
  });

  // ==========================================
  // 4. LIVE API VOICE CONVERSATIONS (gemini-3.1-flash-live-preview)
  // ==========================================
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : "";
    if (pathname === "/live" || pathname === "/ws/live") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (clientWs: WebSocket, req) => {
    const ai = getAI();
    if (!ai) {
      clientWs.send(
        JSON.stringify({
          type: "error",
          error: "Gemini API key is not configured on server.",
        })
      );
      clientWs.close();
      return;
    }

    let liveSession: any = null;

    try {
      // Parse query params for voice preference, persona, & subject
      const url = new URL(req.url || "", "http://localhost");
      const voiceName = url.searchParams.get("voice") || "Zephyr";
      const persona = url.searchParams.get("persona") || "universal_coach";

      let systemPrompt =
        "You are an encouraging, polymath Voice Coach & Universal Master Tutor. You are talking live with a curious student. You can answer and teach EVERYTHING: SAT/ACT test prep, advanced mathematics, physics, chemistry, biology, computer science, coding, college admissions, essay writing, history, literature, philosophy, and study productivity. Keep answers conversational, warm, encouraging, concise (1-3 sentences per turn so it feels like a real-time engaging dialogue), and explain complex concepts with intuitive visual analogies that can be drawn on a chalkboard.";

      if (persona === "sat_coach") {
        systemPrompt =
          "You are a 1600 Digital SAT & ACT Master Coach. Explain math shortcuts, Desmos speed hacks, grammar rules, transition words, reading passage logic, and module 1 vs module 2 adaptive pacing clearly and concisely in natural spoken voice.";
      } else if (persona === "math_coach" || persona === "calculus_coach") {
        systemPrompt =
          "You are a master Mathematics & Calculus Tutor. Teach all math from algebra, geometry, and trigonometry to AP Calculus, differential equations, and linear algebra. Break down derivations, formulas, and graph behaviors step-by-step in clear conversational spoken voice.";
      } else if (persona === "science_coach") {
        systemPrompt =
          "You are a master Science & Engineering Tutor covering Physics (mechanics, thermodynamics, electromagnetism), Chemistry (stoichiometry, equilibrium, organic), and Biology (genetics, cell biology, physiology). Explain natural phenomena, laws, and equations with vivid real-world intuition in spoken dialogue.";
      } else if (persona === "admissions_coach") {
        systemPrompt =
          "You are a premier Ivy League & College Admissions Mentor. Guide students through Common App personal statement ideation, narrative hooks, extracurricular spikes, supplemental essays, and interview coaching in a warm, inspiring spoken tone.";
      } else if (persona === "coding_coach") {
        systemPrompt =
          "You are a Senior Software Engineer and Computer Science Mentor. Explain algorithms, data structures, Python, JavaScript, system design, and AI concepts clearly and step-by-step in spoken conversation.";
      } else if (persona === "humanities_coach") {
        systemPrompt =
          "You are an inspiring Humanities, History & Literature Professor. Discuss historical movements, rhetoric, literary analysis, philosophy, and persuasive writing techniques in an engaging, thoughtful spoken dialogue.";
      } else if (persona === "life_coach") {
        systemPrompt =
          "You are an empathetic High-Performance Learning & Productivity Coach. Teach spaced repetition, active recall, deep work focus routines, public speaking confidence, and stress management in a supportive spoken voice.";
      }

      liveSession = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voiceName as "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr",
              },
            },
          },
          systemInstruction: systemPrompt,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onmessage: (message: any) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;

            // Audio from model turn
            const audioData =
              message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: "audio", audio: audioData }));
            }

            // Transcriptions
            const outputText =
              message.serverContent?.outputAudioTranscription?.text ||
              message.serverContent?.modelTurn?.parts?.[0]?.text;
            if (outputText) {
              clientWs.send(
                JSON.stringify({
                  type: "transcript",
                  text: outputText,
                  speaker: "model",
                })
              );
            }

            const inputText =
              message.serverContent?.inputAudioTranscription?.text;
            if (inputText) {
              clientWs.send(
                JSON.stringify({
                  type: "transcript",
                  text: inputText,
                  speaker: "user",
                })
              );
            }

            // Interruption signal
            if (message.serverContent?.interrupted) {
              clientWs.send(
                JSON.stringify({ type: "interrupted", interrupted: true })
              );
            }

            // Turn completion
            if (message.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: "turnComplete" }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ type: "sessionClosed" }));
            }
          },
          onerror: (err: any) => {
            console.error("Gemini Live Session Error:", err);
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(
                JSON.stringify({
                  type: "error",
                  error: err.message || "Live voice session error",
                })
              );
            }
          },
        },
      });

      // Send initial connected notification to client
      clientWs.send(
        JSON.stringify({
          type: "connected",
          voice: voiceName,
          model: "gemini-3.1-flash-live-preview",
        })
      );

      // Listen for client incoming audio and messages
      clientWs.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "audio" && msg.audio && liveSession) {
            try {
              liveSession.sendRealtimeInput({
                audio: {
                  data: msg.audio,
                  mimeType: "audio/pcm;rate=16000",
                },
              });
            } catch (err) {
              liveSession.sendRealtimeInput([
                {
                  mimeType: "audio/pcm;rate=16000",
                  data: msg.audio,
                },
              ]);
            }
          } else if (msg.type === "text" && msg.text && liveSession) {
            try {
              liveSession.send({
                clientContent: {
                  turns: [
                    {
                      role: "user",
                      parts: [{ text: msg.text }],
                    },
                  ],
                  turnComplete: true,
                },
              });
            } catch (e) {
              liveSession.sendRealtimeInput({ text: msg.text });
            }
          }
        } catch (e) {
          console.error("Error processing client audio/data message:", e);
        }
      });

      clientWs.on("close", () => {
        if (liveSession) {
          try {
            liveSession.close();
          } catch (e) {}
        }
      });
    } catch (err: any) {
      console.error("Failed to establish Gemini Live connection:", err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(
          JSON.stringify({
            type: "error",
            error: err.message || "Failed to initialize Gemini Live voice",
          })
        );
      }
    }
  });

  // Vite middleware in development, static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`SAT Prep & Gemini AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

