# BVTC-BAD Project - Collab Guide

Hi guys! See below for a step-by-step guide on how to proceed!

---

## Situation A: You haven't started anything yet
**Do this if you have no code on your laptop and are setting up for the first time.**

1. **Clone the Repository:**
   Open your terminal/command prompt and run:
   ```bash
   git clone [https://github.com/marcdmd/BVTC-Project.git](https://github.com/marcdmd/BVTC-Project.git)
   cd BVTC-Project
   ```

2. **Set up the Virtual Environment (Optional but Recommended):**
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```

3. **Install Django:**
   ```bash
   pip install django
   ```

4. **Run Migrations (Create the Database):**
   ```bash
   python manage.py migrate
   ```

5. **Create a Superuser:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the Server:**
   ```bash
   python manage.py runserver
   ```
   Go to `http://127.0.0.1:8000/` to confirm it works.

---

## Situation B: You already have code on your laptop
**Do this if you already built models, views, or templates locally and want to transfer them to this official project.**

**Important:** You cannot just "merge" folders. You must manually copy your specific files into this official structure.

1. **Clone the Official Repo (in a new folder):**
   Go to a generic folder (like `Documents/MSYS42`) and clone this repo:
   ```bash
   git clone [https://github.com/marcdmd/BVTC-Project.git](https://github.com/marcdmd/BVTC-Project.git)
   ```
   *Note: Do not create a new folder manually. Just go to where you want the project to be created and Git will automatically create the `BVTC-Project` folder for you.*

2. **Manually Copy Your Files:**
   * Open your *old* project folder.
   * Open the new `BVTC-Project` folder you just cloned.
   * **Models:** Copy your model classes from your old `models.py` and paste them into `BVTCApp/models.py`.
   * **Views:** Copy your functions from your old `views.py` and paste them into `BVTCApp/views.py`.
   * **Templates:** Copy your `.html` files into the `BVTCApp/templates/` folder.
   * **URLs:** Copy your paths from your old `urls.py` into `BVTCApp/urls.py`.

3. **Test It:**
   Run `python manage.py runserver` inside the new `BVTC-Project` folder to make sure your copied code works.

4. **Push Your Changes:**
   Once your code is integrated and working, follow the steps in **Situation C (Starting from No. 3)** below to upload it.

---

## Situation C: The Daily Routine (Coding & Pushing)
**Do this every time you sit down to write code or make edits.**

### 1. Start Fresh (Pull)
**ALWAYS** do this before you type a single line of code to avoid conflicts.
```bash
git pull origin main
```

### 2. Code & Test
Make your changes in VS Code (edit views, add HTML, etc.).
**Crucial:** Run the server to ensure your changes didn't break anything:
```bash
python manage.py runserver
```

### 3. Save to Git (Add & Commit)
When you are happy with your work:
```bash
git add .
git commit -m "Short description of what I changed (e.g. Added login page)"
```

### 4. Upload (Push)
Send your changes to GitHub so the rest of us can see them.
```bash
git push origin main
```

### 5. Final step: Notify the GC!
Let the others know if and what you've edited para we're all on the same page and we know if we can work on it na as well! 
```bash
Note: Better if one working at a time to avoid conflicts in the files, kaya it's important to notify if you're working on it and once you're done!
```

---

### Authentication Note
When pushing, command prompt asks for a Username and password. For the **Password**, it is **NOT** your GitHub account password. For reference:
1. **Username:** Your GitHub username.
2. **Password:** Your **Personal Access Token**.
   * *If you don't have one, generate it here:* [https://github.com/settings/tokens](https://github.com/settings/tokens)
   * *Make sure to check the `repo` box when creating the token.*
   * The token looks something like ghp_EQS62fCHUCHUCHUCHU...
   * When prompted for a password, just paste on CMD. You will not see it but it's there so pwedeng enter nalang
