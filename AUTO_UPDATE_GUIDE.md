# 🔄 How to Release Updates for HabitOS

I have configured **Automatic Updates** for your users.
Here is the hassel-free user experience:
1.  User opens HabitOS.
2.  If an update exists, it downloads silently in the background.
3.  When finished, it asks "Update Ready. Restart now?" (or restarts automatically next time).

---

## 🚀 How YOU Perform a Release (Developer Steps)

To trigger this "magic" for your users, you simply need to create a **GitHub Release**.

### 1. Update Version Number
Open `package.json` and increase the version number (e.g., `0.1.0` -> `0.1.1`):
```json
"version": "0.1.1"
```

### 2. Build and Publish
You need a strict environment to build valid update files.
Run this command in your terminal:

```bash
# This will build the .exe AND upload it to GitHub Releases
# You need a GH_TOKEN environment variable for this to work automatically
npm run electron:build -- --publish always
```

*(If the upload fails locally due to missing tokens, you can simply upload the `.exe` and `latest.yml` files manually to a new Release on GitHub.com)*.

### 3. Verify
Go to `https://github.com/Gunesh22/HabitOS-Final/releases`.
*   You should see a new "Draft" release.
*   **Edit** it -> Click **Publish Release**.

Boom! 💥 Every user in the world will now receive the update automatically.
