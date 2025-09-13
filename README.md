# Felipe's Banana 🍌 - Virtual Fashion Try-On Store

A fun and innovative clothing store with AI-powered virtual try-on functionality using the Replicate nano-banana model.

## Features

- **Virtual Try-On**: Upload your photo and see how clothes look on you using AI
- **Clean Grayscale Design**: Minimalist Medusa Store-inspired aesthetic
- **Product Categories**: Pants, Shirts, Jackets, and Hats
- **Responsive Design**: Works on all devices

## Setup

### Environment Variables

To enable the virtual try-on feature, you need to set up your Replicate API token:

1. Sign up at [Replicate](https://replicate.com)
2. Get your API token from your account settings
3. Add it to your environment variables:

\`\`\`bash
REPLICATE_API_TOKEN=your_token_here
\`\`\`

### Development

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev
\`\`\`

Visit `http://localhost:3000` to see Felipe's Banana in action!

## Virtual Try-On

The virtual try-on feature uses Google's nano-banana model via Replicate to:
- Take your uploaded photo
- Apply clothing styles based on your prompt
- Generate a realistic image of you wearing the selected clothes

Simply upload a clear photo of yourself, describe the style you want, and let the AI magic happen! 🪄

## Tech Stack

- **Next.js 14** - React framework
- **Tailwind CSS** - Styling
- **Radix UI** - UI components
- **Replicate API** - AI image generation
- **TypeScript** - Type safety

---

*Made with 🍌 and lots of fun!*
