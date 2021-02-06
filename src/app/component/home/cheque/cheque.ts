export class DDL {
    value: string;
    text: string;
}

export class ChequeForm {
    cheque_no: string = '';
    customer_id: string = '';
    bank_id: string = '';
    branch_id: string = '';
    pending_date_from: any = '';
    pending_date_to: any = '';
    approve_date_from: any = '';
    approve_date_to: any = '';
    amount: string = '';
    status: string = '';
}

export class ChequeItem {
    no: number;
    cheque_id: string;
    cheque_no: string;
    customer_name: string;
    customer_lastname: string;
    bank_name: string;
    branch_name: string;
    month: string;
    amount: string;
    pending_date: string;
    approve_date: string;
    remark: string;
    status: string;
}