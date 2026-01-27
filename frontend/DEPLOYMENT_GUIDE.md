# Deployment Guide: Namecheap (Backend) & Netlify (Frontend)

## 1. The Strategy
To make your frontend and backend work seamlessly while using the domain `vijadprojects.com`, we will use the following structure:

- **Frontend (Netlify)**: `vijadprojects.com` (and `www.vijadprojects.com`)
  - This is what users will visit.
- **Backend (Namecheap)**: `api.vijadprojects.com` (Subdomain)
  - This is where the frontend will send requests.

## 2. Deploying the Backend to Namecheap cPanel

You have already prepared the `server.js` and build files.

### Step A: Prepare the Backend Files
1. On your computer, navigate to the `backend` folder.
2. Select the following files and folders:
   - `dist` (folder)
   - `prisma` (folder)
   - `package.json`
   - `package-lock.json`
   - `server.js`
   - `.env` (Ideally, you should create this securely on the server, but for now you can include it. **Update** `APP_URL` to `https://vijadprojects.com` and `API_URL` to `https://api.vijadprojects.com` inside it.)
3. **Zip** these files into a file named `backend_deploy.zip`.

### Step B: Configure cPanel
1. Log into **cPanel**.
2. Go to **Domains** and create a subdomain: `api.vijadprojects.com`.
   - Set the document root to a new folder, e.g., `api`.
3. Go to **Node.js Selector** (Setup Node.js App).
4. Create Application:
   - **Node.js Version**: 20 (or default recommended).
   - **Application Mode**: Production.
   - **Application Root**: `api` (or wherever you pointed the subdomain).
   - **Application URL**: `api.vijadprojects.com`.
   - **Application Startup File**: `server.js`.
5. Click **Create**.

### Step C: Upload & Install
1. Open cPanel **File Manager**.
2. Navigate to the `api` folder (or your application root).
3. **Upload** `backend_deploy.zip` and **Extract** it there.
4. Back in the **Node.js Selector**:
   - Click **Run NPM Install**. This installs all dependencies.
   - *Tip: If it fails, try entering the virtual environment via terminal and running `npm install` manually.*
5. **Database Migration**:
   - You need to run migrations to set up your live database.
   - In cPanel Terminal (or SSH):
     ```bash
     cd api
     source virtualenv/bin/activate  (the command given at the top of Node.js app page)
     npx prisma migrate deploy
     ```
6. **Restart** the Node.js application.

Your backend is now live at `https://api.vijadprojects.com`.

---

## 3. Deploying the Frontend to Netlify

### Step A: Configure Environment Variables
1. In your project root `.env` (local), ensure you have:
   ```
   NEXT_PUBLIC_API_URL=https://api.vijadprojects.com
   ```
   *Note: For the actual deployment, you will set this in Netlify's dashboard.*

### Step B: Deploy via Git (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket.
2. Log into **Netlify** -> **Add new site** -> **Import an existing project**.
3. Select your repository.
4. **Build Settings**:
   - **Base directory**: `.` (root)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (Netlify handles Next.js automatically)
5. **Environment Variables**:
   - Click "Add environment variable".
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://api.vijadprojects.com`
6. Click **Deploy**.

### Step C: Domain Setup
1. In Netlify, go to **Domain Management**.
2. Add custom domain: `vijadprojects.com`.
3. Follow instructions to update your **DNS** on Namecheap (usually pointing A record to Netlify load balancer or using CNAME for www).
   - **Note**: Since your email and backend are on Namecheap, be careful not to change *Nameservers* entirely if you want to keep Namecheap email. Just update the **A Record (@)** to Netlify's IP and **CNAME (www)** to Netlify.

### Troubleshooting
- **CORS Errors**: If frontend fails to talk to backend, ensure `https://vijadprojects.com` is in the allowed origins list in `backend/src/index.ts`. We set it to `process.env.FRONTEND_URL`, so add `FRONTEND_URL=https://vijadprojects.com` in your backend `.env` on cPanel.
