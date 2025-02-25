# SABOT AI - Advanced Conversational and Data Visualization Platform

## Project Overview

SABOT AI is a sophisticated AI assistant platform that combines conversational capabilities with powerful data visualization tools. Built with React, TypeScript, and integrated with Google's Gemini API, this application provides an intuitive interface for AI-powered chat interactions, code generation, and data analysis.

**UI Preview**
--------------
![UI](https://github.com/user-attachments/assets/512491a2-f986-4678-ab54-df38f191b977)

**Code Generation**
-------------------

![Code Generation](https://github.com/user-attachments/assets/3327f894-700d-476b-bd75-9a4b7836ba3e)

**Data Visualization**
----------------------

![Data Visualization](https://github.com/user-attachments/assets/31826c4e-85c1-41d2-bd45-6cdd2a2e115a)

## Features

### Core Functionality
- **AI-Powered Chat Interface**: Real-time conversations with Google's Gemini AI model
- **Multi-modal Interactions**: Support for text and file uploads (images, PDFs, documents)
- **Code Generation**: AI-assisted code generation in multiple programming languages
- **Advanced Data Visualization**: Interactive charts and graphs with customizable parameters
- **Theme Switching**: Seamless toggle between light and dark modes

### Technical Highlights
- **Modern React Architecture**: Built with React 18, TypeScript, and Vite
- **Responsive UI**: Fully responsive design using Tailwind CSS and shadcn/ui components
- **Animations**: Smooth transitions and loading states with Framer Motion
- **CSV Data Processing**: Parse and visualize CSV data with PapaParse
- **Interactive Charts**: Dynamic chart rendering with Recharts
- **Keyboard Shortcuts**: Enhanced user experience with keyboard navigation
- **Context Menus**: Right-click functionality for additional options
- **Toast Notifications**: User feedback system for actions and errors

## Folder Structure
Let me address each of these points:

1\. For debugging, I'll explain how to add debugging capabilities to the React project using browser dev tools, React Developer Tools, and VS Code debugging.

2\. For resume points, I'll highlight the key technical features that would be impressive to potential employers.

3\. For the project title, I'll suggest something professional that captures the essence of the application.

4\. For the README file, I'll create a comprehensive document that explains the project, its features, how to set it up, and how to use it.

5\. For the folder structure, I'll outline the typical structure of a React project with the components they've created.

Let me start with creating the README.md file, which will include most of this information.

`</Thinking>`

I'll help you with all of these requests. Let's start with a comprehensive README file that includes the project title, features, folder structure, and setup instructions. Then I'll provide guidance on debugging and what to include in your resume.

```
sabot-ai/
├── public/
│   ├── user-avatar.png
│   └── ai-avatar.png
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── CodeBlock.tsx       # Code generation component
│   │   ├── CustomTooltip.tsx   # Enhanced chart tooltips
│   │   ├── DataFilter.tsx      # Data filtering component
│   │   ├── DataVisualization.tsx # Data visualization component
│   │   └── Loading.tsx         # Loading animation component
│   ├── data/
│   │   └── leukemia_risk.csv   # Sample dataset
│   ├── hooks/
│   │   └── use-toast.ts        # Toast hook
│   ├── lib/
│   │   └── utils.ts            # Utility functions
│   ├── App.tsx                 # Main application component
│   ├── index.css               # Global styles
│   └── main.tsx                # Entry point
├── .env.local                  # Environment variables (not in repo)
├── package.json                # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

## Setup and Installation
### Prerequisites

- Node.js 16.x or higher
- npm or yarn package manager
- Google Gemini API key

### Installation Steps

1\. Clone the repository:

```
git clone https://github.com/Slygriyrsk/advanced-AIGPT.git
cd advanced-AIGPT
```

2\. Install dependencies:

```shellscript
npm install
or
yarn install
```

3\. Create a `.env.local` file in the root directory with your Gemini API key:

```plaintext
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4\. Start the development server:

```
npm run dev
or
yarn dev
```

5\. Open your browser and navigate to `http://localhost:5173`

## Usage Guide

### Chat Interface

- Type your message in the input field and press Enter or click Send
- Upload files by clicking the file icon
- View chat history in the right sidebar
- Right-click on messages for additional options

### Code Generation

- Switch to the Code Generation tab
- Describe the code you want to generate
- Select the programming language
- Click Generate Code

### Data Visualization

- Switch to the Data Visualization tab
- Select a dataset from the dropdown
- Choose chart type (line, bar, scatter)
- Select X and Y axes
- Customize chart appearance in the Settings tab
- Apply filters to the data as needed
- Export filtered data as CSV

## Debugging

### Browser Developer Tools

- Use Chrome/Firefox DevTools (F12) to inspect components and state
- Monitor network requests to the Gemini API
- Check console for errors and warnings

### React Developer Tools

1\. Install the React Developer Tools extension for your browser
2\. Use the Components tab to inspect and modify component state
3\. Use the Profiler tab to identify performance bottlenecks

### VS Code Debugging

1\. Install the "Debugger for Chrome" extension in VS Code

2\. Create a `.vscode/launch.json` file:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

3\. Set breakpoints in your code

4\. Press F5 to start debugging

## License
MIT License

## Acknowledgements
- [Google Generative AI](https://ai.google.dev/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)
- [PapaParse](https://www.papaparse.com/)