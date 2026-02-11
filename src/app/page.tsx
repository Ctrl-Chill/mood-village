"use client";

import { useState } from "react";

export default function Home() {
  const [moodLevel, setMoodLevel] = useState(3);
  const [encouragement, setEncouragement] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Optional: Add your Hugging Face API token for better rate limits
  // Get it from: https://huggingface.co/settings/tokens
  const HF_API_TOKEN = ""; // Leave empty for free tier (no token needed)

  const moodEmojis = {
    1: "😢",
    2: "😔",
    3: "😐",
    4: "🙂",
    5: "😄",
  };

  const moodLabels = {
    1: "Very Sad",
    2: "Down",
    3: "Neutral",
    4: "Good",
    5: "Amazing",
  };

  // Prompts for Hugging Face model
  const prompts = {
    1: "Write a warm and comforting message for someone feeling very sad. Remind them they are valued and that brighter days are ahead.",
    2: "Write an encouraging message for someone having a difficult day. Be empathetic and supportive.",
    3: "Write a supportive message for someone feeling neutral. Encourage them to keep a positive outlook.",
    4: "Write an uplifting message for someone feeling good. Celebrate their positive mood and encourage them.",
    5: "Write an enthusiastic message for someone feeling amazing and happy. Encourage them to keep spreading joy.",
  };

  const getEncouragementHF = async () => {
    setIsLoading(true);
    setEncouragement("");

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      // Add token if provided
      if (HF_API_TOKEN) {
        headers["Authorization"] = `Bearer ${HF_API_TOKEN}`;
      }

      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            inputs: prompts[moodLevel as keyof typeof prompts],
            parameters: {
              max_new_tokens: 100,
              temperature: 0.8,
              top_p: 0.95,
              return_full_text: false,
            },
          }),
        }
      );

      const data = await response.json();

      // Handle different response formats
      if (data && data[0] && data[0].generated_text) {
        let message = data[0].generated_text.trim();
        
        // Clean up the message - remove any incomplete sentences
        const sentences = message.split(". ");
        if (sentences.length > 1) {
          message = sentences.slice(0, -1).join(". ") + ".";
        }
        
        setEncouragement(message);
      } else if (data.error) {
        // Handle rate limits or errors with fallback
        setEncouragement(getFallbackMessage(moodLevel));
      } else {
        setEncouragement(getFallbackMessage(moodLevel));
      }
    } catch (error) {
      console.error("Error:", error);
      setEncouragement(getFallbackMessage(moodLevel));
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback messages in case API fails or is rate-limited
  const getFallbackMessage = (mood: number): string => {
    const fallbackQuotes = {
      1: "You're going through a tough time, but remember: you are strong, valued, and this feeling will pass. Brighter days are ahead. 💙",
      2: "Today might be hard, but you're doing better than you think. Take it one step at a time, and be kind to yourself. 🌈",
      3: "You're doing just fine! Sometimes neutral is okay - it means you're steady and balanced. Keep moving forward! ⚖️",
      4: "Your positive energy is wonderful! Keep nurturing that good feeling and let it guide you through the day. ✨",
      5: "You're absolutely glowing with happiness! This amazing energy you have is contagious - share it with the world! 🌟",
    };
    return fallbackQuotes[mood as keyof typeof fallbackQuotes];
  };

  return (
    <section className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border-2 border-[#314966] bg-[#dce9f8] p-8 shadow-[0_8px_20px_rgba(39,64,92,0.18)]">
        {/* Header */}
        <div className="text-center">
          <p className="text-xl font-black text-[#15263d] sm:text-2xl">
            Hi, how are you today?
          </p>
          <p className="mt-2 text-sm text-[#355072]">
            1 is super sad and 5 is super happy.
          </p>
        </div>

        {/* Emoji Display */}
        <div className="mt-6 flex justify-center">
          <span className="text-6xl transition-transform duration-300 hover:scale-110">
            {moodEmojis[moodLevel as keyof typeof moodEmojis]}
          </span>
        </div>

        {/* Mood Label */}
        <p className="mt-3 text-center text-lg font-semibold text-[#1d3048]">
          Feeling {moodLabels[moodLevel as keyof typeof moodLabels]}
        </p>

        {/* Slider */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm font-semibold text-[#1d3048]">
            <span>Mood level</span>
            <span>{moodLevel} / 5</span>
          </div>
          <input
            aria-label="Mood level"
            className="mt-4 w-full accent-[#314966]"
            type="range"
            min={1}
            max={5}
            step={1}
            value={moodLevel}
            onChange={(event) => setMoodLevel(Number(event.target.value))}
          />
          <div className="mt-2 flex justify-between text-[11px] text-[#5f7fa3]">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Get Encouragement Button */}
        <div className="mt-8">
          <button
            onClick={getEncouragementHF}
            disabled={isLoading}
            className="w-full rounded-xl border-2 border-[#314966] bg-[#27405c] px-6 py-3 font-bold text-white shadow-md transition-all duration-200 hover:bg-[#1d3048] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating...
              </span>
            ) : (
              "✨ Get AI Encouragement ✨"
            )}
          </button>
        </div>

        {/* Encouragement Message */}
        {encouragement && (
          <div className="mt-6 animate-fadeIn rounded-xl border-l-4 border-[#314966] bg-white/60 p-6 shadow-sm">
            <p className="text-sm font-medium italic leading-relaxed text-[#1d3048]">
              "{encouragement}"
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </section>
  );
}
