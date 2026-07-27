sed -i -e '/{!isEditing ? (/,/<\/div>\n      ) : (/!b' -e '/{!isEditing ? (/,/<\/div>\n      ) : (/!d' -e '/{!isEditing ? (/r new_header.txt' src/pages/Profile.tsx
