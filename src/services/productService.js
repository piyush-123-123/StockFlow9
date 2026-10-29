
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

function productsCollection(orgId) {
  return collection(db, 'organizations', orgId, 'products');
}

export async function getProducts(orgId) {
  const q = query(
    productsCollection(orgId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));
}

export async function addProduct(orgId, product) {
  return addDoc(productsCollection(orgId), {
    name: product.name.trim(),
    sku: product.sku.trim(),
    description: product.description.trim(),
    quantity: Number(product.quantity),
    costPrice: product.costPrice === '' ? null : Number(product.costPrice),
    sellingPrice: product.sellingPrice === '' ? null : Number(product.sellingPrice),
    lowStockThreshold:
      product.lowStockThreshold === ''
        ? null
        : Number(product.lowStockThreshold),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(orgId, productId, product) {
  const productRef = doc(db, 'organizations', orgId, 'products', productId);

  return updateDoc(productRef, {
    name: product.name.trim(),
    sku: product.sku.trim(),
    description: product.description.trim(),
    quantity: Number(product.quantity),
    costPrice: product.costPrice === '' ? null : Number(product.costPrice),
    sellingPrice: product.sellingPrice === '' ? null : Number(product.sellingPrice),
    lowStockThreshold:
      product.lowStockThreshold === ''
        ? null
        : Number(product.lowStockThreshold),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(orgId, productId) {
  return deleteDoc(doc(db, 'organizations', orgId, 'products', productId));
}
