import db from "../../../models/index.js";

const { QCEntry, InwardLot } = db;

export const createQCEntry = async (data, userId) => {
  const lot = await InwardLot.findByPk(data.inwardLotId);
  if (!lot) throw new Error("Inward lot not found");

  const existing = await QCEntry.findOne({
    where: { inwardLotId: data.inwardLotId },
  });
  if (existing) throw new Error("QC entry already exists for this lot");

  return await QCEntry.create({
    ...data,
    lotNo: lot.lotNo,           // copy from InwardLot
    createdBy: userId,
  });
};

export const getQCEntryByLotId = async (inwardLotId) => {
  const entry = await QCEntry.findOne({
    where: { inwardLotId },
    include: [{ model: db.InwardLot, as: "inwardLot", attributes: ["lotNo"] }],
  });
  if (!entry) throw new Error("QC entry not found for this lot");
  return entry;
};

export const updateQCEntry = async (id, data, userId) => {
  const entry = await QCEntry.findByPk(id);
  if (!entry) throw new Error("QC entry not found");

  return await entry.update({
    ...data,
    updatedBy: userId,
  });
};

export const deleteQCEntry = async (id) => {
  const entry = await QCEntry.findByPk(id);
  if (!entry) throw new Error("QC entry not found");
  await entry.destroy(); // or soft-delete if you add deletedAt
  return true;
};