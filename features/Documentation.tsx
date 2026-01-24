import React from 'react';
import { Layers, Cpu, Bot, Palette, UserCheck, KeyRound, Settings, Globe } from 'lucide-react';

const Section: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="mb-12">
    <div className="flex items-center mb-4">
      <Icon className="w-8 h-8 text-[var(--header-text)] mr-4 flex-shrink-0" />
      <h3 className="text-3xl font-pixel text-[var(--text-color)]">{title}</h3>
    </div>
    <div className="prose prose-sm sm:prose-base max-w-none prose-p:text-[var(--subtle-text)] prose-strong:text-[var(--text-color)] prose-headings:text-[var(--text-color)] prose-ul:text-[var(--subtle-text)] prose-li:marker:text-[var(--header-text)] prose-blockquote:border-[var(--header-text)] prose-blockquote:text-[var(--subtle-text)] prose-code:text-amber-700 dark:prose-code:text-amber-400 prose-a:text-[var(--header-text)]">
      {children}
    </div>
  </div>
);

const Documentation: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-4xl font-pixel text-[var(--header-text)] mb-6 border-b-2 border-amber-500/10 dark:border-amber-500/10 pb-2">
        Project Documentation
      </h2>

      <Section title="Project Philosophy: Show, Don't Tell" icon={Layers}>
        <p>
          This portfolio was conceived with a single, guiding principle: a portfolio should be a demonstration, not just a list. A traditional resume can tell someone what I know, but this application is designed to <strong>show</strong> what I can do. My goal was to create a dynamic, interactive web application that serves as tangible proof of my capabilities in modern front-end development, UI/UX design, and my expertise in integrating sophisticated AI systems.
        </p>
        <blockquote>
          Every feature, from the AI Playground to the interactive timeline, was architected and implemented by me to showcase specific technical skills in a practical, hands-on manner.
        </blockquote>
      </Section>

      <Section title="Core Architecture" icon={Cpu}>
        <p>
          The application is a modern <strong>Single Page Application (SPA)</strong>, providing a fluid, desktop-like user experience without disruptive page reloads. The architecture is built on several key pillars:
        </p>
        <ul>
          <li><strong>React & TypeScript:</strong> The foundation of the application. React's component-based architecture makes the UI modular and maintainable, while TypeScript adds a crucial layer of type safety, preventing common bugs and making the codebase more robust and self-documenting.</li>
          <li><strong>Service-Oriented Design:</strong> All external API communication, particularly with the Gen AI services, is abstracted into a dedicated service module. This follows the principle of separation of concerns, keeping the UI components clean and focused purely on presentation logic.</li>
          <li><strong>Performance-First with Lazy Loading:</strong> To ensure a fast initial load, feature-rich components (like the AI tools) are code-split using <code>React.lazy</code>. This means the browser only downloads the necessary JavaScript for a feature at the moment the user decides to interact with it.</li>
           <li><strong>Buildless Approach:</strong> To keep the project lightweight and demonstrate modern web platform features, there's no complex local build step. Dependencies are loaded directly from a CDN using an <code>importmap</code> in <code>index.html</code>, simplifying the development setup.</li>
        </ul>
      </Section>

      <Section title="Deployment & Hosting" icon={Globe}>
          <p>
            This application is designed for seamless deployment on modern static hosting platforms like <strong>Vercel</strong> or <strong>Netlify</strong>. This ensures global availability, fast load times, and a streamlined development-to-production workflow.
          </p>
          <p>
            The live version of this portfolio is hosted at <a href="https://www.mdzarifazfar.me" target="_blank" rel="noopener noreferrer"><strong>www.mdzarifazfar.me</strong></a>, utilizing a free domain service to demonstrate accessibility and cost-effective deployment strategies.
          </p>
          <p>
            Backend and project management, including API key configuration and service monitoring, were handled through industry-standard platforms like the <strong>Google Cloud Console</strong>. This ensures a robust and scalable infrastructure to support the AI features.
          </p>
      </Section>

      <Section title="API Key Management" icon={KeyRound}>
        <p>
          The AI features in this portfolio require API keys to communicate with generative AI services. The application employs a secure and flexible dual-strategy for managing these keys:
        </p>
        <h4 className="font-bold mt-6 mb-2">1. Primary Environment Key (For Most Features)</h4>
        <p>
          For the majority of the AI tools (Chat, Image Generation, Problem Solving, etc.), the application uses a single, primary API key. This key is <strong>not</strong> stored in the code. Instead, it's configured as an <strong>environment variable</strong> named <code>API_KEY</code> in the deployment environment (e.g., Vercel, Netlify). The code securely accesses this key via <code>process.env.API_KEY</code>.
        </p>
        <p><strong>Why this approach?</strong> This is a standard, secure practice that prevents sensitive credentials from being exposed in public-facing code, protecting the key from unauthorized use.</p>
        
        <h4 className="font-bold mt-6 mb-2">2. User-Provided Key (For High-Compute Features)</h4>
        <p>
          Certain advanced or experimental features, like video generation, may have significant billing implications. To handle this responsibly and transparently, the Video Generator requires the user to provide their own API key.
        </p>
        <p>
          This is achieved by integrating with a secure key selection dialog provided by the development environment. The application first checks if a key has been selected. If not, it presents a button that opens a secure dialog for the user to choose their own key, ensuring any usage costs are tied directly to their account. The application also gracefully handles API key errors, prompting the user to re-select a key if an issue is detected.
        </p>
      </Section>

      <Section title="The AI Playground: A Technical Deep Dive" icon={Bot}>
        <p>
          The 'AI Playground' is the heart of this portfolio. Each tool is a custom-built feature designed to solve a specific problem and demonstrate my ability to orchestrate complex Gen AI functionalities.
        </p>
        <h4 className="font-bold mt-6 mb-2">ZOSO AI Assistant & Grounding</h4>
        <p>
          This conversational interface is powered by a large language model whose behavior is shaped by a carefully crafted <strong>system prompt</strong>. This prompt grounds the AI in my personal portfolio data (from <code>portfolio-data.json</code>), enabling it to answer specific questions with high accuracy. For general knowledge, it uses Retrieval-Augmented Generation (RAG) principles by connecting to live search tools, ensuring its answers are current and factually-grounded.
        </p>
        <h4 className="font-bold mt-6 mb-2">Asynchronous Task Handling (Video Generation)</h4>
        <p>
          Generating a video can take several minutes, far too long for a standard web request. I solved this by implementing an asynchronous <strong>polling mechanism</strong>. The initial API call kicks off the job and returns an operation ID. The front-end then enters a polling loop, periodically checking the status of the job. This robust, user-friendly approach is essential for working with any long-running asynchronous API.
        </p>
        <h4 className="font-bold mt-6 mb-2">Real-Time Streaming (Live Conversation)</h4>
        <p>
          This feature showcases my ability to work with real-time data streams. It uses the browser's <strong>Web Audio API</strong> to capture raw microphone input. This audio is encoded, streamed to a low-latency conversational AI endpoint, which then returns a continuous stream of audio. I wrote custom client-side decoders to handle the raw PCM data for seamless, gapless playback.
        </p>
         <h4 className="font-bold mt-6 mb-2">Structured Output & Analysis Tools</h4>
        <p>
          Tools like the <strong>AI Detector</strong> required more than just a text response. For this, I configured the model to return a guaranteed, structured JSON object by providing it with a response schema. My code then parses this JSON to display the classification, confidence score, and reasoning in the UI. This demonstrates precise control over the model's output format for reliable, data-driven applications.
        </p>
      </Section>
      
      <Section title="Styling and UX" icon={Palette}>
          <p>
            The entire user interface is styled using <strong>Tailwind CSS</strong>, following a utility-first approach for rapid development of a consistent and fully responsive design. The aesthetic is elevated with a dynamic theme system (Light/Dark mode) powered by CSS variables, an animated aurora background for a premium feel, and custom-designed components to ensure a polished and professional user experience.
          </p>
      </Section>

      <Section title="How to Customize This Portfolio" icon={Settings}>
        <p>I designed this portfolio to be easily adaptable. You can personalize it to showcase your own skills and experience by following these steps.</p>
        
        <h4 className="font-bold mt-6 mb-2">Step 1: Personalize Your Core Data</h4>
        <p>This is the most important step. All personal information on the site comes from a single file.</p>
        <ul>
          <li><strong>Action:</strong> Open the file named <code>portfolio-data.json</code>.</li>
          <li><strong>What to do:</strong> Carefully replace my information with yours. Go through and change the <code>name</code>, <code>profilePictureUrl</code>, contact details, <code>summary</code>, <code>education</code>, <code>projects</code>, etc. This single change will populate almost the entire portfolio with your content.</li>
        </ul>

        <h4 className="font-bold mt-6 mb-2">Step 2: Update Your Contact Form</h4>
        <p>To receive emails from the contact form, you need to point it to your email address.</p>
        <ul>
          <li><strong>Action:</strong> Open the file <code>features/Contact.tsx</code>.</li>
          <li><strong>What to do:</strong> Find the line that looks like this: <code>fetch('https://formsubmit.co/ajax/zaryif.dev@gmail.com', ...)</code></li>
          <li><strong>Change:</strong> Replace <code>zaryif.dev@gmail.com</code> with your own email address from a service like Formsubmit.co.</li>
        </ul>

        <h4 className="font-bold mt-6 mb-2">Step 3: Link Your GitHub Profile</h4>
        <p>The "More on GitHub" section automatically fetches your public repositories.</p>
        <ul>
          <li><strong>Action:</strong> Open the file <code>features/Projects.tsx</code>.</li>
          <li><strong>What to do:</strong> Find the line <code>&lt;GitHubProjects username="zaryif" /&gt;</code>.</li>
          <li><strong>Change:</strong> Replace <code>"zaryif"</code> with your GitHub username.</li>
        </ul>
        
        <h4 className="font-bold mt-6 mb-2">Step 4: Deployment & API Key</h4>
        <p>To make your portfolio live and power the AI features, you'll need to deploy it and provide an API key from your preferred Gen AI service provider.</p>
        <ul>
            <li><strong>Get an API Key:</strong> Obtain an API key from a generative AI service provider.</li>
            <li><strong>Deploy Your Site:</strong> This is a static React application, so you can host it for free on services like Vercel, Netlify, or GitHub Pages.</li>
            <li><strong>Set the Environment Variable:</strong> In your chosen hosting service's dashboard, find the settings for "Environment Variables". Create a new variable with the name <code>API_KEY</code> and paste your API key as the value. This step is crucial for the AI features to work.</li>
        </ul>
      </Section>

      <Section title="A Note on 'Tools'" icon={UserCheck}>
          <p>
            A key skill for a modern software developer is the ability to select, integrate, and orchestrate the right tools and services to build a powerful and coherent application. This project is a testament to that skill—a demonstration of how I can leverage the building blocks of modern technology to create something unique and functional. Every line of code that connects these services, manages the application state, and renders this user interface was written by me.
          </p>
      </Section>

    </div>
  );
};

export default Documentation;