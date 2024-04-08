class TaskDTO {
    constructor(taskEntry) {
      this.id = taskEntry.id ? taskEntry.id : null;
      this.createdBy = taskEntry.createdBy?
        typeof taskEntry.createdBy === "string" ||
        taskEntry.createdBy instanceof String
          ? JSON.parse(taskEntry.createdBy)
          : {
              user: taskEntry.createdBy.user,
              userId: taskEntry.createdBy.userId,
            } : {}
      this.assignedTo =
        typeof taskEntry.assignedTo === "string" ||
        taskEntry.assignedTo instanceof String
          ? JSON.parse(taskEntry.assignedTo)
          : {
              user: taskEntry.assignedTo.user,
              userId: taskEntry.assignedTo.userId,
            };
      this.constructionSiteId = taskEntry.constructionSiteId;
      this.title = taskEntry.title;
      this.text = taskEntry.text ? taskEntry.text : null;
      this.status = taskEntry.status;
      this.priority = taskEntry.priority;
      this.modifiedAt = taskEntry.modifiedAt? taskEntry.modifiedAt: null;
      this.createdAt = taskEntry.createdAt? taskEntry.createdAt : null;
    }
  }
  
  module.exports = TaskDTO;
  