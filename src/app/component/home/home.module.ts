import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CustomerComponent } from './customer/customer.component';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { ModalAddComponent } from './customer/modal-add/modal-add.component';
import { ModalEditComponent } from './customer/modal-edit/modal-edit.component';
import { ModalAddBankComponent } from './bank/modal-add-bank/modal-add-bank.component';
import { PaginationComponent } from './pagination/pagination.component';
import { BankComponent } from './bank/bank.component';
import { ModalViewBankComponent } from './bank/modal-view-bank/modal-view-bank.component';
import { ModalEditBankComponent } from './bank/modal-edit-bank/modal-edit-bank.component';
import { ChequeComponent } from './cheque/cheque.component';
import { ModalAddChequeComponent } from './cheque/modal-add-cheque/modal-add-cheque.component';
import { ModalEditChequeComponent } from './cheque/modal-edit-cheque/modal-edit-cheque.component';
import { TransactionComponent } from './transaction/transaction.component';
import { AccountComponent } from './account/account.component';
import { CashComponent } from './cash/cash.component';
import { ModalAddCashComponent } from './cash/modal-add-cash/modal-add-cash.component';

const routes: Routes = [
  { path: '', component: HomeComponent }
]

@NgModule({
  declarations: [
    HomeComponent, 
    DashboardComponent, 
    CustomerComponent, 
    ModalAddComponent, 
    ModalEditComponent, 
    PaginationComponent, 
    BankComponent, 
    ModalAddBankComponent, 
    ModalViewBankComponent, 
    ModalEditBankComponent, 
    ChequeComponent, 
    ModalAddChequeComponent, 
    ModalEditChequeComponent, 
    TransactionComponent, 
    AccountComponent, CashComponent, ModalAddCashComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatDatepickerModule,
    MatMomentDateModule
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeModule { }
