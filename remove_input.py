with open('src/pages/MovieDetails.tsx', 'r') as f:
    content = f.read()

import re
content = re.sub(r'<div className="mb-6 flex gap-2">.*?Apply URL\s*</button>\s*</div>', '', content, flags=re.DOTALL)

with open('src/pages/MovieDetails.tsx', 'w') as f:
    f.write(content)

print("Input removed")
