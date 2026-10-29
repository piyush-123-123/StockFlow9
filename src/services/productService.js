
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
  runTransaction,
} from 'firebase/firestore';
import { db } from '../firebase';

function productsCollection(orgId) {
  return collection(db, 'organizations', orgId, 'products');
}

function skuDocument(orgId, sku) {
  const normalizedSku = sku.trim().toUpperCase();
  const skuId = encodeURIComponent(normalizedSku);

  return doc(db, 'organizations', orgId, 'skuIndex', skuId);
}

function normalizeProduct(product) {
  return {
    name: product.name.trim(),
    sku: product.sku.trim(),
    description: (product.description || '').trim(),
    quantity: Number(product.quantity),
    costPrice:
      product.costPrice === '' ? null : Number(product.costPrice),
    sellingPrice:
      product.sellingPrice === '' ? null : Number(product.sellingPrice),
    lowStockThreshold:
      product.lowStockThreshold === ''
        ? null
        : Number(product.lowStockThreshold),
  };
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
  const productRef = doc(productsCollection(orgId));
  const skuRef = skuDocument(orgId, product.sku);
  const productData = normalizeProduct(product);

  await runTransaction(db, async (transaction) => {
    const skuSnapshot = await transaction.get(skuRef);

    if (skuSnapshot.exists()) {
      throw new Error('This SKU already exists in your organization.');
    }

    transaction.set(productRef, {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    transaction.set(skuRef, {
      productId: productRef.id,
      sku: productData.sku,
    });
  });

  return productRef;
}

export async function updateProduct(orgId, productId, product) {
  const productRef = doc(
    db,
    'organizations',
    orgId,
    'products',
    productId
  );

  const productData = normalizeProduct(product);
  const newSkuRef = skuDocument(orgId, productData.sku);

  await runTransaction(db, async (transaction) => {
    const productSnapshot = await transaction.get(productRef);

    if (!productSnapshot.exists()) {
      throw new Error('Product not found.');
    }

    const oldProduct = productSnapshot.data();
    const oldSkuRef = skuDocument(orgId, oldProduct.sku);
    const newSkuSnapshot = await transaction.get(newSkuRef);

    const skuChanged =
      oldProduct.sku.trim().toUpperCase() !==
      productData.sku.trim().toUpperCase();

    let oldSkuSnapshot = null;

    if (skuChanged) {
      oldSkuSnapshot = await transaction.get(oldSkuRef);
    }

    if (
      newSkuSnapshot.exists() &&
      newSkuSnapshot.data().productId !== productId
    ) {
      throw new Error('This SKU already exists in your organization.');
    }

    transaction.update(productRef, {
      ...productData,
      updatedAt: serverTimestamp(),
    });

    transaction.set(newSkuRef, {
      productId,
      sku: productData.sku,
    });

    if (
      skuChanged &&
      oldSkuSnapshot?.exists() &&
      oldSkuSnapshot.data().productId === productId
    ) {
      transaction.delete(oldSkuRef);
    }
  });

  return productRef;
}

export async function deleteProduct(orgId, productId) {
  const productRef = doc(
    db,
    'organizations',
    orgId,
    'products',
    productId
  );

  await runTransaction(db, async (transaction) => {
    const productSnapshot = await transaction.get(productRef);

    if (!productSnapshot.exists()) {
      throw new Error('Product not found.');
    }

    const product = productSnapshot.data();
    const skuRef = skuDocument(orgId, product.sku);
    const skuSnapshot = await transaction.get(skuRef);

    transaction.delete(productRef);

    if (
      skuSnapshot.exists() &&
      skuSnapshot.data().productId === productId
    ) {
      transaction.delete(skuRef);
    }
  });
}
