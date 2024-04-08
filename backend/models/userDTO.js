class UserDTO {
  constructor(userEntry) {
    this.id = userEntry.id ? userEntry.id : null;
    this.name = userEntry.name ? userEntry.name.trim() : null;
    this.email = userEntry.email ? userEntry.email.toLowerCase().trim() : null;
    this.address = userEntry.address ? userEntry.address : null;
    this.zip = userEntry.zip ? userEntry.zip : null;
    this.city = userEntry.city ? userEntry.city : null;
    this.phone = userEntry.phone ? userEntry.phone : null;
    this.language = userEntry.language ? userEntry.language : null;
    this.status = userEntry.status ? userEntry.status : null;
    this.role = userEntry.role ? userEntry.role : null;
    if(userEntry.permissions) {
      this.permissions = userEntry.permissions;
    }
    if(userEntry.password){
      this.password = userEntry.password;
    }
  }
}

module.exports = UserDTO;
