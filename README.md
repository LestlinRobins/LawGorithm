# LawGorithm

![LawGorithm Logo](public/assets/logo.png)

LawGorithm is an innovative mobile application designed to bridge the gap between legal resources and public safety. This app leverages artificial intelligence to provide timely information, emergency assistance, and legal guidance to users in need.

## 🔑 Key Features

### 🛡️ AI-based Scam Detection

Leverages AI to identify and warn users about potential scams, fraudulent activities, and phishing attempts. It analyzes patterns, text, and behavior to detect suspicious activities before they cause harm.

### 👶 AI-based Child & Women Safety

Uses mobile sensors (such as accelerometers and gyroscopes) to detect sudden movements, falls, or distress signals. If unusual activity is detected, it can automatically alert designated guardians or emergency contacts.

- Can be extended for **women’s safety** by integrating voice commands, SOS triggers, and real-time location tracking.

### 🚨 Emergency Dispatch AI

Connect instantly with AI-powered emergency services for immediate assistance.

- The system assesses the urgency of the situation, connects with authorities, and provides real-time location tracking to dispatch help efficiently.

### 📊 Lead Prediction AI

Utilizes machine learning to analyze crime reports and patterns, predicting potential high-risk areas and assisting law enforcement in proactive crime prevention strategies.

### 🗺️ AI-based Crime Heatmaps

Generates real-time, interactive heatmaps that highlight crime-prone areas based on recent reports and historical data.

- Helps users stay informed and navigate safer routes.

### ⚖️ Legal Information

Provides easy access to **legal resources, rights, and laws** in a simplified and understandable format.

- Users can browse legal topics related to safety, cybercrime, and personal rights without needing complex legal knowledge.

### 🤖 AI-based Legal and Counseling Chatbot

An AI-powered chatbot that offers guidance on **legal matters, victim support, and general counseling**.

- Provides insights into legal procedures, emotional support, and recommended next steps based on the user’s concerns.

### 📢 Crime Reporting

Enables users to **report crimes and safety concerns** through an intuitive interface.

- Reports can be sent to relevant authorities with location details and optional media attachments for better context.

### 🔒 Crime Prevention

Provides proactive **safety tips and alerts** based on user location and crime trends.

- AI-driven analysis helps individuals take precautionary measures to avoid dangerous situations.

### 🕵️ Anonymous Reporting

Allows users to **report incidents anonymously**, ensuring privacy and security for those who may fear retaliation or exposure when reporting sensitive cases.

### 📚 Resource Section

A **comprehensive collection of safety guides, emergency contacts, legal documents, and self-defense resources**.

- Designed to **educate and empower users** with knowledge to stay safe.

## 📱 Screenshots

<div style="display: flex; justify-content: space-between;">
  <img src="public/assets/screenshot1.png" width="30%" alt="Home Screen" />
  <img src="public/assets/screenshot2.png" width="30%" alt="Emergency Assistance" />
  <img src="public/assets/screenshot3.png" width="30%" alt="Settings" />
</div>

## 🛠️ Technologies Used

- [Next.js](https://nextjs.org/) - React framework for building the UI
- [Google Gemini API](https://ai.google.dev/) - AI capabilities for emergency assistance
- [React](https://reactjs.org/) - Frontend library for component-based architecture
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) - Custom styling for a sleek user interface
- [Speech Recognition API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) - Voice input capabilities for emergency situations

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager
- A Google Gemini API key (for AI features)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/LawGorithm.git
   cd LawGorithm
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API key:

   ```
   NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🧩 Project Structure

```
LawGorithm/
├── public/             # Static assets
├── src/                # Source code
│   ├── app/            # Next.js app router
│   │   ├── api/        # API routes
│   │   ├── components/ # Shared components
│   │   ├── dispatch/   # Emergency dispatch feature
│   │   └── frontend/   # Frontend components
│   └── utils/          # Utility functions
└── ...                 # Config files
```

## 🔧 Configuration

The app can be configured through the Settings page, which includes:

- **Account Management**: Update profile information and security settings
- **Privacy Controls**: Manage data visibility and usage preferences
- **Notification Settings**: Customize alert preferences and emergency notifications
- **Personalization**: Adjust theme, language, and accessibility options
- **App Information**: Access legal documentation and support

## 🤝 Contributing

We welcome contributions to LawGorithm! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to your branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## 📄 License

LawGorithm is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements

- [Google Solutions Challenge](https://developers.google.com/community/gdsc-solution-challenge) for inspiration
- All contributors who have helped shape this project
- Open source community for the amazing tools and libraries used in this project

---

Developed with ❤️ by Team LawGorithm
