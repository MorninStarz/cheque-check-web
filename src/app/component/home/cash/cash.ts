export class CashForm {
    account_id: string = '';
    customer_id: string = '';
    bank_id: string = '';
    branch_id: string = '';
    transfer_date_from: any = '';
    transfer_date_to: any = '';
    amount: any = '';
}

export class CashItem {
    no: number;
    account_id: string;
    account_no: string;
    customer_id: string;
    customer_name: string;
    customer_lastname: string;
    bank_id: string;
    bank_name: string;
    branch_id: string;
    branch_name: string;
    amount: string;
    transfer_date: string;
}