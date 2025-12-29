# ✨ Taneria Jewels - Virtual Try-On Experience

![Taneria Jewels Banner](https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop)

**Taneria Jewels** is a cutting-edge virtual try-on application that bridges the gap between digital browsing and physical experience. enhance the online jewelry shopping experience. Built with **React** and powered by advanced AI services like **RunwayML** and **HeyGen**, this application allows users to realistically visualize jewelry on themselves or digital models.

---

## 🚀 Key Features

### 💎 AI-Powered Virtual Try-On
Experience hyper-realistic jewelry visualization. Upload your photo, place the jewelry item, and let our **RunwayML** integration generate a seamless, lighting-aware composite image that looks like a professional studio shot.

### 🗣️ Interactive Virtual Assistant
Meet our AI shopping assistant! Powered by **HeyGen**, a lifelike streaming avatar guides users through the experience, offering tips and assistance in real-time, making the digital journey feel personal and guided.

### 🎨 Smart Canvas Editor
Positioning is key. Our interactive canvas allows you to:
- **Drag & Drop** jewelry items onto your photo.
- **Resize & Rotate** for perfect alignment.
- **Mix & Match** necklaces and earrings for a complete look.

### 🖼️ Exquisite Showcase Gallery
Explore our curated collection in the **Showcase**. Click on any item to instantly see it modeled on a professional model, giving you immediate context on scale and style before trying it on yourself.

### ✨ "Combo Mode"
Why stop at one? Select a necklace and matching earrings to generate a cohesive "Set Look". The system intelligently merges these assets before sending them for AI rendering.

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **AI Services**:
  - **RunwayML** (Image-to-Image Generation)
  - **HeyGen** (Interactive Streaming Avatar)

---

## 📦 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **RunwayML API Key** (for Try-On generation)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/your-username/virtualtryon-master.git
    cd virtualtryon-master
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add your keys:
    ```env
    VITE_RUNWAY_API_KEY=your_runway_api_key_here
    ```

4.  **Start the Development Server**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:5173`.

---

## 📖 Usage Guide

1.  **Upload Photo**: Start by uploading a front-facing photo of yourself (or use the sample model).
2.  **Select Jewelry**: Browse the sidebar categories (Necklaces, Earrings, etc.).
3.  **Position**: Drag the jewelry onto the photo. Use the controls to resize and rotate until it aligns with your neck or ears.
4.  **Generate**: Click the **"Create your Look"** button (Sparkles icon). The AI will process the image and return a realistic result.
5.  **Save**: Download your favorite looks to share or review later.
6.  **Need Help?**: Listen to the Virtual Assistant for guidance on the process.

---

## 📂 Project Structure

```text
src/
├── components/        # Reusable UI components
│   ├── AIModal.jsx    # The core AI generation interface
│   ├── Canvas.jsx     # Interactive image placement area
│   ├── Sidebar.jsx    # Asset browser and controls
│   └── ...
├── pages/             # Main application views
│   ├── Home.jsx       # The main Try-On workspace
│   ├── Showcase.jsx   # Gallery view
│   └── ...
├── services/          # API integrations
│   └── runwayService.js
├── utils/             # Helper functions
│   └── imageMerger.js
├── data/              # Static product data
└── App.jsx            # Layout and Routing
```

---

## 🤝 Contributing

Contributions are always welcome! Please create a Pull Request or open an issue for any bugs or feature suggestions.

---

Made with ❤️ by the Taneria Jewels Team
