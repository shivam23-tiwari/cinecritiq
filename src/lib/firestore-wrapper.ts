import {
  onSnapshot as fsOnSnapshot,
  getDoc as fsGetDoc,
  getDocs as fsGetDocs,
  setDoc as fsSetDoc,
  updateDoc as fsUpdateDoc,
  deleteDoc as fsDeleteDoc,
  runTransaction as fsRunTransaction,
  writeBatch as fsWriteBatch
} from 'firebase/firestore';

function handleErr(err: any, type: string) {
  if (String(err).includes('Quota') || String(err).includes('quota') || String(err).includes('resource-exhausted')) {
    window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
    if (type === 'getDoc') {
      return { exists: () => false, data: () => ({}) };
    }
    if (type === 'getDocs') {
      return { docs: [], size: 0, forEach: () => {}, empty: true };
    }
    return null;
  }
  throw err;
}

export const onSnapshot = (query: any, ...args: any[]) => {
  if (args.length === 1 && typeof args[0] === 'function') {
    return fsOnSnapshot(query, args[0], (err: any) => {
      if (String(err).includes('Quota') || String(err).includes('quota') || String(err).includes('resource-exhausted')) {
        window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
      } else {
        console.error("Firestore onSnapshot error:", err);
      }
    });
  } else if (args.length === 2 && typeof args[0] === 'object' && args[0].next) {
      return fsOnSnapshot(query, {
          next: args[0].next,
          error: (err: any) => {
              if (String(err).includes('Quota') || String(err).includes('quota') || String(err).includes('resource-exhausted')) {
                window.dispatchEvent(new CustomEvent('firebase-quota-exceeded'));
              } else if (args[0].error) {
                  args[0].error(err);
              } else {
                  console.error(err);
              }
          }
      });
  }
  // @ts-ignore
  return fsOnSnapshot(query, ...args);
};

export const getDoc = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsGetDoc(...args);
  } catch (err) {
    return handleErr(err, 'getDoc');
  }
};

export const getDocs = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsGetDocs(...args);
  } catch (err) {
    return handleErr(err, 'getDocs');
  }
};

export const setDoc = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsSetDoc(...args);
  } catch (err) {
    return handleErr(err, 'getDoc');
  }
};

export const updateDoc = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsUpdateDoc(...args);
  } catch (err) {
    return handleErr(err, 'getDoc');
  }
};

export const deleteDoc = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsDeleteDoc(...args);
  } catch (err) {
    return handleErr(err, 'getDoc');
  }
};

export const runTransaction = async (...args: any[]) => {
  try {
    // @ts-ignore
    return await fsRunTransaction(...args);
  } catch (err) {
    return handleErr(err, 'getDoc');
  }
};

export const writeBatch = (...args: any[]) => {
  // @ts-ignore
  const batch = fsWriteBatch(...args);
  const originalCommit = batch.commit.bind(batch);
  batch.commit = async () => {
    try {
      return await originalCommit();
    } catch (err) {
      return handleErr(err, 'getDoc');
    }
  };
  return batch;
};

export * from 'firebase/firestore';
