class WorktimeDTO {
  constructor(worktimeEntry) {
    this.id = worktimeEntry.id ? worktimeEntry.id : null;
    this.createdBy = worktimeEntry.createdBy?
    typeof worktimeEntry.createdBy === "string" ||
    worktimeEntry.createdBy instanceof String
      ? JSON.parse(worktimeEntry.createdBy)
      : {
          user: worktimeEntry.createdBy.user,
          userId: worktimeEntry.createdBy.userId,
        } : {}
    this.constructionSiteId = worktimeEntry.constructionSiteId;
    this.hours = worktimeEntry.hours;
    this.minutes = worktimeEntry.minutes;
    this.text = worktimeEntry.text;
    this.modifiedAt = worktimeEntry.modifiedAt;
    this.start = worktimeEntry.start;
    this.end = worktimeEntry.end;
  }
}

module.exports = WorktimeDTO;
