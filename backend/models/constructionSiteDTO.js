const ContactDTO = require("./ContactDTO");

class ConstructionSiteDTO {
  constructor(constructionSiteEntry) {
    this.id = constructionSiteEntry.id ? constructionSiteEntry.id : null;
    this.createdBy = constructionSiteEntry.createdBy?
    typeof constructionSiteEntry.createdBy === "string" ||
    constructionSiteEntry.createdBy instanceof String
      ? JSON.parse(constructionSiteEntry.createdBy)
      : {
          user: constructionSiteEntry.createdBy.user,
          userId: constructionSiteEntry.createdBy.userId,
        } : {}
    this.name = constructionSiteEntry.name;
    this.modifiedAt = constructionSiteEntry.modifiedAt;
    this.status = constructionSiteEntry.status;
    this.contact = constructionSiteEntry.contact
      ? new ContactDTO(constructionSiteEntry.contact)
      : new ContactDTO({
          name: constructionSiteEntry.customerName
            ? constructionSiteEntry.customerName
            : null,
          email: constructionSiteEntry.customerEmail
            ? constructionSiteEntry.customerEmail
            : null,
          address: constructionSiteEntry.customerAddress
            ? constructionSiteEntry.customerAddress
            : null,
          zip: constructionSiteEntry.customerZip
            ? constructionSiteEntry.customerZip
            : null,
          city: constructionSiteEntry.customerCity
            ? constructionSiteEntry.customerCity
            : null,
          phone: constructionSiteEntry.customerPhone
            ? constructionSiteEntry.customerPhone
            : null,
        });
  }
}

module.exports = ConstructionSiteDTO;
