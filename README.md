<div align="center">

# FindThaGame

**A game discovery tool that helps users find video games based on fuzzy memories and partial details.**

Powered by the [IGDB API](https://api-docs.igdb.com/).

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

## How the Scoring Works

The system calculates a **Total Score** for each game to determine its ranking. Instead of filtering games out, it adds or subtracts points based on how well they match the input.

The calculation happens in **4 steps**:

### 1. Text Score ($S_{text}$)
Checks if the search query appears in the game's text fields.

$$S_{text} = (M_{name} \cdot 1.5 \cdot B_{exact}) + (M_{alt} \cdot 0.5) + (M_{kw} \cdot 0.8) + (M_{ctx} \cdot 0.3)$$

| Variable | Definition | Points |
| :--- | :--- | :--- |
| $M_{name}$ | Query found in Title | **+1.5** |
| $B_{exact}$ | Exact Title Match | **x2.0** multiplier |
| $M_{kw}$ | Query found in Keywords | **+0.8** |
| $M_{alt}$ | Query found in Alt Names | **+0.5** |
| $M_{ctx}$ | Query found in Summary | **+0.3** |

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
| **Company** | Developer | **x2.2** | Score doubles |
| | Publisher | **x1.8** | High boost |
| | Porting | **x1.3** | Medium boost |
| | Supporting | **x1.2** | Small boost |
| | No Match | **x1.0** | Score stays same |

### 4. Final Calculation
Combines the base score with multipliers and applies final bonuses/penalties.

$$FinalScore = ((S_{text} + S_{meta}) \cdot K_{total}) + A_{bonus}$$

Where $A_{bonus}$ contains:
- **Date:** $-0.1$ points for every year outside the range.
- **Age Rating:** $+0.2$ points if it matches.
- **Tie Breaker:** Adds `rating / 1000` to sort games with equal scores.

## Getting Started

### Prerequisites

- Node.js 18+
- A [Twitch Developer](https://dev.twitch.tv/console/apps) application (for IGDB API access)

### Installation

1. **Clone the repository**

    git clone https://github.com/your-username/FindThaGame.git
    cd FindThaGame

2. **Install dependencies**

    npm install

3. **Configure Environment**

   Create a `.env.local` file with your Twitch credentials:

   TWITCH_CLIENT_ID=your_client_id

   TWITCH_CLIENT_SECRET=your_client_secret

5. **Run Development Server**

    npm run dev

## License

MIT
