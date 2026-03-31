import os
import re

def update_frontend_favicons():
    frontend_dir = "frontend"
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                depth = path.count(os.sep) - 1
                img_path = "images/logo-fenapi.png" if depth == 0 else "../" * depth + "images/logo-fenapi.png"

                # Replace <link rel="icon" type="image/svg+xml" href="...">
                # We can just replace the whole line since we know what it looks like
                content = re.sub(r'<link rel="icon" type="image/svg\+xml" href="data:image/svg\+xml,.+?">', f'<link rel="icon" type="image/png" href="{img_path}">', content)

                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)

if __name__ == "__main__":
    update_frontend_favicons()
    print("Favicons updated successfully.")
