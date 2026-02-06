<div align="center">

# FindThaGame

**A game discovery tool that helps users find video games based on fuzzy memories and partial details.**

Powered by the [IGDB API](https://api-docs.igdb.com/) and  [Groq AI](https://groq.com/).

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

https://github.com/user-attachments/assets/a6e10484-587e-466a-a8de-b02ac710de9a
</div>

## Features

- 🔍 **Hybrid Multi-Query Search** - Combines strict phrase matching with broad keyword search
- ⭐ **Smart Scoring Algorithm** - Ranks results by relevance instead of just filtering
- 💾 **Save Favorites** - Bookmark games for quick access later
- 🔖 **Recent Searches** - Resume previous searches instantly
- 🎲 **Random Search** - Discover games with randomized filters
- 🌐 **Multi-language** - UI translations with Groq-powered game summaries
- 📱 **Responsive Design** - Works on desktop and mobile

## How the Search Works

When you search, FindThaGame runs two parallel queries:

1. **Strict Query (limit 100)**: Searches for the full phrase in `name` and `alternative_names`.
2. **Broad Query (limit 300)**: Searches individual keywords across `name`, `alternative_names`, `summary`, and `keywords`.

Results are merged, deduplicated, scored, and the top 200 are returned.

## How the Scoring Works

The system calculates a **Total Score** for each game to determine its ranking. Instead of filtering games out, it adds or subtracts points based on how well they match the input.

The calculation happens in **4 steps**:

### 1. Text Score ($S_{text}$)

Checks if the search query appears in the game's text fields.

$$S_{text} = \text{BaseMatch} + (\text{KeywordHits} \cdot 0.4)$$

| Match Type | Field | Points |
| :--- | :--- | :--- |
| **Exact Match** | Title == Query | **+3.0** |
| **Partial Match** | Title contains Query | **+1.5** |
| **Keyword Field** | Matched in `keywords` | **+0.8** |
| **Alt Name** | Matched in `alternative_names` | **+0.5** |
| **Context** | Matched in `summary`/`storyline` | **+0.3** |

*Note: Determining the "BaseMatch" takes the highest scoring single match found.*

### 2. Metadata Score ($S_{meta}$)

Adds points if the game matches the selected filters (Genre, Theme, Mode, Perspective).

$$S_{meta} = \sum \frac{\text{Matching IDs}}{\text{Requested IDs}}$$

*Example: If 2 genres are selected and the game has both, it gets **+1.0** point.*

### 3. Multipliers ($K_{total}$)

Boosts or reduces the score based on critical constraints.

$$K_{total} = K_{plat} \cdot K_{cat} \cdot K_{status} \cdot K_{company}$$

| Filter | Logic | Multiplier | Result |
| :--- | :--- | :--- | :--- |
| **Platform** | Match | **x1.0** | Score stays same |
| | No Match | **x0.3** | Score drops 70% |
| **Category** | Main Game | **x1.0** | Score stays same |
| | DLC (Unwanted) | **x0.5** | Score drops 50% |
| **Status** | Cancelled | **x1.5** | Boost (only if selected) |
| **Company** | Developer | **x2.2** | Huge boost |
| | Publisher | **x1.8** | High boost |
| | Porting | **x1.3** | Medium boost |
| | Supporting | **x1.2** | Small boost |

### 4. Final Calculation

Combines the base score with multipliers and applies final bonuses/penalties.

$$FinalScore = ((S_{text} + S_{meta}) \cdot K_{total}) + A_{bonus}$$

Where $A_{bonus}$ contains:
- **Date:** $-0.1$ points for every year outside the range.
- **Age Rating:** $+0.2$ points if it matches.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Twitch Developer](https://dev.twitch.tv/console/apps) application (for IGDB API access)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kbtale/findthagame.git
   cd findthagame
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment**

   Create a `.env.local` file with your Twitch credentials:

   ```env
   TWITCH_CLIENT_ID=your_client_id
   TWITCH_CLIENT_SECRET=your_client_secret
   AI_API_KEY=your_ai_api_key
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

## Credits

- Game data provided by [IGDB API](https://api-docs.igdb.com/)
- Translations powered by [Groq AI](https://groq.com/)
- Created by [Carlos Bolivar](https://github.com/kbtale)

## Support

If this tool helped you find a lost memory, consider [buying me a coffee](https://ko-fi.com/U7U11S2E9Q) ☕

## License

MIT

<div align="center">
  <i>Disclaimer: This app is not affiliated with IGDB or Twitch.</i>
</div>
