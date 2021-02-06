export class DashboardData {
    expected: string = '';
    actual: string = '';
    max: string = '';
    min: string = '';
    due: DashboardDue[] = [];
    current_date: any = '';
}

export class DashboardDue {
    customer_id: string;
    name: string;
    lastname: string;
    due_date: any;
    expect_amount: string;
    actual_amount: string;
    overdue: any;
    pass_due_date: string;
}