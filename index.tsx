import { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { Send, RefreshCw, ThumbsDown, Save, Languages, Sparkles } from "lucide-react";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Type definitions
type Message = {
  role: "user" | "model";
  text: string;
};

type DictionaryEntry = {
  original: string;
  translated: string;
};

// Updated Dictionary based on user specific examples (Italian-French mix + Facebook posts)
const INITIAL_DICTIONARY: DictionaryEntry[] = [
  // User specific updates (Multi-input support)
  { original: "panino", translated: "le panin" }, // IT
  { original: "motorino", translated: "le motorin" }, // IT
  { original: "mobylette", translated: "le motorin" }, // FR
  { original: "beccamose", translated: "beccon-nous" }, // Roman Authentic
  { original: "becchiamoci", translated: "beccon-nous" }, // IT Standard
  { original: "mortacci", translated: "mortache" }, // Roman
  { original: "bonjour", translated: "salut" },
  { original: "ça va", translated: "va tout bien" },
  { original: "merci", translated: "grazie" },
  
  // Transport & Objects
  { original: "vélo", translated: "la bitchiclette" },
  { original: "bicicletta", translated: "la bitchiclette" },
  { original: "voiture", translated: "la makkine" },
  { original: "macchina", translated: "la makkine" },
  { original: "embrayage", translated: "la friction" },
  { original: "frizione", translated: "la friction" },
  { original: "antivol", translated: "le blocsterze" },
  { original: "bloccasterzo", translated: "le blocsterze" },
  { original: "feu rouge", translated: "le sémaphore" },
  { original: "semaforo", translated: "le sémaphore" },
  { original: "pavés", translated: "les saints-pétrins" },
  { original: "sanpietrini", translated: "les saints-pétrins" },
  { original: "arrêt", translated: "la fermate" },
  { original: "fermata", translated: "la fermate" },
  { original: "bus", translated: "le poulmin" }, // school bus
  { original: "pulmino", translated: "le poulmin" },
  
  // School
  { original: "sac à dos", translated: "le zaine" },
  { original: "zaino", translated: "le zaine" },
  { original: "cartable", translated: "la cartelle" },
  { original: "cartella", translated: "la cartelle" },
  { original: "trousse", translated: "l'astouche" },
  { original: "astuccio", translated: "l'astouche" },
  { original: "concierge", translated: "le portier" },
  { original: "portiere", translated: "le portier" },
  { original: "tableau", translated: "la lavagne" },
  { original: "lavagna", translated: "la lavagne" },
  { original: "cloche", translated: "la campanelle" },
  { original: "campanella", translated: "la campanelle" },
  { original: "retard", translated: "ritard" },
  { original: "ritardo", translated: "ritard" },
  { original: "sécher les cours", translated: "sécher la classe" },
  { original: "marinare", translated: "sécher la classe" },
  { original: "interroger", translated: "fréguer" },
  { original: "fregare", translated: "fréguer" },
  { original: "recaler", translated: "bocher" },
  { original: "bocciare", translated: "bocher" },
  { original: "baccalauréat", translated: "la maturité" },
  { original: "maturità", translated: "la maturité" },
  
  // Food & Drink
  { original: "sandwich", translated: "le panin" },
  { original: "tramezzino", translated: "le tramezin" },
  { original: "chips", translated: "les patatines" },
  { original: "patatine", translated: "les patatines" },
  { original: "fromage", translated: "le formage" },
  { original: "formaggio", translated: "le formage" },
  { original: "vin", translated: "le vin" },
  { original: "vino", translated: "le vin" },
  { original: "café", translated: "caffè" },
  { original: "cappuccino", translated: "le capouchin" },
  { original: "boisson", translated: "la bibite" },
  { original: "bibita", translated: "la bibite" },
  { original: "goûter", translated: "la mérande" },
  { original: "merenda", translated: "la mérande" },
  { original: "croissant", translated: "la cornette" },
  { original: "cornetto", translated: "la cornette" },
  { original: "tire-bouchon", translated: "le cavatappe" },
  { original: "cavatappi", translated: "le cavatappe" },
  { original: "dégoutant", translated: "schifeuse" },
  { original: "schifoso", translated: "schifeuse" },
  
  // Objects & Daily Life
  { original: "parapluie", translated: "l'ombrelle" },
  { original: "ombrello", translated: "l'ombrelle" },
  { original: "mouchoir", translated: "le fatzolette" },
  { original: "fazzoletto", translated: "le fatzolette" },
  { original: "radiateur", translated: "le termosiphon" },
  { original: "termosifone", translated: "le termosiphon" },
  { original: "mensonge", translated: "une bougie" }, 
  { original: "bugia", translated: "une bougie" },
  { original: "excuse", translated: "une scuse" },
  { original: "scusa", translated: "une scuse" },
  { original: "magazine", translated: "une riviste" },
  { original: "rivista", translated: "une riviste" },
  { original: "argent", translated: "les soldes" },
  { original: "soldi", translated: "les soldes" },
  { original: "blague", translated: "un skerze" },
  { original: "scherzo", translated: "un skerze" },
  { original: "lacets", translated: "les laces" },
  { original: "lacci", translated: "les laces" },
  { original: "chaussures", translated: "les scarpes" },
  { original: "scarpe", translated: "les scarpes" },
  { original: "blouson", translated: "le jaquon" },
  { original: "giaccone", translated: "le jaquon" },
  { original: "t-shirt", translated: "la magliette" },
  { original: "maglietta", translated: "la magliette" },
  { original: "douche", translated: "la doche" },
  { original: "doccia", translated: "la doche" },
  { original: "éponge", translated: "la spougnette" },
  { original: "spugnetta", translated: "la spougnette" },
  { original: "savon", translated: "le sapon" },
  { original: "sapone", translated: "le sapon" },
  { original: "parfum", translated: "le profum" },
  { original: "profumo", translated: "le profum" },
  { original: "mariage", translated: "le matrimoine" },
  { original: "matrimonio", translated: "le matrimoine" },
  { original: "timbre", translated: "le francobolle" },
  { original: "francobollo", translated: "le francobolle" },
  { original: "enveloppe", translated: "le buste" },
  { original: "busta", translated: "le buste" },
  { original: "lessive", translated: "le bouquet" },
  { original: "bucato", translated: "le bouquet" },
  { original: "draps", translated: "les linceuils" },
  { original: "lenzuola", translated: "les linceuils" },
  { original: "slips", translated: "les mutants" },
  { original: "mutande", translated: "les mutants" },
  { original: "plombier", translated: "l'hydrôlique" },
  { original: "idraulico", translated: "l'hydrôlique" },
  { original: "salle de bain", translated: "le bagne" },
  { original: "bagno", translated: "le bagne" },
  { original: "sieste", translated: "le pisolin" },
  { original: "pisolino", translated: "le pisolin" },
  { original: "fauteuil", translated: "la poltrone" },
  { original: "poltrona", translated: "la poltrone" },
  { original: "moelleux", translated: "morbide" },
  { original: "morbido", translated: "morbide" },
  { original: "boutons", translated: "les brufols" },
  { original: "brufoli", translated: "les brufols" },
  
  // People & Adjectives
  { original: "ami", translated: "l'amic" },
  { original: "amico", translated: "l'amic" },
  { original: "copine", translated: "la fidenzette" },
  { original: "fidanzata", translated: "la fidenzette" },
  { original: "grand-mère", translated: "la nonne" },
  { original: "nonna", translated: "la nonne" },
  { original: "racaille", translated: "le coatte" },
  { original: "coatto", translated: "le coatte" },
  { original: "étranger", translated: "forestier" },
  { original: "forestiero", translated: "forestier" },
  { original: "gentil", translated: "carin" },
  { original: "carino", translated: "carin" },
  { original: "fatigué", translated: "stanc" },
  { original: "stanco", translated: "stanc" },
  { original: "sale", translated: "sporque" },
  { original: "sporco", translated: "sporque" },
  { original: "bondé", translated: "affolé" },
  { original: "affollato", translated: "affolé" },

  // Verbs & Actions
  { original: "allons", translated: "andons" },
  { original: "andiamo", translated: "andons" },
  { original: "marchons", translated: "caminons" },
  { original: "camminiamo", translated: "caminons" },
  { original: "pleuvoir", translated: "diluver" },
  { original: "diluviare", translated: "diluver" },
  { original: "se mouiller", translated: "se bagner" },
  { original: "bagnarsi", translated: "se bagner" },
  { original: "sécher", translated: "asciouguer" },
  { original: "asciugare", translated: "asciouguer" },
  { original: "écrire", translated: "scriver" },
  { original: "scrivere", translated: "scriver" },
  { original: "allumer", translated: "atchendre" },
  { original: "accendere", translated: "atchendre" },
  { original: "casser", translated: "rompre" },
  { original: "rompere", translated: "rompre" },
  { original: "rager", translated: "rosiquer" },
  { original: "rosicare", translated: "rosiquer" },
  { original: "attraper", translated: "acchiapper" },
  { original: "acchiappare", translated: "acchiapper" },
  { original: "tuer", translated: "ammazzer" },
  { original: "ammazzare", translated: "ammazzer" },
  { original: "se précipiter", translated: "se fionder" },
  { original: "fiondarsi", translated: "se fionder" },
  { original: "voler", translated: "rouber" },
  { original: "rubare", translated: "rouber" },
  { original: "se changer", translated: "se camber" },
  { original: "cambiarsi", translated: "se camber" },
  { original: "jouer", translated: "gioquer" },
  { original: "giocare", translated: "gioquer" },
  { original: "renvoyer", translated: "remander" },
  { original: "rimandare", translated: "remander" },
  { original: "glisser", translated: "scivoler" },
  { original: "scivolare", translated: "scivoler" },
  { original: "tomber", translated: "casquer" },
  { original: "cascare", translated: "casquer" },
  { original: "danser", translated: "baller" },
  { original: "ballare", translated: "baller" },
  { original: "essayer", translated: "prouver" },
  { original: "provare", translated: "prouver" },
  { original: "s'incruster", translated: "s'embuquer" },
  { original: "imbucarsi", translated: "s'embuquer" },
  { original: "se voir", translated: "se béquer" },
  { original: "beccarsi", translated: "se béquer" },
  { original: "atterrir", translated: "atterrer" },
  { original: "atterrare", translated: "atterrer" },
  { original: "comprendre", translated: "capiter" },
  { original: "capire", translated: "capiter" },
  { original: "arrêter", translated: "fermer" },
  { original: "fermare", translated: "fermer" },
  { original: "écraser", translated: "investir" },
  { original: "investire", translated: "investir" },
  { original: "conduire", translated: "guider" },
  { original: "guidare", translated: "guider" },
  { original: "appuyer", translated: "squiatcher" },
  { original: "schiacciare", translated: "squiatcher" },
  { original: "se dépêcher", translated: "se sbriguer" },
  { original: "sbrigarsi", translated: "se sbriguer" },
  { original: "embêter", translated: "casser les boîtes" },
  { original: "rompere le scatole", translated: "casser les boîtes" },
];

const App = () => {
  // State
  const [dictionary, setDictionary] = useState<DictionaryEntry[]>(INITIAL_DICTIONARY);
  const [translatorInput, setTranslatorInput] = useState("");
  const [translatorResult, setTranslatorResult] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [correctionInput, setCorrectionInput] = useState("");
  
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Bella les gars, on se bèque ici pour cazzéger un peu ! 😂" }
  ]);
  const [isChatting, setIsChatting] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refined System Instruction for the "Italian-French" logic
  const getSystemInstruction = () => {
    const dictString = dictionary.map(d => `"${d.original}" se traduit par "${d.translated}"`).join("\n");
    return `
      Tu es un moteur de traduction et de chat pour la langue "Chateaubrianais" (le dialecte du Lycée Chateaubriand de Rome).
      
      TA MISSION :
      Traduire n'importe quelle entrée (Français, Italien, ou Dialecte Romain) vers le CHATEAUBRIANAIS.

      RÈGLES GRAMMATICALES ET VOCABULAIRE DU CHATEAUBRIANAIS :
      1. C'est un mélange de Français et d'Italien, avec une forte influence du dialecte Romain ("Romanesco").
      2. RÈGLE D'OR : Le résultat doit sonner "Français" mais avec une racine Italienne.
         - Si l'entrée est Italienne (ex: "Motorino"), on "francise" en "Motorin".
         - Si l'entrée est Française (ex: "Mobylette"), on utilise le mot Chateaubrianais (qui est souvent l'italien francisé: "Motorin").
         - Si l'entrée est Romaine (ex: "Beccamose"), on conjugue en pseudo-français ("Beccon-nous").
         - Ex: "Mortacci" -> "Mortache".
         - Ex: "Panino" -> "Panin".
      
      3. FAUX AMIS (TRES IMPORTANT) :
         - "Bougie" veut dire "Mensonge" (Bugia).
         - "Soldes" veut dire "Argent" (Soldi).
         - "Bagne" veut dire "Salle de bain" (Bagno).
         - "Affolé" veut dire "Bondé" (Affollato).
         - "Gare" veut dire "Compétition" (Gara).
         - "Morbide" veut dire "Moelleux" (Morbido).
         - "Linceuil" veut dire "Drap" (Lenzuolo).
         - "Mutants" veut dire "Slips/Caleçons" (Mutande).
         - "Femme sapée" veut dire "Fais-moi savoir" (Fammi sapè).

      4. EXPRESSIONS TYPIQUES :
         - "Casser les boîtes" (Rompere le scatole - Embêter).
         - "Se béquer" (Beccarsi - Se voir/croiser).
         - "S'embuquer" (Imbucarsi - S'incruster).
         - "Avoir frette" (Avere fretta - Être pressé).
         - "Rosiquer" (Rosicare - Rager/Jalouser).
         - "Ne savoir de rien" (Non sapere di niente - N'avoir aucun goût).
      
      5. Sois BREF, DROLE, et utilise un ton "Lycéen romain". Utilise des emojis.

      DICTIONNAIRE DE RÉFÉRENCE (Prioritaire - Si un mot est ici, utilise la traduction fournie) :
      ${dictString}

      Si l'utilisateur demande une traduction, donne UNIQUEMENT le mot ou la phrase traduite en Chateaubrianais. Pas d'explication.
    `;
  };

  // --- Translator Logic ---

  const handleTranslate = async () => {
    if (!translatorInput.trim()) return;
    setIsTranslating(true);
    setTranslatorResult("");
    setShowCorrection(false);

    try {
      const prompt = `Traduire ce mot ou cette courte phrase (qui peut être en Italien, Romain ou Français) vers le Chateaubrianais.
      
      Exemples de logique attendue :
      - Input: "Panino" (IT) -> Output: "Le Panin"
      - Input: "Mobylette" (FR) -> Output: "Le Motorin"
      - Input: "Mortacci" (ROM) -> Output: "Mortache"
      - Input: "Beccamose" (ROM) -> Output: "Beccon-nous"
      
      INPUT UTILISATEUR: "${translatorInput}". 
      
      Donne seulement le résultat traduit.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: getSystemInstruction(),
          temperature: 0.3,
        }
      });

      setTranslatorResult(response.text?.trim() || "Erreur.");
    } catch (error) {
      console.error("Translation error", error);
      setTranslatorResult("Erreur technique.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSuggestCorrection = () => {
    if (!correctionInput.trim() || !translatorInput.trim()) return;
    
    // Add to dictionary
    const newEntry = { original: translatorInput.trim().toLowerCase(), translated: correctionInput.trim() };
    setDictionary(prev => [...prev, newEntry]);
    
    alert(`Merci. Mémorisé : "${translatorInput}" = "${correctionInput}".`);
    
    setShowCorrection(false);
    setCorrectionInput("");
    setTranslatorResult(correctionInput); 
  };

  // --- Chat Logic ---

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setIsChatting(true);

    try {
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: getSystemInstruction(),
        },
        history: messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))
      });

      const result = await chat.sendMessage({ message: userMsg });
      const text = result.text;

      setMessages(prev => [...prev, { role: "model", text: text || "..." }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: "model", text: "Erreur systèm." }]);
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto">
      
      {/* Header removed as per request to avoid redundancy in iframe */}

      {/* Translator Section (Top) */}
      <section className="w-full bg-white rounded-2xl shadow-xl p-6 mb-8 border border-slate-100">
        <div className="flex items-center gap-2 mb-4 text-blue-900">
          <Languages className="w-5 h-5" />
          <h2 className="text-lg font-bold uppercase tracking-wide">Traduction Instantanée</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Italien / Romain / Français</label>
            <textarea 
              value={translatorInput}
              onChange={(e) => setTranslatorInput(e.target.value)}
              placeholder="Ex: Panino, Mobylette, Beccamose..."
              className="w-full h-24 p-3 rounded-lg border border-slate-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-900 focus:outline-none resize-none transition-all shadow-sm"
            />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Chateaubrianais</label>
            <div className="w-full h-24 p-3 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-center relative shadow-sm">
              {isTranslating ? (
                <div className="flex items-center justify-center h-full text-blue-900">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <p className={`text-xl font-medium text-center ${translatorResult ? 'text-blue-950' : 'text-slate-400 italic'}`}>
                  {translatorResult || "..."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Translator Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <button 
            onClick={handleTranslate}
            disabled={isTranslating || !translatorInput}
            className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-full font-bold transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {isTranslating ? "..." : "Traduire"}
            <Sparkles className="w-4 h-4" />
          </button>

          {translatorResult && !showCorrection && (
            <button 
              onClick={() => setShowCorrection(true)}
              className="text-sm text-red-600 hover:text-red-700 transition-colors flex items-center gap-1 font-medium"
            >
              <ThumbsDown className="w-4 h-4" />
              Correction manuelle
            </button>
          )}
        </div>

        {/* Correction Form - Updated to Red theme */}
        {showCorrection && (
          <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-sm font-bold text-red-900 mb-2">Suggérer une meilleure traduction</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text"
                value={correctionInput}
                onChange={(e) => setCorrectionInput(e.target.value)}
                placeholder="Mot correct..."
                className="flex-1 p-2 border border-red-200 rounded-md focus:outline-none focus:border-red-500 bg-white text-slate-900 shadow-sm"
              />
              <button 
                onClick={handleSuggestCorrection}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                Apprendre
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Chat Section (Bottom) */}
      <section className="w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-[400px]">
        {/* Chat Header - Dark Blue */}
        <div className="bg-blue-900 p-4 border-b border-blue-800 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
          <h2 className="font-bold text-white">Chat</h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm md:text-base font-medium ${
                  msg.role === "user" 
                    ? "bg-blue-900 text-white rounded-tr-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                 <div className="flex gap-1">
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                 </div>
               </div>
             </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
              placeholder="Scrivez ici..."
              className="flex-1 p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-900 focus:outline-none transition-all bg-white text-slate-900 shadow-sm"
            />
            <button 
              onClick={handleChatSend}
              disabled={isChatting || !chatInput}
              className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-colors disabled:opacity-50 shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <footer className="mt-8 text-center text-blue-900/60 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} ADALC - Alliance des Anciens Élèves du Lycée Chateaubriand de Rome.</p>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);