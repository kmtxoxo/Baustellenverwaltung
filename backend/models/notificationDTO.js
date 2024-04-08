class NotificationDTO {
    constructor(notification) {
      this.type = notification.type ? notification.type : null;
      this.text  = notification.text ? notification.text : null;
      this.timestamp = notification.timestamp ? notification.timestamp : null;
      this.id = notification.id ? notification.id : null;
      this.constructionSiteId = notification.constructionSiteId ? notification.constructionSiteId : null;
    }
}
  
module.exports = NotificationDTO;
