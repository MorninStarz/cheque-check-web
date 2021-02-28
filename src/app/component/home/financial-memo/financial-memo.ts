export class FinancialMemoForm {
    customer_id: string;
    pending_date_from: any;
    pending_date_to: any;
}

export class FinancialMemoItem {
    no: number;
    customer_name: string;
    amount: string;
    type: 'เช็ค' | 'โอน';
    cheque_no: string;
    pending_date: any;
    transfer_date: any;
}