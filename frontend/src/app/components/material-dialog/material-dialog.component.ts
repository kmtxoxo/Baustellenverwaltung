import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Material } from 'src/app/models/material';
import { MaterialService } from 'src/app/services/material.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-material-dialog',
  templateUrl: './material-dialog.component.html',
  styleUrls: ['./material-dialog.component.scss']
})
export class MaterialDialogComponent implements OnInit, OnDestroy {

  form: FormGroup;
  editMaterial: boolean;
  subscriptions: Subscription[] = [];

  lastTimeFilterdMaterial: number;
  lastTimeFilterdUnit: number;
  filteredOptions: string[];
  filteredMaterialOptions: string[];
  constructor(
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    private materialService: MaterialService,
    @Inject(MAT_DIALOG_DATA) public material: { data: Material, action: string }) { }

  ngOnInit() {
    this.lastTimeFilterdUnit = performance.now();
    this.lastTimeFilterdMaterial = performance.now();
    if (!this.material.data) {
      this.material.data = new Material();
      this.editMaterial = false;
    } else {
      this.editMaterial = true;
    }

    this.form = new FormGroup({
      name: new FormControl(this.material.data.name ? this.material.data.name : '', [Validators.required, Validators.minLength(3)]),
      amount: new FormControl(this.material.data.amount ? this.material.data.amount : '', [Validators.required, Validators.minLength(1)]),
      unit: new FormControl(this.material.data.unit ? this.material.data.unit : ''),
    });

    this.form.controls.unit.valueChanges.subscribe(
      (value) => {
        const timeDiff = (performance.now() - this.lastTimeFilterdUnit)  / 1000;
        if (timeDiff > 2 && value && value.length >= 3) {
          this.lastTimeFilterdUnit = performance.now();
          this.filterEinheit(value);
        }
      });
    this.form.controls.name.valueChanges.subscribe(
      (value) => {
        const timeDiff = (performance.now() - this.lastTimeFilterdMaterial)  / 1000;
        if (timeDiff > 2 && value && value.length >= 3) {
          this.lastTimeFilterdMaterial = performance.now();
          this.filterMaterial(value);
        }
      });
  }
  removeUnitOption(option: string) {
    const index = this.filteredOptions.indexOf(option);
    if (index >= 0) {
      this.materialService.removeAutocompleteEinheit(option);
      this.filteredOptions = [];
      this.form.controls.unit.setValue('');
    }
  }

  removeMaterialOption(option: string) {
    const index = this.filteredMaterialOptions.indexOf(option);
    if (index >= 0) {
      this.materialService.removeAutocompleteMaterial(option);
      this.filteredMaterialOptions = [];
      this.form.controls.name.setValue('');
    }
  }

  private filterMaterial(value: string) {
    this.materialService.getMaterialAutocomplete(value).then((autocomplete) => {
      this.filteredMaterialOptions = autocomplete;
    }).catch((e) => {
      this.filteredMaterialOptions = [];
    });
  }
  private filterEinheit(value: string) {
    this.materialService.getEinheitenAutocomplete(value).then((autocomplete) => {
      this.filteredOptions = autocomplete;
    }).catch((e) => {
      this.filteredOptions = [];
    });
  }

  onCreateClicked() {
    this.material.action = 'create';
    this.material.data.name = this.form.value.name;
    this.material.data.amount = (typeof this.form.value.amount === 'string') ?
      parseInt(this.form.value.amount, 10) : this.form.value.amount;
    this.material.data.unit = this.form.value.unit ? this.form.value.unit : null;
    this.dialogRef.close(this.material);
  }

  onSaveChangeClicked() {
    this.material.action = 'edit';
    this.material.data.name = this.form.value.name;
    this.material.data.amount = (typeof this.form.value.amount === 'string') ?
      parseInt(this.form.value.amount, 10) : this.form.value.amount;
    this.material.data.unit = this.form.value.unit ? this.form.value.unit : null;
    this.dialogRef.close(this.material);
  }

  onDeleteClicked() {
    this.material.action = 'delete';
    this.dialogRef.close(this.material);
  }

  onCancelClicked() {
    this.dialogRef.close();
  }


  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      sub.unsubscribe();
    });
  }
}
