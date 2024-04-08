import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConstructionSite } from 'src/app/models/constructionSite';
import { Contact } from 'src/app/models/contact';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-construction-site-dialog',
  templateUrl: './construction-site-dialog.component.html',
  styleUrls: ['./construction-site-dialog.component.scss']
})
export class ConstructionSiteDialogComponent implements OnInit {


  form: FormGroup;

  editBaustelle: boolean;
  constructor(
    public dialogRef: MatDialogRef<ConstructionSiteDialogComponent>,
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public baustelle: { data: ConstructionSite, action: string }) { }

  ngOnInit() {
    if (!this.baustelle.data) {
      this.baustelle.data = new ConstructionSite();
      this.baustelle.data.contact = new Contact();
      this.editBaustelle = false;
    } else {
      this.editBaustelle = true;
    }

    this.form = new FormGroup({
      name: new FormControl(this.baustelle.data.name ? this.baustelle.data.name : '', [Validators.required, Validators.minLength(3)]),
      address: new FormControl(this.baustelle.data.contact.address ? this.baustelle.data.contact.address : ''),
      email: new FormControl(this.baustelle.data.contact.email ? this.baustelle.data.contact.email : ''),
      customerName: new FormControl(this.baustelle.data.contact.name ? this.baustelle.data.contact.name : ''),
      city: new FormControl(this.baustelle.data.contact.city ? this.baustelle.data.contact.city : ''),
      zip: new FormControl(this.baustelle.data.contact.zip ? this.baustelle.data.contact.zip : '', [Validators.pattern('[0-9]*')]),
      phone: new FormControl(
        this.baustelle.data.contact.phone ? this.baustelle.data.contact.phone : '', [Validators.pattern('[0-9]*')]),
      createdBy: new FormGroup({
        user: new FormControl(this.baustelle.data.createdBy?.user ? this.baustelle.data.createdBy.user : ''),
        userId: new FormControl(this.baustelle.data.createdBy?.userId ? this.baustelle.data.createdBy.userId : ''),
      })
    });
  }


  onCreateClicked() {
    this.baustelle.action = 'create';
    this.baustelle.data.name = this.form.value.name;
    this.baustelle.data.contact.address = this.form.value.address;
    this.baustelle.data.contact.email = this.form.value.email;
    this.baustelle.data.contact.name = this.form.value.customerName;
    this.baustelle.data.contact.city = this.form.value.city;
    this.baustelle.data.contact.zip = this.form.value.zip;
    this.baustelle.data.contact.phone = this.form.value.phone;
    this.baustelle.data.status = 'open';
    this.baustelle.data.createdBy = { user: null, userId: null};
    this.dialogRef.close(this.baustelle);
  }

  onSaveChangeClicked() {
    this.baustelle.action = 'edit';
    this.baustelle.data.name = this.form.value.name;
    this.baustelle.data.contact.address = this.form.value.address;
    this.baustelle.data.contact.email = this.form.value.email;
    this.baustelle.data.contact.name = this.form.value.customerName;
    this.baustelle.data.contact.city = this.form.value.city;
    this.baustelle.data.contact.zip = this.form.value.zip;
    this.baustelle.data.contact.phone = this.form.value.phone;
    this.dialogRef.close(this.baustelle);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }

}
