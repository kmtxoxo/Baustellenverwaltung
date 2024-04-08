class NoteDTO {
    constructor(noteEntry) {
      this.id = noteEntry.id ? noteEntry.id : null;
      this.createdBy = noteEntry.createdBy?
      typeof noteEntry.createdBy === "string" ||
      noteEntry.createdBy instanceof String
        ? JSON.parse(noteEntry.createdBy)
        : {
            user: noteEntry.createdBy.user,
            userId: noteEntry.createdBy.userId,
          } : {}
      this.constructionSiteId = noteEntry.constructionSiteId;
      this.title = noteEntry.title;
      this.text = noteEntry.text ? noteEntry.text : null;
      this.modifiedAt = noteEntry.modifiedAt;
    }
  }
  
  module.exports = NoteDTO;
  