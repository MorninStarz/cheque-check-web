export class EditChequeForm {
    cheque_id: string = '';
    cheque_no: string = '';
    customer_id: string = '';
    bank_id: string = '';
    branch_id: string = '';
    month: string = '';
    amount: string = '';
    pending_date: any = '';
    approve_date: any = '';
    remark: string = '';
    status: 'Waiting' | 'Pending' | 'Approved' | '' = '';
}