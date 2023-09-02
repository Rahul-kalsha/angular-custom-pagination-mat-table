import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { startWith, tap } from 'rxjs/operators';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

const ELEMENT_DATA: PeriodicElement[] | any = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He', key: 'lorem' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be', key: 'ipsum' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
  { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
  { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
  { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
  { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
  { position: 11, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
];

/**
 * @title Basic use of `<table mat-table>`
 */
@Component({
  selector: 'table-basic-example',
  styleUrls: ['table-basic-example.css'],
  templateUrl: 'table-basic-example.html',
})
export class TableBasicExample implements OnInit {
  displayedColumns: string[] = ['position', 'key', 'name', 'weight', 'symbol', 'action'];
  dataSource = new MatTableDataSource<FormGroup>();

  isLoading = true;

  pageNumber: number = 1;
  VOForm: FormGroup;
  isEditableNew: boolean = true;
  constructor(
    private fb: FormBuilder,
    private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.VOForm = this._formBuilder.group({
      // VORows: this._formBuilder.array([])
    });

    // this.VOForm = this.fb.group({
    //   VORows: this.fb.array(ELEMENT_DATA.map(val => this.fb.group({
    //     position: new FormControl(val.position),
    //     name: new FormControl(val.name),
    //     weight: new FormControl(val.weight),
    //     symbol: new FormControl(val.symbol),
    //     action: new FormControl('existingRecord'),
    //     isEditable: new FormControl(true),
    //     isNewRow: new FormControl(false),
    //   })
    //   )) //end of fb array
    // }); // end of form group cretation
    this.isLoading = false;
    this.dataSource = new MatTableDataSource<FormGroup>(ELEMENT_DATA.map((val: any) => this.createFormGroup(val)));
    this.dataSource.paginator = this.paginator;

    const filterPredicate = this.dataSource.filterPredicate;
    this.dataSource.filterPredicate = (data: AbstractControl, filter) => {
      return filterPredicate.call(this.dataSource, data.value, filter);
    }

    //Custom filter according to name column
    // this.dataSource.filterPredicate = (data: {name: string}, filterValue: string) =>
    //   data.name.trim().toLowerCase().indexOf(filterValue) !== -1;
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  createFormGroup(data: any): FormGroup {
    return this.fb.group({
      position: new FormControl(data.position),
      name: new FormControl(data.name),
      weight: new FormControl(data.weight),
      symbol: new FormControl(data.symbol),
      action: new FormControl('existingRecord'),
      isEditable: new FormControl(true),
      isNewRow: new FormControl(false),
      key: new FormControl(data?.key),
    });
  }
  
  goToPage() {
    this.paginator.pageIndex = this.pageNumber - 1;
    this.paginator.page.next({
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.paginatorList = document.getElementsByClassName('mat-paginator-range-label');

    this.onPaginateChange(this.paginator, this.paginatorList);

    this.paginator.page.subscribe(() => { // this is page change event
      this.onPaginateChange(this.paginator, this.paginatorList);
    });
  }

  applyFilter(event: Event) {
    //  debugger;
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  // @ViewChild('table') table: MatTable<PeriodicElement>;
  AddNewRow() {
    const newRow = this.createFormGroup({ position: this.dataSource.data.length + 1, name: '', weight: 0, symbol: '', action: 'newRecord', key: null, isEditable: false, isNewRow: true });
    
    // Add the new row to the beginning of the data source
    this.dataSource.data.unshift(newRow);
  
    // Calculate the new page index
    const newPageIndex = Math.floor(this.dataSource.data.indexOf(newRow) / this.paginator.pageSize);
  
    // Update the paginator's pageIndex property
    this.paginator.pageIndex = newPageIndex;
  
    // Trigger data update and paginator update
    this.dataSource._updateChangeSubscription();
    this.paginator._changePageSize(this.paginator.pageSize);

    // const control = this.VOForm.get('VORows') as FormArray;
    // control.insert(0, this.initiateVOForm());
    // this.dataSource = new MatTableDataSource(control.controls)
    // control.controls.unshift(this.initiateVOForm());
    // this.openPanel(panel);
    // this.table.renderRows();
    // this.dataSource.data = this.dataSource.data;
  }
  
  // this function will enabled the select field for editd
  EditSVO(rowData: any, rowIndex : number) {
    const rowFormGroup:any = this.dataSource.data[rowIndex];
    // rowFormGroup.get('isEditable').setValue(false);
    rowData.get('isEditable').setValue(false);

  }

  // On click of correct button in table (after click on edit) this method will call
  SaveVO(rowData: any, rowIndex: number) {
    // alert('SaveVO')
    const rowFormGroup:any = this.dataSource.data[rowIndex];
    // rowFormGroup.get('isEditable').setValue(true);
    rowData.get('isEditable').setValue(true);
  }

  // On click of cancel button in the table (after click on edit) this method will call and reset the previous data
  CancelSVO(rowData: any, rowIndex: number) {
    const rowFormGroup: any = this.dataSource.data[rowIndex];
    // rowFormGroup.get('isEditable').setValue(true);
    rowData.get('isEditable').setValue(true);
  }


  paginatorList: HTMLCollectionOf<Element>;
  idx: number;
  onPaginateChange(paginator: MatPaginator, list: HTMLCollectionOf<Element>) {
    setTimeout((idx: any) => {
      let from = (paginator.pageSize * paginator.pageIndex) + 1;

      let to = (paginator.length < paginator.pageSize * (paginator.pageIndex + 1))
        ? paginator.length
        : paginator.pageSize * (paginator.pageIndex + 1);

      let toFrom = (paginator.length == 0) ? 0 : `${from} - ${to}`;
      let pageNumber = (paginator.length == 0) ? `0 of 0` : `${paginator.pageIndex + 1} of ${paginator.getNumberOfPages()}`;
      let rows = `Page ${pageNumber} (${toFrom} of ${paginator.length})`;

      if (list.length >= 1)
        list[0].innerHTML = rows;

    }, 0, paginator.pageIndex);
  }


  // initiateVOForm(): FormGroup {
  //   console.log((this.VOForm.get('VORows') as FormArray))
  //   return this.fb.group({
  //     position: new FormControl((this.VOForm.get('VORows') as FormArray).value.length + 1),
  //     name: new FormControl(''),
  //     weight: new FormControl(''),
  //     symbol: new FormControl(''),
  //     action: new FormControl('newRecord'),
  //     isEditable: new FormControl(false),
  //     isNewRow: new FormControl(true),
  //   });
  // }

}


/**  Copyright 2020 Google LLC. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */