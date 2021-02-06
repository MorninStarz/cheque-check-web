export class AccountForm {
    account_no: string = '';
    account_name: string = '';
    bank_id: string = '';
    branch_id: string = '';
    customer_id: string = '';
}

export class AccountItem {
    no: number;
    account_id: string;
    account_no: string;
    account_name: string;
    bank_name: string;
    branch_name: string;
    customer_name: string;
    status: string;
}

export class AccountData {
    account_id: string = '';
    account_no: string = '';
    account_name: string = '';
    bank_id: string = '';
    branch_id: string = '';
}