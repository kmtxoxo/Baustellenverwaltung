import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-construction-site-download-dialog',
  templateUrl: './construction-site-download-dialog.component.html',
  styleUrls: ['./construction-site-download-dialog.component.scss'],
})
export class ConstructionSiteDownloadDialogComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConstructionSiteDownloadDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { material: boolean; worktime: boolean }
  ) {}

  ngOnInit(): void {}
}
