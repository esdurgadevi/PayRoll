import db from "../models/index.js";

const {
  Issue,
  IssueItem,
  MixingGroup,
  InwardLotWeightment,
} = db;

/* CREATE ISSUE + ITEMS */
export const create = async (data) => {
  const {
    issueNumber,
    issueDate,
    mixingNo,
    mixingGroupId,
    toMixingGroupId,
    items,
  } = data;

  if (
    !issueNumber ||
    !issueDate ||
    !mixingNo ||
    !mixingGroupId ||
    !toMixingGroupId ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new Error("Missing required fields");
  }

  // FK validation
  const mg = await MixingGroup.findByPk(mixingGroupId);
  const tmg = await MixingGroup.findByPk(toMixingGroupId);
  if (!mg || !tmg) {
    throw new Error("Invalid mixing group");
  }

  const issue = await Issue.create({
    issueNumber,
    issueDate,
    mixingNo,
    mixingGroupId,
    toMixingGroupId,
    issueQty: items.length,
  });

  for (const item of items) {
    const weightment = await InwardLotWeightment.findByPk(item.weightmentId);
    if (!weightment) {
      throw new Error("Invalid weightmentId");
    }

    await IssueItem.create({
      issueId: issue.id,
      weightmentId: item.weightmentId,
      issueWeight: item.issueWeight,
    });
  }

  return issue;
};

/* GET ALL */
export const getAll = async () => {
  return await Issue.findAll({
    include: [
      {
        model: IssueItem,
        include: [InwardLotWeightment],
      },
      { model: MixingGroup, as: "mixingGroup" },
      { model: MixingGroup, as: "toMixingGroup" },
    ],
    order: [["id", "DESC"]],
  });
};

/* GET BY ID */
export const getById = async (id) => {
  const issue = await Issue.findByPk(id, {
    include: [
      {
        model: IssueItem,
        include: [InwardLotWeightment],
      },
    ],
  });

  if (!issue) {
    throw new Error("Issue not found");
  }

  return issue;
};

/* DELETE */
export const remove = async (id) => {
  const issue = await Issue.findByPk(id);
  if (!issue) {
    throw new Error("Issue not found");
  }

  await issue.destroy();
};
