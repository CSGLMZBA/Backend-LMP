import { db } from '../../config/firebase.js';
import admin from 'firebase-admin';

const { FieldValue } = admin.firestore;

const stagesCollectionName = 'stages'; // Easier to update later and to avoid typos

const serializeDoc = (doc) => ({
  id: doc.id,
  ...doc.data()
});

const sortByOrder = (stages) => [...stages].sort((a, b) => {
  const orderA = Number.isInteger(a.order) ? a.order : Number.MAX_SAFE_INTEGER;
  const orderB = Number.isInteger(b.order) ? b.order : Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return String(a.name || '').localeCompare(String(b.name || ''));
});

export const stagesRepository = {
  // CREAR ETAPA
  async create(stageData) {
    const docRef = await db.collection(stagesCollectionName).add({
      ...stageData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const created = await docRef.get();
    return serializeDoc(created);
  },

  // OBTENER ETAPA POR ID
  async findById(stageId) {
    const doc = await db.collection(stagesCollectionName).doc(stageId).get();

    if (!doc.exists) {
      return null;
    }

    return serializeDoc(doc);
  },

  // OBTENER ETAPAS POR CHART ID
  async findByChartId(chartId, teamId) {
    let query = db
      .collection(stagesCollectionName)
      .where('chartId', '==', chartId)
      .where('teamId', '==', teamId)
      .where('isArchived', '!=', true);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return sortByOrder(snapshot.docs.map(doc => serializeDoc(doc)));
  },

  // OBTENER ETAPAS POR TEAM ID
  async findByTeamId(teamId) {
    let query = db
      .collection(stagesCollectionName)
      .where('teamId', '==', teamId)
      .where('isArchived', '!=', true);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return sortByOrder(snapshot.docs.map(doc => serializeDoc(doc)));
  },

  // ACTUALIZAR ETAPA
  async update(stageId, data) {
    const docRef = db.collection(stagesCollectionName).doc(stageId);

    await docRef.update({
      ...data,
      updatedAt: FieldValue.serverTimestamp()
    });

    const updated = await docRef.get();
    return serializeDoc(updated);
  },

  // AGREGAR TAREA A ETAPA
  async addTask(stageId, taskId) {
    const docRef = db.collection(stagesCollectionName).doc(stageId);

    await docRef.update({
      taskIds: FieldValue.arrayUnion(taskId),
      updatedAt: FieldValue.serverTimestamp()
    });

    const updated = await docRef.get();
    return serializeDoc(updated);
  },

  // REMOVER TAREA DE ETAPA
  async removeTask(stageId, taskId) {
    const docRef = db.collection(stagesCollectionName).doc(stageId);

    await docRef.update({
      taskIds: FieldValue.arrayRemove(taskId),
      updatedAt: FieldValue.serverTimestamp()
    });

    const updated = await docRef.get();
    return serializeDoc(updated);
  },

  // SOFT DELETE (borrado lógico)
  async softDelete(stageId) {
    const docRef = db.collection(stagesCollectionName).doc(stageId);

    await docRef.update({
      isArchived: true,
      updatedAt: FieldValue.serverTimestamp(),
      deletedAt: FieldValue.serverTimestamp(),
    });

    const updated = await docRef.get();
    return serializeDoc(updated);
  },

  // ELIMINAR ETAPA FÍSICAMENTE (si es necesario)
  async hardDelete(stageId) {
    const docRef = db.collection(stagesCollectionName).doc(stageId);
    await docRef.delete();
    return { deleted: true, stageId };
  },

  // OBTENER ETAPAS CON WIP LIMIT ALCANZADO
  async findStagesWithWipLimitReached(teamId) {
    const snapshot = await db
      .collection(stagesCollectionName)
      .where('teamId', '==', teamId)
      .where('isArchived', '!=', true)
      .get();

    if (snapshot.empty) {
      return [];
    }

    const stages = snapshot.docs.map(doc => serializeDoc(doc));
    
    // Filtrar etapas que han alcanzado su límite WIP
    return stages.filter(stage => {
      if (!stage.wipLimit) return false;
      const taskCount = (stage.taskIds || []).length;
      return taskCount >= stage.wipLimit;
    });
  },

  // OBTENER ETAPAS POR NOMBRE
  async findByName(name, teamId, chartId) {
    const snapshot = await db
      .collection(stagesCollectionName)
      .where('name', '==', name)
      .where('teamId', '==', teamId)
      .where('chartId', '==', chartId)
      .where('isArchived', '!=', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return serializeDoc(snapshot.docs[0]);
  },

  // CONTAR TAREAS POR ETAPA
  async countTasksInStage(stageId) {
    const stage = await this.findById(stageId);
    if (!stage) return 0;
    return (stage.taskIds || []).length;
  },

  // OBTENER TODAS LAS ETAPAS (con opciones de filtro)
  async findAll(filters = {}) {
    let query = db.collection(stagesCollectionName);

    if (filters.teamId) {
      query = query.where('teamId', '==', filters.teamId);
    }

    if (filters.chartId) {
      query = query.where('chartId', '==', filters.chartId);
    }

    if (filters.isArchived !== undefined) {
      query = query.where('isArchived', '==', filters.isArchived);
    } else {
      query = query.where('isArchived', '!=', true);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return sortByOrder(snapshot.docs.map(doc => serializeDoc(doc)));
  }
};
