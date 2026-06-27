import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Shared Gemini client utility
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: AI Coach Tactical Review & Scouting targets
  app.post("/api/coach-advice", async (req, res): Promise<any> => {
    try {
      const { squad, myPlayersCount, gp, coins } = req.body;

      if (!squad) {
        return res.status(400).json({ error: "Les informations d'équipe sont requises." });
      }

      const squadContext = JSON.stringify(squad);
      
      const promptText = `
Vous êtes un entraîneur de classe mondiale et expert en tactique (style Pep Guardiola ou Jürgen Klopp).
Vous évaluez l'équipe "Dream Team" d'eFootball Pocket Manager de l'utilisateur.

Voici les informations sur l'équipe :
- Formation active : ${squad.formation}
- Style de jeu collectif : ${squad.playStyle}
- Joueurs titulaires actuels :
${JSON.stringify(squad.starters)}
- Nombre de joueurs dans l'effectif total : ${myPlayersCount}
- Solde du joueur : ${gp} GP et ${coins} pièces MyClub.

Votre mission :
Donner une évaluation tactique critique mais ultra-motivante en français (maximum 3 paragraphes).
1. Analysez les forces de sa composition (ex: équilibre milieu, vitesse des attaquants ou solidité défensive).
2. Repérez les postes vides (valeur null) ou les points faibles de l'effectif actuel.
3. Donnez une recommandation concrète de joueur légendaire ou superstar moderne à cibler en priorité sur le marché des transferts ou dans les tirages de packs.

Retournez une réponse au format JSON respectant strictement le schéma demandé.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptText,
        config: {
          systemInstruction: "Vous êtes le coach tactique personnel de l'utilisateur sur une application eFootball Pocket Manager. Vous devez formuler vos conseils en français avec passion, expertise et style footballistique de haut niveau. Répondez uniquement en JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              coachName: {
                type: Type.STRING,
                description: "Le nom de l'entraîneur (ex: 'Pep Guardiola', 'Jürgen Klopp' ou 'Carlo Ancelotti')."
              },
              coachAvatarEmoji: {
                type: Type.STRING,
                description: "Un émoji qui représente ce coach."
              },
              tacticalRating: {
                type: Type.INTEGER,
                description: "Une note tactique sur 100 de la composition actuelle."
              },
              analysisParagraphs: {
                type: Type.ARRAY,
                description: "3 paragraphes de conseils tactiques passionnants en français.",
                items: {
                  type: Type.STRING
                }
              },
              recommendedTarget: {
                type: Type.OBJECT,
                properties: {
                  playerName: { type: Type.STRING },
                  reason: { type: Type.STRING, description: "Pourquoi recruter ce joueur spécifiquement en français." }
                },
                required: ["playerName", "reason"]
              }
            },
            required: ["coachName", "coachAvatarEmoji", "tacticalRating", "analysisParagraphs", "recommendedTarget"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText.trim());
      res.json(parsedData);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Erreur de l'analyse tactique de l'IA.", details: error.message });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] eFootball Manager running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
