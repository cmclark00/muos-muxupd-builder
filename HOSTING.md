# Hosting the muOS .muxupd Builder

This guide shows you how to host the muOS .muxupd Builder online for free.

## Option 1: GitHub Pages (Recommended)

GitHub Pages is the easiest way to host this tool and share it with the muOS community.

### Steps:

1. **Create a GitHub repository**
   ```bash
   cd muos-muxupd-builder
   git init
   git add .
   git commit -m "Initial commit - muOS .muxupd Builder"
   ```

2. **Push to GitHub**
   ```bash
   # Create a new repository on GitHub (https://github.com/new)
   # Then run:
   git remote add origin https://github.com/YOUR-USERNAME/muos-muxupd-builder.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR-USERNAME.github.io/muos-muxupd-builder/`

That's it! Your tool is now live and accessible to anyone.

## Option 2: Netlify

Netlify offers even easier deployment with drag-and-drop.

### Steps:

1. Go to [netlify.com](https://www.netlify.com/)
2. Sign up for a free account
3. Click "Add new site" → "Deploy manually"
4. Drag the entire `muos-muxupd-builder` folder into the upload area
5. Your site will be live instantly with a random URL
6. (Optional) Configure a custom domain in settings

## Option 3: Vercel

Similar to Netlify, Vercel offers instant deployment.

### Steps:

1. Go to [vercel.com](https://vercel.com/)
2. Sign up for a free account
3. Click "New Project"
4. Import your GitHub repository (or drag & drop files)
5. Deploy!

## Option 4: Local Network (For Private Use)

If you want to run this on your local network only:

### Using Python:

```bash
cd muos-muxupd-builder
python3 -m http.server 8000
```

Then access at: `http://localhost:8000`

### Using Node.js:

```bash
cd muos-muxupd-builder
npx serve
```

## Updating Your Hosted Site

### GitHub Pages:
```bash
# Make changes to your files
git add .
git commit -m "Update: description of changes"
git push
```

Changes will be live in 1-2 minutes.

### Netlify/Vercel:
- **With Git**: Just push to your connected repository
- **Manual**: Drag and drop the updated folder again

## Custom Domain (Optional)

All three hosting services (GitHub Pages, Netlify, Vercel) support custom domains:

1. Purchase a domain (e.g., muos-builder.com)
2. Follow the provider's custom domain setup guide
3. Update DNS settings as instructed

## SSL Certificate

All three hosting options provide free SSL certificates automatically, so your site will be accessible via `https://`.

## Sharing with the Community

Once hosted, you can:
- Share the URL on the muOS Discord/forums
- Add it to the muOS community resources
- Include it in your GitHub README

---

**Note**: This is a static site with no backend, so hosting is completely free on all platforms!
