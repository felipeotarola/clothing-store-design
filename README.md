# Virtual Fashion Try-On Store

A fun and innovative clothing store with AI-powered virtual try-on functionality using Replicate. Experience the future of online shopping with minimalist design and cutting-edge AI technology!

## Features

- **Virtual Try-On**: Upload your photo and see how clothes look on you using AI
- **Clean Grayscale Design**: Minimalist design aesthetic
- **Product Categories**: Pants, Shirts, Jackets, Hats, Jewelry, Backpacks, Sneakers & Footwear, Sportswear & Athletic Wear
- **📱 Responsive Design**: Seamless experience across all devices
- **🌟 Share Your Looks**: Showcase your virtual try-on results with the community
- **⚡ Real-time Processing**: Fast AI-powered clothing visualization

## Setup

### Environment Variables

To enable the virtual try-on feature, you need to set up your Replicate API token:

1. Sign up at [Replicate](https://replicate.com)
2. Get your API token from your account settings
3. Add it to your environment variables:

```bash

## 🚀 Quick StartREPLICATE_API_TOKEN=your_token_here

\`\`\`

### Prerequisites

### Development

- Node.js 18+ 

- npm or yarn\`\`\`bash

- Replicate account (required for virtual try-on)# Install dependencies

npm install

### Installation

# Run development server

1. **Clone the repository**npm run dev

   ```bash\`\`\`

   git clone https://github.com/felipeotarola/clothing-store-design.git

   cd clothing-store-design

Visit `http://localhost:3000` to see your virtual try-on store in action!

   ```

## Virtual Try-On

2. **Install dependencies**

   ```bashThe virtual try-on feature uses Google's nano-banana model via Replicate to:

   npm install- Take your uploaded photo

   ```- Apply clothing styles based on your prompt

- Generate a realistic image of you wearing the selected clothes

3. **Set up environment variables**

   Simply upload a clear photo of yourself, describe the style you want, and let the AI magic happen! 🪄

   Create a `.env.local` file in the root directory:

   ```bash## Tech Stack

   # Required for Virtual Try-On functionality

   REPLICATE_API_TOKEN=your_replicate_api_token_here- **Next.js 14** - React framework

   - **Tailwind CSS** - Styling

   # Optional: For sharing looks feature (Supabase)- **Radix UI** - UI components

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url- **Replicate API** - AI image generation

   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key- **TypeScript** - Type safety

   

   # Optional: For image storage (Vercel Blob)---

   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

   ```*Made with 🍌 and lots of fun!*


4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Visit `http://localhost:3000` to see your virtual try-on store in action! 🎉

## 🔑 Required Configuration

### Replicate API (Mandatory)

The virtual try-on feature **requires** a Replicate API token to function:

1. **Sign up** at [Replicate](https://replicate.com)
2. **Get your API token** from your account settings
3. **Add to environment variables**:
   ```bash
   REPLICATE_API_TOKEN=r8_your_token_here
   ```

> ⚠️ **Important**: The virtual try-on feature will not work without this token. The application uses Google's nano-banana model through Replicate's API.

### Supabase (Optional)

Supabase is used for storing shared looks in the community gallery. While not required for core functionality, it enables:
- Sharing virtual try-on results
- Community look gallery
- Persistent storage of user-generated content

To set up Supabase (optional):
1. Create a project at [Supabase](https://supabase.com)
2. Follow the setup instructions in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md)
3. Add your Supabase credentials to `.env.local`

## 🎯 How to Use

### Virtual Try-On Process

1. **Browse Products**: Explore different categories and click on items you like
2. **Upload Photo**: Use the virtual try-on panel to upload a clear photo of yourself
3. **Select Items**: Choose clothing items from your selected products
4. **Customize Style**: Add a style prompt to describe how you want the outfit to look
5. **Generate**: Click "Try On Clothes" and wait for the AI magic! ✨
6. **Share**: Love your look? Share it with the community!

### Tips for Best Results

- **Photo Quality**: Use a clear, well-lit photo with good contrast
- **Body Position**: Face the camera directly with arms at your sides
- **Background**: Plain backgrounds work best
- **Style Prompts**: Be descriptive about the look you want (e.g., "casual street style", "professional business attire")

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **AI Processing**: Replicate API (Google's nano-banana model)
- **Database**: Supabase (optional, for shared looks)
- **File Storage**: Vercel Blob
- **TypeScript**: Full type safety
- **Fonts**: Geist Sans & Mono
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Analytics**: Vercel Analytics

## 📁 Project Structure

```
clothing-store-design/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── virtual-try-on/ # AI processing endpoint
│   │   ├── shared-looks/  # Community sharing
│   │   └── upload/        # File upload handling
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── category-section.tsx
│   ├── virtual-try-on.tsx # Main AI feature
│   └── ...
├── lib/                  # Utilities
│   ├── supabase.ts      # Supabase client
│   └── utils.ts         # Helper functions
├── public/              # Static assets
└── styles/             # Additional styles
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy

### Other Platforms

The application can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- DigitalOcean App Platform

## 🤝 Contributing

We welcome contributions! Please feel free to submit pull requests or open issues for:
- Bug fixes
- New features
- UI improvements
- Documentation updates

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Support

Having issues? Check these common solutions:

### Virtual Try-On Not Working
- Verify your `REPLICATE_API_TOKEN` is set correctly
- Check the browser console for error messages
- Ensure your photo is in a supported format (JPG, PNG)

### Slow Processing
- The AI model takes 10-30 seconds to process
- Larger images take longer to process
- Check your internet connection

### Sharing Not Working
- Supabase configuration is optional but required for sharing
- Check your Supabase environment variables
- Verify the database schema is set up correctly

---

*---

*Made with ✨ and lots of AI magic!*

*Where fashion meets the future**

*Where fashion meets the future*