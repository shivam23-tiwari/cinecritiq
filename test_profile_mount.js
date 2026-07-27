const prev = { displayName: 'shivam', photoURL: 'data:image...' };
const user = { displayName: 'shivam', photoURL: '' };

let result = prev;
if (!prev.displayName && !prev.photoURL) {
    result = {
    ...prev,
    displayName: user.displayName || '',
    photoURL: user.photoURL || ''
    };
}
console.log(result);
