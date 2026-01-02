<div align="center">

# FindThaGame 🎮

**A game discovery tool that helps users find video games based on fuzzy memories and partial details.** Powered by the [IGDB API](https://api-docs.igdb.com/).

![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 🚀 Features

- **Smart Search:** Search by title, keywords, storyline fragments, or alternative names using fuzzy matching logic.
- **Memory Anchors:** Narrow results using remembered details like platform, perspective, game mode, genre, theme, and release year.
- **Dynamic Scoring:** A sophisticated algorithm ranks results based on intention, prioritizing "perfect matches" while preserving "partial memories."
- **Rich Game Details:** View high-res covers, screenshots, summaries, ratings, and company roles.

## 🧠 How It Works: The Scoring Algorithm

FindThaGame uses a custom **Additive Relevance Algorithm** to rank games. Unlike standard database queries, this system doesn't just filter; it *weighs* every potential match to determine the probability of it being the game you remember.

The Final Score is calculated in **4 stages**:

### 1. Textual Relevance ($S_{text}$)
We analyze how well the query matches various text fields.

$$S_{text} = (M_{name} \cdot 1.5 \cdot B_{exact}) + (M_{alt} \cdot 0.5) + (M_{kw} \cdot 0.8) + (M_{ctx} \cdot 0.3)$$

| Variable | Definition | Weight |
| :--- | :--- | :--- |
| $M_{name}$ | Query found in Title | **1.5** |
| $B_{exact}$ | Exact Match Multiplier | **x2.0** (if 100% match) |
| $M_{kw}$ | Query found in Keywords | **0.8** |
| $M_{alt}$ | Query found in Alt Names | **0.5** |
| $M_{ctx}$ | Query found in Summary/Story | **0.3** |

### 2. Metadata Overlap ($S_{meta}$)
If filters (Genre, Theme, Mode, Perspective) are applied, we calculate an overlap coefficient.

$$S_{meta} = \sum \frac{\text{Matching IDs}}{\text{Requested IDs}}$$

*Example: If you ask for 2 genres and the game has both, it adds **+1.0** to the score.*

### 3. Filter Multipliers ($K_{total}$)
This stage applies "Boosts" or "Penalties" based on critical constraints.

$$K_{total} = K_{plat} \cdot K_{cat} \cdot K_{status} \cdot K_{company}$$

| Filter | Logic | Multiplier | Effect |
| :--- | :--- | :--- | :--- |
| **Platform** | Match | **x1.0** | Neutral |
| | No Match | **x0.3** | **Heavy Penalty** |
| **Category** | Main Game | **x1.0** | Neutral |
| | Unwanted DLC | **x0.5** | Moderate Penalty |
| **Company** | **Developer** | **x2.2** | **Massive Boost** |
| | **Publisher** | **x1.8** | High Boost |
| | Porting | **x1.3** | Medium Boost |
| | Supporting | **x1.2** | Low Boost |
| | No Match | **x1.0** | Neutral |

### 4. Final Calculation
The Master Formula combines the Weighted Base Score with additive bonuses for Date and Rating.

$$FinalScore = ((S_{text} + S_{meta}) \cdot K_{total}) + A_{bonos}$$

Where $A_{bonos}$ includes:
- **Date Penalty:** $-0.1$ for every year outside the requested range.
- **Age Rating:** $+0.2$ if the rating organization/category matches.
- **Tie Breaker:** Adds fractional points based on the game's total rating.

---

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- A [Twitch Developer](https://dev.twitch.tv/console/apps) application (for IGDB API access)

### Installation

1. **Clone the repository**

    git clone [https://github.com/your-username/FindThaGame.git](https://github.com/your-username/FindThaGame.git)
    cd FindThaGame

2. **Install dependencies**

    npm install

3. **Configure Environment**
   Create a `.env.local` file with your Twitch credentials:

    TWITCH_CLIENT_ID=your_client_id
    TWITCH_CLIENT_SECRET=your_client_secret

4. **Run Development Server**

    npm run dev

## 📄 License

MIT