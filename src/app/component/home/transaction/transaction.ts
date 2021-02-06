export class TransactionForm {
    cheque_no: string;
    customer_id: string;
    account_id: string;
    amount: string;
    status: string;
    date_from: any;
    date_to: any;
}

export class TransactionTable {
    no: number;
    cheque_no: string;
    customer_name: string;
    account_no: string;
    remark: string;
    amount: string;
    cheque_status: 'Waiting' | 'Pending' | 'Approve';
    transacion_date: string;
}