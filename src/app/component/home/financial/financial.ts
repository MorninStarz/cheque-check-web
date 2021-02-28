export class FinancialForm {
    customer_id: string = '';
}

export class FinancialItem {
    no: number;
    customer_name: string;
    expect_amount: string;
    actual_amount: string;
    balance: number;
}