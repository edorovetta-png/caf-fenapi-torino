import os
import re

def update_frontend():
    frontend_dir = "frontend"
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                # Replace <div class="logo-icon">CF</div> with img
                # Determine relative path depth
                depth = path.count(os.sep) - 1
                img_path = "images/logo-fenapi.png" if depth == 0 else "../" * depth + "images/logo-fenapi.png"

                new_icon = f'<img src="{img_path}" alt="FENAPI" class="logo-icon-img" style="height: 100%; width: 100%; object-fit: contain;">'
                
                # We need to replace only if it's the CF text inside the styled div
                # The HTML has <div class="logo-icon">CF</div>
                content = re.sub(r'<div class="logo-icon"[^>]*>CF</div>', f'<div class="logo-icon" style="background:transparent;">{new_icon}</div>', content)
                
                # Similarly for logo-mark
                content = re.sub(r'<div class="logo-mark"[^>]*>CF</div>', f'<div class="logo-mark" style="background:transparent;">{new_icon}</div>', content)

                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)

def update_caffenapi():
    src_dir = os.path.join("caffenapi", "src")
    files_to_update = [
        os.path.join(src_dir, "components", "Header.tsx"),
        os.path.join(src_dir, "components", "Footer.tsx"),
        os.path.join(src_dir, "pages", "AdminDashboard.tsx"),
        os.path.join(src_dir, "pages", "AdminLogin.tsx")
    ]
    for path in files_to_update:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Replace bg-primary text-primary-foreground font-extrabold with bg-transparent
            content = content.replace("bg-primary text-primary-foreground font-extrabold", "bg-transparent")
            # Replace "CF" (with surrounding whitespace) with img
            content = re.sub(r'>\s*CF\s*<', r'>\n              <img src="/logo-fenapi.png" alt="Logo FENAPI" className="w-full h-full object-contain drop-shadow-sm" />\n            <', content)

            with open(path, "w", encoding="utf-8") as f:
                f.write(content)

if __name__ == "__main__":
    update_frontend()
    update_caffenapi()
    print("Logos updated successfully.")
