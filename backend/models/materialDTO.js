class MaterialDTO {
  constructor(materialEntry) {
    this.id = materialEntry.id ? materialEntry.id : null;
    this.createdBy = materialEntry.createdBy?
    typeof materialEntry.createdBy === "string" ||
    materialEntry.createdBy instanceof String
      ? JSON.parse(materialEntry.createdBy)
      : {
          user: materialEntry.createdBy.user,
          userId: materialEntry.createdBy.userId,
        } : {}
    this.constructionSiteId = materialEntry.constructionSiteId;
    this.amount = materialEntry.amount;
    this.name = materialEntry.name;
    this.unit = materialEntry.unit ? materialEntry.unit : null;
    this.modifiedAt = materialEntry.modifiedAt;
  }
}

module.exports = MaterialDTO;
