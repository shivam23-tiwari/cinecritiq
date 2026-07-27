import re

with open('src/pages/Profile.tsx', 'r') as f:
    content = f.read()

with open('new_header.txt', 'r') as f:
    new_header = f.read()

# First we need to get rid of the messy sed output.
# Actually, the file was just appended? 
# Let's find the original start and end.
# We will use regex to find the block {!isEditing ? ( ... ) : (
pattern = re.compile(r'\{!isEditing \? \([\s\S]*?\) : \(', re.MULTILINE)
matches = list(pattern.finditer(content))

if len(matches) > 0:
    # Replace the FIRST matched block
    new_content = content[:matches[0].start()] + new_header + content[matches[0].end():]
    with open('src/pages/Profile.tsx', 'w') as f:
        f.write(new_content)
