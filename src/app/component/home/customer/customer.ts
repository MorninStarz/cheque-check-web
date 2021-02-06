export class CustomerTable {
    no: number;
    customer_id: string;
    name: string;
    lastname: string;
    mobile: string;
    expect: number;
    actual: number;
    due_date: any;
    create_date: any;
    update_date: any;
}

export class CustomerForm {
    name: string = '';
    lastname: string = '';
    mobile: string = '';
    account_no: string = '';
    start_date: string = '';
    end_date: string = '';
}