# Essence Mood Tracker

## Overview

The Essence Mood Tracker is an AI-powered application designed to help users explore their inner world through interactive personas, guided rituals, and reflective journaling. It aims to provide a multi-sensory experience that supports emotional well-being, self-discovery, and personal growth. The application features dynamic content generation, personalized experiences, and integration with external services like Spotify for mood-based playlist suggestions.

## Flowchart
<img width="1024" height="1024" alt="ChatGPT Image Jul 28, 2025, 11_10_15 PM" src="https://github.com/user-attachments/assets/1d4f9307-b897-4439-90f0-43cfe378c46e" />

## Technologies and Libraries Used

This project is built with modern web technologies and leverages several key libraries to deliver a rich user experience:

*   **React**: A JavaScript library for building user interfaces.
*   **Next.js**: A React framework for production-grade applications, enabling server-side rendering, static site generation, and API routes.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of reusable components built with Radix UI and Tailwind CSS, providing a beautiful and accessible UI.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **AI SDK (`ai`, `@ai-sdk/openai`)**: For integrating with AI models (e.g., Groq, OpenAI) to power persona conversations and content generation.
*   **`next/navigation` (`useRouter`, `useSearchParams`)**: For client-side routing and managing URL parameters, ensuring proper browser history integration.
*   **`date-fns`**: A comprehensive JavaScript date utility library.
*   **`recharts`**: A composable charting library built with React components.
*   **`zod`**: A TypeScript-first schema declaration and validation library.
*   **`react-hook-form`**: For building flexible and extensible forms with easy validation.
*   **`sonner`**: A modern toast component for React.
*   **`vaul`**: A drawer component for React.

## Architecture

The application follows a component-based architecture, primarily utilizing Next.js's App Router for structure.

*   **`app/`**: Contains the main application routes and layout.
    *   `app/page.tsx`: The main entry point, acting as a router that renders different views based on URL parameters.
    *   `app/api/chat/route.ts`: An API route that handles AI model interactions for persona conversations.
*   **`components/`**: Houses all reusable React components, categorized by their function (e.g., `ui/` for shadcn components, `hero-section.tsx`, `persona-chat.tsx`, `ritual-experience.tsx`).
*   **`lib/`**: Contains utility functions, data, and service integrations.
    *   `lib/personas.ts`: Defines the different AI personas with their characteristics.
    *   `lib/conversation-manager.ts`: Manages conversation history and persona memory.
    *   `lib/spotify-service.ts`: Handles Spotify API interactions for playlist generation.
    *   `lib/utils.ts`: General utility functions (e.g., `cn` for Tailwind class merging).
*   **`types/`**: Defines TypeScript interfaces and types used across the application.

**Data Flow and Interactions:**

1.  **`app/page.tsx`**: This component acts as the central navigation hub. It reads the `view` and `persona` query parameters from the URL using `useSearchParams` and conditionally renders the appropriate main component (e.g., `HeroSection`, `PersonaChat`, `RitualExperience`).
2.  **Navigation**: All navigation within the app (e.g., selecting a persona, opening a journal) is handled by updating URL parameters using `useRouter().push()`. This ensures that the browser's history is maintained, allowing the back button to work.
3.  **Persona Chat (`components/persona-chat.tsx`)**:
    *   Sends user messages to the `app/api/chat/route.ts` API.
    *   Receives streaming responses from the AI model.
    *   Manages conversation history and displays messages.
4.  **API Route (`app/api/chat/route.ts`)**:
    *   Receives chat prompts from the frontend.
    *   Interacts with the AI SDK to communicate with the configured AI model (e.g., Groq).
    *   Processes persona-specific logic (e.g., memory, learning) using `lib/conversation-manager.ts`.
    *   Streams AI responses back to the client.
5.  **Ritual Experience (`components/ritual-experience.tsx`)**:
    *   Triggers a multi-sensory ritual based on the selected persona.
    *   Guides the user through phases (e.g., voice guidance, journaling).
    *   Awards points and saves ritual completion data.
6.  **Local Storage**: User-specific data like `userPoints`, `unlockedShadows`, and `currentMood` are persisted in the browser's `localStorage` for a continuous experience.

## Navigation Structure

The application's navigation is URL-based, providing a robust and shareable experience.

*   **Home (`/` or `/?view=hero`)**: Displays the `HeroSection` where users can select a persona.
*   **Persona Chat (`/?view=chat&persona=[personaId]`)**: After selecting a persona, users are directed to the chat interface with that persona.
*   **Ritual Experience (`/?view=ritual&persona=[personaId]`)**: Initiated from the Creative Studio, this view guides users through a ritual.
*   **Settings Panel (`/?view=settings`)**: Accessible from the Creative Studio, allows users to configure application settings.
*   **Persona Training (`/?view=training`)**: Accessible from the Creative Studio, provides an interface for persona training.
*   **Shadow Unlock (`/?view=shadow-unlock`)**: Accessible from the Creative Studio, allows users to unlock "shadows" using earned points.
*   **Mood Journal (`/?view=mood-journal`)**: Accessible from the Hero Section or Creative Studio, allows users to log their mood and insights.
*   **Dreamscape Explorer (`/?view=dreamscape`)**: Accessible from the Creative Studio, provides a space for dream exploration.

The browser's back button is fully functional, allowing users to navigate through their history.

## Setup and Running the Application

To get this project up and running on your local machine, follow these steps:

### Prerequisites

*   Node.js (v18.x or higher)
*   npm or Yarn

### Installation

1.  **Clone the repository:**
    \`\`\`bash
    git clone https://github.com/yashis-projects-f0477467/Essence_mood_tracker-bn.git
    cd Essence_mood_tracker-bn
    \`\`\`

2.  **Install dependencies:**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

### Running the Application

1.  **Start the development server:**
    \`\`\`bash
    npm run dev
    # or
    yarn dev
    \`\`\`

2.  Open your browser and navigate to `http://localhost:3000`.

## Configuration

This project requires certain API keys and environment variables for full functionality. These should be stored securely and not committed directly to your repository.

Create a `.env.local` file in the root of your project and add the following variables:

\`\`\`
# Groq API Key for AI model interactions
GROQ_API_KEY=your_groq_api_key_here

# Spotify API Keys (if Spotify integration is enabled and requires direct API access)
# SPOTIFY_CLIENT_ID=your_spotify_client_id_here
# SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
\`\`\`

**Purpose of Environment Variables:**

*   **`GROQ_API_KEY`**: This key is essential for the `app/api/chat/route.ts` to communicate with the Groq AI model, enabling persona conversations and dynamic content generation. Without this, the AI chat functionality will not work.
*   **`SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`**: (Optional, depending on the exact Spotify integration method) These keys would be used to authenticate with the Spotify API if direct server-side calls are made for more advanced features beyond simple URL generation.

**Security Note**: Never expose your API keys directly in client-side code. Always use environment variables and access them on the server-side (e.g., within Next.js API routes) or through secure build processes.

## Usage Examples

### 1. Selecting a Persona and Chatting

1.  On the home screen, click on a persona card (e.g., "Aurora").
2.  You will be taken to the persona's chat interface.
3.  Type your message in the input field and press Enter or click the send button.
4.  The persona will respond based on its personality and learned preferences.

### 2. Engaging in a Ritual

1.  From a persona's chat screen, click the "Ritual" button in the Creative Studio panel.
2.  The screen will transition to a full-screen ritual experience.
3.  Follow the persona's voice guidance and complete the journaling prompts.
4.  Upon completion, you will earn points, and the ritual will be saved to your history.

### 3. Journaling Your Mood

1.  From the home screen or Creative Studio, click the "Mood Journal" button.
2.  Record your current mood and any insights or reflections.
3.  Submit your entry to track your emotional journey over time.

### 4. Unlocking Shadows

1.  From a persona's chat screen, click the "Shadow Unlock" button in the Creative Studio panel.
2.  If you have enough points, you can unlock new "shadow" aspects, which might influence future persona interactions or unlock new features.

## Contribution Guidelines

We welcome contributions to enhance the Essence Mood Tracker! If you'd like to contribute, please follow these guidelines:

1.  **Fork the repository**: Start by forking the `Essence_mood_tracker-bn` repository to your GitHub account.
2.  **Create a new branch**: For each new feature or bug fix, create a dedicated branch from `main`. Use descriptive names (e.g., `feature/add-dark-mode`, `fix/back-button-issue`).
    \`\`\`bash
    git checkout -b feature/your-feature-name
    \`\`\`
3.  **Make your changes**: Implement your feature or fix, adhering to the existing coding style and best practices.
    *   **Code Standards**: Follow ESLint and Prettier configurations.
    *   **TypeScript**: Ensure strong typing where applicable.
    *   **Accessibility**: Prioritize accessible design and semantic HTML.
    *   **Responsiveness**: Ensure your changes are responsive across different screen sizes.
4.  **Test your changes**: Before submitting, thoroughly test your changes to ensure they work as expected and don't introduce new bugs.
5.  **Commit your changes**: Write clear, concise commit messages that explain what your changes do.
    \`\`\`bash
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve bug Y"
    \`\`\`
6.  **Push to your fork**:
    \`\`\`bash
    git push origin feature/your-feature-name
    \`\`\`
7.  **Open a Pull Request (PR)**:
    *   Go to the original `Essence_mood_tracker-bn` repository on GitHub.
    *   Click on "New pull request".
    *   Select your branch and provide a detailed description of your changes.
    *   Reference any related issues.

We appreciate your contributions!
