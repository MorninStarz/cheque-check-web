export class Transferred {
    amount: string;
    transfer_date: any;
}

export class TransferredItem {
    is_error = false;
    no: number;
    amount: string;
    transfer_date: any;
    customer_id: string;
}

export class TransferredUnmatchItem {
    is_error = false;
    no: number;
    amount: string;
    transfer_date: any;
    customer_id: string;
}

export class TransferredSuccessItem {
    no: number;
    amount: string;
    transfer_date: any;
    customer_name: string;
}

export class TransferredReq {
    amount: string;
    transfer_date: any;
    customer_id: string;
}