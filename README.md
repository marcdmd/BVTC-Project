## Situation A: You haven't started anything yet
**Do this if you have no code on your laptop.**

1.  **Clone the Repository:**
    Open your terminal/command prompt and run:
    ```bash
    git clone [https://github.com/marcdmd/BVTC-Project.git](https://github.com/marcdmd/BVTC-Project.git)
    cd BVTC-Project
    ```

2.  **Set up the Virtual Environment (Optional but Recommended):**
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # Mac/Linux:
    source venv/bin/activate
    ```

3.  **Install Django:**
    ```bash
    pip install django
    ```

4.  **Run Migrations (Create the Database):**
    ```bash
    python manage.py migrate
    ```

5.  **Create a Superuser:**
    ```bash
    python manage.py createsuperuser
    ```

6.  **Run the Server:**
    ```bash
    python manage.py runserver
    ```
    Go to `http://127.0.0.1:8000/` to confirm it works.

---

## Situation B: You already have code on your laptop
**Do this if you already built models, views, or templates locally.**

**Important:** You cannot just "merge" two different Django projects. You must copy your specific files into this official project structure.

1.  **Clone the Official Repo (in a new folder):**
    Go to a different folder on your computer (e.g., `Documents/GroupProject`) and clone this repo:
    ```bash
    git clone [https://github.com/marcdmd/BVTC-Project.git](https://github.com/marcdmd/BVTC-Project.git)
    ```

2.  **Manually Copy Your Files:**
    * Open your *old* project folder.
    * Open the new `BVTC-Project` folder you just cloned.
    * **Models:** Copy your model classes from your old `models.py` and paste them into `BVTCApp/models.py`.
    * **Views:** Copy your functions from your old `views.py` and paste them into `BVTCApp/views.py`.
    * **Templates:** Copy your `.html` files into the `BVTCApp/templates/` folder.
    * **URLs:** Copy your paths from your old `urls.py` into `BVTCApp/urls.py`.

3.  **Test It:**
    Run `python manage.py runserver` inside the new `BVTC-Project` folder to make sure everything works.

4.  **Push Your Changes:**
    Once your code is integrated and working:
    ```bash
    git add .
    git commit -m "Integrated my features into main project"
    git push origin main
    ```

---

## ⚡ How to Avoid Conflicts (Daily Routine)
Before you start working every day, ALWAYS do this first:

1.  **Pull the latest changes:**
    ```bash
    git pull origin main
    ```
2.  **Make your changes.**
3.  **Push your work:**
    ```bash
    git add .
    git commit -m "Description of what you did"
    git push origin main
    ```
