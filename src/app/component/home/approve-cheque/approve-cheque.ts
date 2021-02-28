export class ApproveChequeForm {
    cheque_no: string = '';
    customer_id: string = '';
    bank_id: string = '';
    branch_id: string = '';
    pending_date_from: any = '';
    pending_date_to: any = '';
    approve_date_from: any = '';
    approve_date_to: any = '';
    amount: string = '';
}

export class ApproveChequeItem {
    is_edit = false;
    is_date_error = false;
    is_remark_error = false;
    cheque_id: string;
    cheque_no: string;
    customer_name: string;
    bank_name: string;
    branch_name: string;
    month: string;
    amount: string;
    pending_date: string;
    approve_date: string;
    pass_date: string;
    remark: string;
}