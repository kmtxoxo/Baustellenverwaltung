class ContactDTO {
  constructor(materialEntry) {
    this.name = materialEntry.name ? materialEntry.name : null;
    this.email = materialEntry.email ? materialEntry.email : null;
    this.address = materialEntry.address ? materialEntry.address : null;
    this.zip = materialEntry.zip ? materialEntry.zip : null;
    this.city = materialEntry.city ? materialEntry.city : null;
    this.phone = materialEntry.phone ? materialEntry.phone : null;
  }

}

module.exports = ContactDTO;
