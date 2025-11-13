# TMDB API Setup Guide

## 🎬 What is TMDB?

**The Movie Database (TMDB)** is a free, community-built movie and TV database that provides comprehensive information about movies, including:
- Cast and crew information
- Movie details and ratings
- Posters and backdrop images
- Release dates and genres
- And much more!

## 🔑 Getting Your Free API Key

### Step 1: Create TMDB Account
1. Go to [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Click "Sign Up" in the top right corner
3. Fill in your details and create a free account
4. Verify your email address

### Step 2: Request API Access
1. Log in to your TMDB account
2. Go to **Settings** → **API**
3. Click **"Request an API key"**
4. Fill out the form:
   - **Application Name**: "Movie Actors App" (or any name you prefer)
   - **Application URL**: `http://localhost:3000` (for development)
   - **Application Summary**: "Personal movie app for finding actor interviews"
   - **Application Type**: Select "Website"
5. Click **"Submit"**

### Step 3: Get Your API Key
1. After approval (usually instant), you'll see your API key
2. Copy the **API Key (v3 auth)** value
3. **Keep this key private** - don't share it publicly

## ⚙️ Configuration

### Step 1: Update the Config File
Open `src/config/tmdb.ts` and replace the placeholder:

```typescript
export const TMDB_CONFIG = {
  // Replace this with your actual API key
  API_KEY: 'YOUR_ACTUAL_API_KEY_HERE',
  // ... rest of config
};
```

### Step 2: Test the Integration
1. Start your development server: `npm run dev`
2. Search for a movie (e.g., "Inception", "The Matrix", "Avengers")
3. You should see the cast information load automatically
4. Click any actor name to search for their interviews

## 📊 API Limits

- **Free Tier**: 1,000 requests per day
- **Paid Tier**: 10,000+ requests per day (if needed)
- **Rate Limiting**: 30 requests per 10 seconds

## 🚀 Features You'll Get

With TMDB integration, your app will now show:
- ✅ **Real Cast Members**: Actual actors from the movie
- ✅ **Character Names**: What role each actor played
- ✅ **Clickable Links**: Click any actor to search for interviews
- ✅ **Professional Data**: Industry-standard movie information
- ✅ **No More Random Text**: Clean, accurate actor names

## 🔧 Troubleshooting

### "API Key Invalid" Error
- Double-check your API key in `src/config/tmdb.ts`
- Make sure there are no extra spaces or characters
- Verify your TMDB account is active

### "No Cast Information Found" Error
- The movie title might not match exactly
- Try searching with the exact movie title
- Some older or obscure movies might not be in TMDB

### "Rate Limit Exceeded" Error
- You've hit the 1,000 requests/day limit
- Wait until tomorrow or upgrade to paid tier
- Check your API usage in TMDB settings

## 🎯 Example Results

After setup, searching for "Inception" will show:
- **Leonardo DiCaprio** as Cobb
- **Joseph Gordon-Levitt** as Arthur
- **Ellen Page** as Ariadne
- **Tom Hardy** as Eames
- **Ken Watanabe** as Saito

Click any name to search: "Leonardo DiCaprio Inception interview"

## 🆘 Need Help?

- **TMDB Documentation**: [https://developers.themoviedb.org/3](https://developers.themoviedb.org/3)
- **TMDB Community**: [https://www.themoviedb.org/talk](https://www.themoviedb.org/talk)
- **API Status**: [https://status.themoviedb.org/](https://status.themoviedb.org/)

---

**Happy coding! 🎭✨**
