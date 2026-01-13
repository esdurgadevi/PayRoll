import db from "../models/index.js";
import { getNextLotNo } from "../utils/helpers.js";

const { LotEntry, InwardEntry, Godown } = db;

export const createLotEntry = async (data) => {
  const { inwardId } = data;

  if (!inwardId) throw new Error("Inward ID is required");
  
  // Auto-generate lotNo if not provided
  if (!data.lotNo) {
    data.lotNo = await getNextLotNo();
  }

  // Validate inward exists
  const inward = await InwardEntry.findByPk(inwardId);
  if (!inward) throw new Error("Referenced Inward Entry not found");

  // Validate godown if provided
  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  return await LotEntry.create(data);
};

export const getAllLotEntries = async () => {
  return await LotEntry.findAll({
    include: [
      { model: InwardEntry, as: "inwardEntry", attributes: ["id", "inwardNo"] },
      { model: Godown, as: "godown", attributes: ["id", "godownName"] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const getLotEntryById = async (id) => {
  const entry = await LotEntry.findByPk(id, {
    include: [
      { model: InwardEntry, as: "inwardEntry" },
      { model: Godown, as: "godown" },
    ],
  });
  if (!entry) throw new Error("Lot entry not found");
  return entry;
};

export const updateLotEntry = async (id, data) => {
  const entry = await LotEntry.findByPk(id);
  if (!entry) throw new Error("Lot entry not found");

  if (data.inwardId && data.inwardId !== entry.inwardId) {
    const inward = await InwardEntry.findByPk(data.inwardId);
    if (!inward) throw new Error("Referenced Inward Entry not found");
  }

  if (data.godownId) {
    const godown = await Godown.findByPk(data.godownId);
    if (!godown) throw new Error("Godown not found");
  }

  return await entry.update(data);
};

export const deleteLotEntry = async (id) => {
  const entry = await LotEntry.findByPk(id);
  if (!entry) throw new Error("Lot entry not found");
  await entry.destroy();
};