const prev = { displayName: '', photoURL: '' };
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
