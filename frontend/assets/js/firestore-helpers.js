import { firestore } from './app.js';
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

export async function saveEmotion(record) {
  const col = collection(firestore, 'emotion_history');
  const docRef = await addDoc(col, record);
  return docRef.id;
}

export async function fetchRecent(limitCount = 20) {
  const q = query(
    collection(firestore, 'emotion_history'),
    orderBy('ts', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}